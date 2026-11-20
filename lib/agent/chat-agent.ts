import "server-only";

import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { LEVELS, ProposalSchema, TOPICS } from "@/lib/catalog/schema";
import { readCatalog } from "@/lib/catalog/store";
import { commitDraft, commitErrorMessage } from "@/lib/chat/commit";
import { type Chat, type Draft, SourceSchema } from "@/lib/chat/types";
import { AGENT_MODEL, getAnthropic } from "./client";
import { ACCURACY_RULES, CATALOG_GUIDE, PROPOSAL_JSON_SCHEMA, standingInstructionsBlock, strictObject } from "./prompt";

type Tool = Anthropic.Beta.Messages.BetaTool;
type ToolResult = Anthropic.Beta.Messages.BetaToolResultBlockParam;

/** Tool rounds per editor message (each round may also run several web searches). */
const MAX_ROUNDS = 12;

export class ChatAgentError extends Error {}

export type ChatAgentEvent =
  | { type: "text"; delta: string }
  | { type: "search"; query: string }
  | { type: "tool"; name: string }
  | { type: "draft"; draft: Draft }
  | { type: "saved"; bookId: string; created: boolean };

const TOOLS: Tool[] = [
  {
    name: "read_catalog",
    description:
      "Read the catalog. With an empty book_id, lists every book (id, title, author, topics, level, published). With a book_id, returns that book's full entry. Use it to check whether a book is already in the catalog and to match the style of existing entries.",
    strict: true,
    input_schema: strictObject({
      book_id: { type: "string", description: "A book id from the list, or an empty string for the list." },
    }) as Tool["input_schema"],
  },
  {
    name: "update_draft",
    description:
      "Replace the working catalog entry shown to the editor in the draft panel. Send the full entry every time, not only the changed fields. The editor reads the draft there, so don't repeat the entry in your chat reply.",
    strict: true,
    input_schema: strictObject({
      entry: PROPOSAL_JSON_SCHEMA,
      notes: {
        type: "string",
        description:
          "In Hebrew, for the editor: what you could not verify, open questions, and how confident you are. Empty if nothing is open.",
      },
      sources: {
        type: "array",
        items: strictObject({ title: { type: "string" }, url: { type: "string" } }),
        description: "Pages you actually read that support the entry.",
      },
    }) as Tool["input_schema"],
  },
  {
    name: "save_to_catalog",
    description:
      "Save the current draft to the catalog. Call this only when the editor explicitly asks to add or save the book. A new book is saved unpublished and marked unverified, for the editor to review and publish; if this chat is already linked to a book, its text is replaced with the draft.",
    strict: true,
    input_schema: strictObject({}) as Tool["input_schema"],
  },
];

/** Fixed part of the chat's system prompt; the editor's standing instructions are appended per turn. */
export const CHAT_SYSTEM_PROMPT = `You are the research partner of the editor of a children's-book catalog. You work together in a chat: the editor brings a book (or a question), you research it and discuss it, and together you build its catalog entry.

${CATALOG_GUIDE}

${ACCURACY_RULES}

How to work in this chat:
- Reply in Hebrew, conversationally and briefly: what you found, what you could not confirm, what you suggest. Write plain text without Markdown formatting (no ** or #); short paragraphs and simple "-" lists are fine.
- When the editor names a new book, check read_catalog first: if it is already in the catalog, say so and ask whether to work on the existing entry. Read one or two existing entries to match their style before your first draft.
- Keep the working entry in the draft panel with update_draft, and call it whenever the entry changes. In the chat, summarize what changed rather than pasting the entry.
- Put what you could not verify in the draft's notes, and list the supporting pages in its sources.
- The editor has the final say. When they ask for a change, apply it to the draft. If you think it makes the entry less accurate, say so briefly once, with an alternative; if they confirm, apply it without arguing again.
- Only call save_to_catalog when the editor explicitly asks to add or save the book. The catalog only accepts an entry with a title and at least one topic; if the draft has none, ask the editor which topic to use. After saving, tell the editor it is saved unpublished (or updated) and that they can review and publish it from the catalog.`;

/** The system prompt and tool descriptions, as the admin "instructions" panel shows them. */
export const CHAT_PROMPT_PREVIEW = `${CHAT_SYSTEM_PROMPT}

Tools:
- web_search: searches the web (up to 8 searches per step).
${TOOLS.map((t) => `- ${t.name}: ${t.description}`).join("\n")}`;

const ReadInput = z.object({ book_id: z.string() });
const DraftInput = z.object({
  entry: ProposalSchema.extend({ author: z.string() }),
  notes: z.string(),
  sources: z.array(SourceSchema),
});

async function readCatalogTool(bookId: string): Promise<string> {
  const { books } = await readCatalog();
  if (!bookId.trim()) {
    if (!books.length) return "The catalog is empty.";
    return books
      .map(
        (b) =>
          `${b.id} | ${b.title} | ${b.author ?? "—"} | ${b.topics.map((t) => TOPICS[t]).join(", ")} | ${LEVELS[b.level].book} | ${b.published ? "published" : "draft"}`,
      )
      .join("\n");
  }
  const book = books.find((b) => b.id === bookId.trim());
  if (!book) throw new ChatAgentError(`No book with id "${bookId}". Call read_catalog with an empty book_id for the list.`);
  const { title, author, topics, level, linguistic, thematic, psych, visuals, mediation } = book;
  return JSON.stringify({ title, author, topics, level, linguistic, thematic, psych, visuals, mediation }, null, 2);
}

async function runTool(
  block: Anthropic.Beta.Messages.BetaToolUseBlock,
  chat: Chat,
  emit: (e: ChatAgentEvent) => void,
): Promise<ToolResult> {
  const result = (content: string, isError = false): ToolResult => ({
    type: "tool_result",
    tool_use_id: block.id,
    content,
    ...(isError ? { is_error: true } : {}),
  });

  try {
    switch (block.name) {
      case "read_catalog": {
        const input = ReadInput.parse(block.input);
        return result(await readCatalogTool(input.book_id));
      }
      case "update_draft": {
        const input = DraftInput.parse(block.input);
        chat.draft = {
          content: { ...input.entry, author: input.entry.author.trim() || null },
          notes: input.notes,
          sources: input.sources,
          updatedAt: new Date().toISOString(),
        };
        if (input.entry.title.trim()) chat.title = input.entry.title.trim();
        emit({ type: "draft", draft: chat.draft });
        return result("The draft panel now shows this entry.");
      }
      case "save_to_catalog": {
        try {
          const saved = await commitDraft(chat);
          emit({ type: "saved", ...saved });
          return result(
            saved.created
              ? `Saved as a new unpublished, unverified book (id ${saved.bookId}). Further saves in this chat update that book.`
              : `Updated book ${saved.bookId} with the draft. Its published and review status did not change.`,
          );
        } catch (error) {
          return result(`Not saved: ${commitErrorMessage(error)}`, true);
        }
      }
      default:
        return result(`Unknown tool ${block.name}.`, true);
    }
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? `Invalid input: ${error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`
        : error instanceof Error
          ? error.message
          : String(error);
    return result(message, true);
  }
}

/**
 * Runs one editor message through the agent: streams text, runs tools, and
 * appends everything to chat.messages. On failure the chat's history is
 * rolled back to before the message, so it can simply be sent again.
 */
export async function runChatTurn(opts: {
  chat: Chat;
  userContent: Anthropic.Beta.Messages.BetaContentBlockParam[];
  instructions: string;
  emit: (e: ChatAgentEvent) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { chat, userContent, instructions, emit, signal } = opts;
  const startLength = chat.messages.length;
  chat.messages.push({ role: "user", content: userContent });
  const system = CHAT_SYSTEM_PROMPT + standingInstructionsBlock(instructions);

  try {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const stream = getAnthropic().beta.messages.stream(
        {
          model: AGENT_MODEL,
          max_tokens: 64000,
          output_config: { effort: "high" },
          // If a safety classifier declines, the API retries on a fallback model in the same call.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          // Caches the conversation so far; each new turn only pays for what's new.
          cache_control: { type: "ephemeral" },
          system,
          // Basic web search: the dynamic-filtering variant needs code execution,
          // which this organization (HIPAA-configured) doesn't allow.
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 }, ...TOOLS],
          messages: chat.messages,
        },
        { signal },
      );

      stream.on("text", (delta) => emit({ type: "text", delta }));
      stream.on("contentBlock", (block) => {
        if (block.type === "server_tool_use" && block.name === "web_search") {
          const query = (block.input as { query?: unknown }).query;
          emit({ type: "search", query: typeof query === "string" ? query : "" });
        } else if (block.type === "tool_use") {
          emit({ type: "tool", name: block.name });
        }
      });

      const message = await stream.finalMessage();
      if (message.stop_reason === "refusal") {
        throw new ChatAgentError("הבקשה נחסמה על ידי מסנני הבטיחות של המודל. נסו לנסח אחרת.");
      }
      if (message.stop_reason === "max_tokens") {
        throw new ChatAgentError("תשובת הסוכן נקטעה (חריגה מאורך מקסימלי).");
      }

      chat.messages.push({ role: "assistant", content: message.content });
      // Long server-side searches can pause; send the turn back to continue it.
      if (message.stop_reason === "pause_turn") continue;

      const toolUses = message.content.filter(
        (b): b is Anthropic.Beta.Messages.BetaToolUseBlock => b.type === "tool_use",
      );
      if (message.stop_reason !== "tool_use" || !toolUses.length) return;

      const results: ToolResult[] = [];
      for (const block of toolUses) results.push(await runTool(block, chat, emit));
      chat.messages.push({ role: "user", content: results });
    }
    throw new ChatAgentError("הסוכן עבד יותר מדי צעדים בלי לסיים. נסו לבקש משהו ממוקד יותר.");
  } catch (error) {
    chat.messages.length = startLength;
    throw error;
  }
}
