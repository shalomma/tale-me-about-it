import type { AgentReview } from "@/lib/catalog/schema";

export type AgentProgress =
  | { kind: "status"; text: string }
  | { kind: "search"; query: string }
  | { kind: "results"; count: number };

/** One line of the NDJSON stream from POST /api/admin/agent. */
export type AgentStreamEvent =
  | ({ type: "progress" } & AgentProgress)
  | { type: "result"; review: AgentReview }
  | { type: "error"; message: string };
