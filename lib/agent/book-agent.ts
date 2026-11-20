import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { type AgentReview, type BookContent, ProposalSchema } from "@/lib/catalog/schema";
import type { AgentProgress } from "./events";
import { AGENT_MODEL, getAnthropic } from "./client";
import {
  ACCURACY_RULES,
  CATALOG_GUIDE,
  PROPOSAL_JSON_SCHEMA,
  standingInstructionsBlock,
  strictObject,
} from "./prompt";
import { readAgentSettings } from "./settings";

const SUBMIT_TOOL_NAME = "submit_book_review";
const MAX_TURNS = 8;

export type AgentMode = "verify" | "draft";

export class AgentError extends Error {}

/** The agent's only way to finish: one call with the whole review. */
const submitTool: Anthropic.Beta.Messages.BetaTool = {
  name: SUBMIT_TOOL_NAME,
  description:
    "Submit the final review of the book. Call this exactly once, after researching, as your last action.",
  strict: true,
  input_schema: strictObject({
    verdict: {
      type: "string",
      enum: ["verified", "needs_changes", "not_found"],
      description:
        "verified: the book exists and the entry is accurate. needs_changes: the book exists but the entry has errors. not_found: you could not confirm the book exists as described.",
    },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    summary: { type: "string", description: "2-4 sentences in Hebrew for the editor: what you checked and what you found." },
    issues: {
      type: "array",
      items: { type: "string" },
      description: "Each concrete problem with the current entry, in Hebrew. Empty if none.",
    },
    sources: {
      type: "array",
      items: strictObject({ title: { type: "string" }, url: { type: "string" } }),
      description: "Pages you actually read that support your findings.",
    },
    proposal: PROPOSAL_JSON_SCHEMA,
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

/** Fixed part of the system prompt; the editor's standing instructions are appended per run. */
export const BOOK_AGENT_SYSTEM_PROMPT = `You support the editor of a children's-book catalog.

${CATALOG_GUIDE}

${ACCURACY_RULES}
- In the review, list every problem with the entry in issues, including topics the plot doesn't support. If the book fits none of the topics, return an empty topics list and explain in issues which situations it does suit.

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
  const { instructions } = await readAgentSettings();
  const system = BOOK_AGENT_SYSTEM_PROMPT + standingInstructionsBlock(instructions);

  onProgress?.({ kind: "status", text: "הסוכן התחיל לעבוד" });

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const stream = getAnthropic().beta.messages.stream(
      {
        model: AGENT_MODEL,
        max_tokens: 64000,
        output_config: { effort: "high" },
        // If a safety classifier declines, the API retries on a fallback model in the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system,
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
