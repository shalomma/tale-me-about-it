import "server-only";

import Anthropic from "@anthropic-ai/sdk";

export const AGENT_MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;

/** Shared SDK client. Reads ANTHROPIC_API_KEY from the environment. */
export function getAnthropic() {
  client ??= new Anthropic();
  return client;
}
