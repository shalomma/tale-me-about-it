import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AgentError, runBookAgent } from "@/lib/agent/book-agent";
import type { AgentStreamEvent } from "@/lib/agent/events";
import { isAdmin } from "@/lib/auth/guard";
import { BookContentSchema } from "@/lib/catalog/schema";
import { updateCatalog } from "@/lib/catalog/store";

// Research with web search can take a few minutes.
export const maxDuration = 300;

const RequestSchema = z.object({
  mode: z.enum(["verify", "draft"]),
  bookId: z.string().nullable(),
  // Drafts start from just a title, so analysis fields may be empty here.
  content: BookContentSchema.extend({ topics: BookContentSchema.shape.topics.min(0) }),
  notes: z.string().max(2000).default(""),
});

/**
 * Runs the book agent and streams newline-delimited JSON events:
 * progress lines while it researches, then one result or error line.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY לא מוגדר בסביבה." }, { status: 500 });
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const { mode, bookId, content, notes } = parsed.data;
  if (!content.title.trim()) return Response.json({ error: "חסרה כותרת" }, { status: 400 });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: AgentStreamEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        const review = await runBookAgent({
          mode,
          content: { ...content, topics: content.topics.length ? content.topics : ["transitions"] },
          notes,
          signal: request.signal,
          onProgress: (p) => send({ type: "progress", ...p }),
        });
        // Keep the latest review on the book so it survives a page reload.
        if (bookId) {
          await updateCatalog((catalog) => {
            const book = catalog.books.find((b) => b.id === bookId);
            if (book) book.agentReview = review;
          });
        }
        send({ type: "result", review });
      } catch (error) {
        let message = "שגיאה לא צפויה בהרצת הסוכן.";
        if (error instanceof AgentError) message = error.message;
        else if (error instanceof Anthropic.RateLimitError) message = "חריגה ממגבלת הקצב של ה-API. נסו שוב בעוד דקה.";
        else if (error instanceof Anthropic.AuthenticationError) message = "מפתח ה-API של Anthropic לא תקין.";
        else if (error instanceof Anthropic.APIError) message = `שגיאת API (${error.status}): ${error.message}`;
        console.error("[book-agent]", error);
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
