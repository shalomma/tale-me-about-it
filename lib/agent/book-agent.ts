import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  type AgentReview,
  type BookContent,
  LEVEL_IDS,
  ProposalSchema,
  LEVELS,
  TOPIC_IDS,
  TOPICS,
} from "@/lib/catalog/schema";
import type { AgentProgress } from "./events";

export const AGENT_MODEL = "claude-opus-5-5";
const SUBMIT_TOOL_NAME = "submit_book_review";
const MAX_TURNS = 8;

export type AgentMode = "verify" | "draft";

export class AgentError extends Error {}

const str = { type: "string" } as const;
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

/** The agent's only way to finish: one call with the whole review. */
const submitTool: Anthropic.Beta.Messages.BetaTool = {
  name: SUBMIT_TOOL_NAME,
  description:
    "Submit the final review of the book. Call this exactly once, after researching, as your last action.",
  strict: true,
  input_schema: obj({
    verdict: {
      type: "string",
      enum: ["verified", "needs_changes", "not_found"],
      description:
        "verified: the book exists and the entry is accurate. needs_changes: the book exists but the entry has errors. not_found: you could not confirm the book exists as described.",
    },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    summary: { ...str, description: "2-4 sentences in Hebrew for the editor: what you checked and what you found." },
    issues: {
      type: "array",
      items: str,
      description: "Each concrete problem with the current entry, in Hebrew. Empty if none.",
    },
    sources: {
      type: "array",
      items: obj({ title: str, url: str }),
      description: "Pages you actually read that support your findings.",
    },
    proposal: obj({
      title: str,
      author: { ...str, description: "Author name in Hebrew, or an empty string if unknown." },
      topics: { type: "array", items: { type: "string", enum: TOPIC_IDS } },
      level: { type: "string", enum: LEVEL_IDS },
      linguistic: obj({ rhyme: str, vocabulary: str, typography: str }),
      thematic: obj({ problem: str, motive: str, twist: str }),
      psych: obj({ innerVoice: str, copingWithFear: str, unexpectedOutcome: str }),
      visuals: str,
      mediation: { type: "array", items: obj({ question: str, explanation: str }) },
    }),
  }) as Anthropic.Beta.Messages.BetaTool.InputSchema,
};

const SubmitInputSchema = z.object({
  verdict: z.enum(["verified", "needs_changes", "not_found"]),
  confidence: z.enum(["high", "medium", "low"]),
  summary: z.string(),
  issues: z.array(z.string()),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
  proposal: ProposalSchema.extend({ author: z.string() }),
});

const SYSTEM_PROMPT = `You support the editor of "ספרו לי על זה" (Tale Me About It), a Hebrew bibliotherapy app. It recommends picture books to parents of children aged 3-5 who are going through something hard, and gives the parent questions to ask while reading.

Each catalog entry describes one real, published children's book:
- title, author (Hebrew)
- topics: which of these situations the book genuinely helps with: ${TOPIC_IDS.map((t) => `${t} (${TOPICS[t]})`).join(", ")}
- level: how much listening experience the child needs: ${LEVEL_IDS.map((l) => `${l} (${LEVELS[l].book})`).join(", ")}
- linguistic: rhyme and meter, vocabulary, typography
- thematic: the problem, the motive, the twist
- psych: inner voice, coping with fear, unexpected outcome
- visuals: what the illustrations do
- mediation: about five questions for the parent to ask, each with a short explanation of why it helps

Your job is accuracy. A wrong book in front of a frightened child is worse than no book.
- Use web search to confirm the book exists, who wrote it, and what actually happens in it. Hebrew sources (publisher pages, the National Library of Israel, Simania, book stores) are usually best for Hebrew titles; translated books also have sources in their original language.
- Never invent plot details. If you cannot confirm something, say so in issues and keep the related text general rather than specific.
- Only list a topic if the book's real story addresses it. If an entry claims a topic the plot doesn't support, flag it. If the book fits none of the topics, return an empty topics list and explain in issues which situations it does suit.
- Write all proposal text in natural Hebrew, in the warm, professional style of the existing entries. Keep accurate existing wording rather than rewriting it for its own sake.
- Mediation questions are for a parent talking to a 3-5 year old: short, concrete, open-ended, never leading or frightening.

Finish by calling ${SUBMIT_TOOL_NAME} once with your complete review.`;

function userPrompt(mode: AgentMode, content: BookContent, notes: string): string {
  const extra = notes.trim() ? `\n\nEditor's notes:\n${notes.trim()}` : "";
  if (mode === "verify") {
    return `Fact-check this catalog entry. Confirm the book and author exist, compare the entry against what the book is actually about, and propose a corrected entry (identical where it is already right).${extra}

<entry>
${JSON.stringify(content, null, 2)}
</entry>`;
  }
  return `Research this book and draft a complete catalog entry for it. Fill every field. If the book can't be found, use verdict "not_found" and leave the analysis fields as empty strings.${extra}

Title: ${content.title}
Author: ${content.author ?? "(unknown)"}
Topics the editor has in mind: ${content.topics.join(", ")}`;
}

let client: Anthropic | null = null;
function getClient() {
  // Reads ANTHROPIC_API_KEY from the environment.
  client ??= new Anthropic();
  return client;
}

export async function runBookAgent(opts: {
  mode: AgentMode;
  content: BookContent;
  notes?: string;
  onProgress?: (p: AgentProgress) => void;
  signal?: AbortSignal;
}): Promise<AgentReview> {
  const { mode, content, notes = "", onProgress, signal } = opts;
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [
    { role: "user", content: userPrompt(mode, content, notes) },
  ];
  let nudged = false;

  onProgress?.({ kind: "status", text: "הסוכן התחיל לעבוד" });

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const stream = getClient().beta.messages.stream(
      {
        model: AGENT_MODEL,
        max_tokens: 64000,
        output_config: { effort: "high" },
        // If a safety classifier declines, the API retries on a fallback model in the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        // The basic web search variant: the newer web_search_20260209 filters results with
        // code execution, which this organization (HIPAA-configured) doesn't allow.
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 }, submitTool],
        messages,
      },
      { signal },
    );

    stream.on("contentBlock", (block) => {
      if (block.type === "server_tool_use" && block.name === "web_search") {
        const query = (block.input as { query?: unknown }).query;
        onProgress?.({ kind: "search", query: typeof query === "string" ? query : "" });
      } else if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        onProgress?.({ kind: "results", count: block.content.length });
      }
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new AgentError("הבקשה נחסמה על ידי מסנני הבטיחות של המודל.");
    }
    if (message.stop_reason === "max_tokens") {
      throw new AgentError("תשובת הסוכן נקטעה (חריגה מאורך מקסימלי).");
    }

    const submit = message.content.find(
      (b): b is Anthropic.Beta.Messages.BetaToolUseBlock =>
        b.type === "tool_use" && b.name === SUBMIT_TOOL_NAME,
    );
    if (submit) {
      const parsed = SubmitInputSchema.safeParse(submit.input);
      if (!parsed.success) {
        throw new AgentError(`הסוכן החזיר מבנה לא תקין: ${parsed.error.issues[0]?.message ?? ""}`);
      }
      const { proposal, ...rest } = parsed.data;
      return {
        ...rest,
        mode,
        proposal: { ...proposal, author: proposal.author.trim() || null },
        model: message.model,
        ranAt: new Date().toISOString(),
      };
    }

    // Long server-side searches can pause; send the turn back to continue it.
    messages.push({ role: "assistant", content: message.content });
    if (message.stop_reason === "pause_turn") continue;

    if (nudged) break;
    nudged = true;
    messages.push({
      role: "user",
      content: `Please finish now by calling ${SUBMIT_TOOL_NAME} with your review.`,
    });
  }

  throw new AgentError("הסוכן סיים בלי להגיש סקירה. נסו להריץ שוב.");
}
