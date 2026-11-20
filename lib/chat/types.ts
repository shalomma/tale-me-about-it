import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ProposalSchema } from "@/lib/catalog/schema";

type MessageParam = Anthropic.Beta.Messages.BetaMessageParam;

export const SourceSchema = z.object({ title: z.string(), url: z.string() });
export type Source = z.infer<typeof SourceSchema>;

/** The working catalog entry the agent keeps up to date during a chat. */
export const DraftSchema = z.object({
  content: ProposalSchema,
  notes: z.string(),
  sources: z.array(SourceSchema),
  updatedAt: z.string(),
});
export type Draft = z.infer<typeof DraftSchema>;

export const ChatSchema = z.object({
  id: z.string().regex(/^chat-[a-z0-9]+$/),
  title: z.string(),
  /** The catalog book this chat edits: set from the start, or once the draft is first saved. */
  bookId: z.string().nullable(),
  /** Full API history, append-only (thinking and search results are replayed as-is). */
  messages: z.array(z.custom<MessageParam>((m) => typeof m === "object" && m !== null)),
  draft: DraftSchema.nullable(),
  savedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Chat = z.infer<typeof ChatSchema>;

export type ChatSummary = Pick<Chat, "id" | "title" | "bookId" | "updatedAt">;

/** What the UI shows for a chat; derived from the API history. */
export type TranscriptItem =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string; sources: Source[] }
  | { kind: "search"; query: string }
  | { kind: "tool"; label: string };

/** One line of the NDJSON stream from POST /api/admin/chat. */
export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | { type: "search"; query: string }
  | { type: "tool"; label: string }
  | { type: "draft"; draft: Draft }
  | {
      type: "done";
      /** null when a new chat failed before anything was worth keeping. */
      id: string | null;
      transcript: TranscriptItem[];
      draft: Draft | null;
      bookId: string | null;
      savedAt: string | null;
      title: string;
    }
  | { type: "error"; message: string };

/** Text blocks starting with this tag carry context for the model and are hidden in the UI. */
export const CONTEXT_TAG = "<current_entry";

export const TOOL_LABELS: Record<string, string> = {
  read_catalog: "עיון בקטלוג",
  update_draft: "עדכון הטיוטה",
  save_to_catalog: "שמירה בקטלוג",
};

export function toTranscript(messages: MessageParam[]): TranscriptItem[] {
  const items: TranscriptItem[] = [];
  for (const message of messages) {
    const blocks =
      typeof message.content === "string" ? [{ type: "text" as const, text: message.content }] : (message.content ?? []);

    if (message.role === "user") {
      const text = blocks
        .flatMap((b) => (b.type === "text" && !b.text.startsWith(CONTEXT_TAG) ? [b.text] : []))
        .join("\n")
        .trim();
      if (text) items.push({ kind: "user", text });
      continue;
    }

    // Assistant: consecutive text blocks (split by citations) form one bubble.
    let bubble: Extract<TranscriptItem, { kind: "assistant" }> | null = null;
    for (const block of blocks) {
      if (block.type === "text") {
        if (!bubble) {
          bubble = { kind: "assistant", text: "", sources: [] };
          items.push(bubble);
        }
        bubble.text += block.text;
        for (const c of block.citations ?? []) {
          if (c.type === "web_search_result_location" && !bubble.sources.some((s) => s.url === c.url)) {
            bubble.sources.push({ title: c.title ?? c.url, url: c.url });
          }
        }
        continue;
      }
      if (block.type === "server_tool_use" && block.name === "web_search") {
        const query = (block.input as { query?: unknown }).query;
        items.push({ kind: "search", query: typeof query === "string" ? query : "" });
        bubble = null;
      } else if (block.type === "tool_use") {
        items.push({ kind: "tool", label: TOOL_LABELS[block.name] ?? block.name });
        bubble = null;
      }
    }
  }
  return items.filter((i) => i.kind !== "assistant" || i.text.trim());
}
