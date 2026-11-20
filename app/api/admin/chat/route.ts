import Anthropic from "@anthropic-ai/sdk";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ChatAgentError, runChatTurn } from "@/lib/agent/chat-agent";
import { readAgentSettings } from "@/lib/agent/settings";
import { isAdmin } from "@/lib/auth/guard";
import { CATALOG_TAG } from "@/lib/catalog/queries";
import { readCatalog } from "@/lib/catalog/store";
import { getChat, newChatId, saveChat } from "@/lib/chat/store";
import { type Chat, type ChatStreamEvent, CONTEXT_TAG, TOOL_LABELS, toTranscript } from "@/lib/chat/types";

// A turn can run several web searches and tool rounds.
export const maxDuration = 300;

const RequestSchema = z.object({
  chatId: z.string().nullable(),
  /** Only for a new chat: start it about this existing catalog book. */
  bookId: z.string().nullable().default(null),
  message: z.string().trim().min(1).max(8000),
});

async function startChat(bookId: string | null, message: string): Promise<{ chat: Chat; context: string | null }> {
  const now = new Date().toISOString();
  const chat: Chat = {
    id: newChatId(),
    title: message.slice(0, 60),
    bookId: null,
    messages: [],
    draft: null,
    savedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  if (!bookId) return { chat, context: null };

  const book = (await readCatalog()).books.find((b) => b.id === bookId);
  if (!book) return { chat, context: null };
  const { title, author, topics, level, linguistic, thematic, psych, visuals, mediation } = book;
  const content = { title, author, topics, level, linguistic, thematic, psych, visuals, mediation };
  chat.bookId = book.id;
  chat.title = book.title;
  chat.draft = { content, notes: "", sources: [], updatedAt: now };
  chat.savedAt = now;
  const context = `${CONTEXT_TAG} id="${book.id}" published="${book.published}">
${JSON.stringify(content, null, 2)}
</current_entry>
This chat is about the existing catalog entry above, which is also the current draft. Saving replaces this book's text.`;
  return { chat, context };
}

/**
 * Sends one editor message to the research chat and streams newline-delimited
 * JSON events: text and activity while the agent works, then the saved state.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY לא מוגדר בסביבה." }, { status: 500 });
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const { chatId, bookId, message } = parsed.data;

  let chat: Chat;
  let context: string | null = null;
  if (chatId) {
    const existing = await getChat(chatId);
    if (!existing) return Response.json({ error: "השיחה לא נמצאה" }, { status: 404 });
    chat = existing;
  } else {
    ({ chat, context } = await startChat(bookId, message));
  }
  const { instructions } = await readAgentSettings();

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // The editor stopped or left: the request signal aborts the turn.
        }
      };

      try {
        await runChatTurn({
          chat,
          instructions,
          userContent: [...(context ? [{ type: "text" as const, text: context }] : []), { type: "text", text: message }],
          signal: request.signal,
          emit: (e) => {
            if (e.type === "tool") send({ type: "tool", label: TOOL_LABELS[e.name] ?? e.name });
            else if (e.type === "saved") revalidateTag(CATALOG_TAG, { expire: 0 });
            else send(e);
          },
        });
      } catch (error) {
        let text = "שגיאה לא צפויה בהרצת הסוכן.";
        if (error instanceof ChatAgentError) text = error.message;
        else if (error instanceof Anthropic.APIUserAbortError) text = "העצירה בוצעה. ההודעה לא נשמרה בשיחה.";
        else if (error instanceof Anthropic.RateLimitError) text = "חריגה ממגבלת הקצב של ה-API. נסו שוב בעוד דקה.";
        else if (error instanceof Anthropic.AuthenticationError) text = "מפתח ה-API של Anthropic לא תקין.";
        else if (error instanceof Anthropic.APIError) text = `שגיאת API (${error.status}): ${error.message}`;
        console.error("[chat-agent]", error);
        send({ type: "error", message: text });
      }

      try {
        // Save even after an error: the draft or a catalog save may have happened mid-turn.
        const persisted = Boolean(chatId) || chat.messages.length > 0;
        if (persisted) await saveChat(chat);
        send({
          type: "done",
          id: persisted ? chat.id : null,
          transcript: toTranscript(chat.messages),
          draft: chat.draft,
          bookId: chat.bookId,
          savedAt: chat.savedAt,
          title: chat.title,
        });
      } catch (error) {
        console.error("[chat-agent] save", error);
        send({ type: "error", message: error instanceof Error ? error.message : "שמירת השיחה נכשלה." });
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
