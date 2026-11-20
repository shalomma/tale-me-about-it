import "server-only";

import { z } from "zod";
import { readJson, writeJson } from "@/lib/storage/json-store";
import { DEFAULT_AGENT_INSTRUCTIONS } from "./default-instructions";

const SETTINGS_PATH = "settings/agent.json";

/** Editor-owned part of the agents' instructions, editable from the admin chat page. */
export const AgentSettingsSchema = z.object({
  instructions: z.string().max(8000),
  updatedAt: z.string().nullable(),
});

export type AgentSettings = z.infer<typeof AgentSettingsSchema>;

export async function readAgentSettings(): Promise<AgentSettings> {
  const parsed = AgentSettingsSchema.safeParse(await readJson(SETTINGS_PATH));
  // Until the editor saves their own, the agents follow the default style guide.
  return parsed.success ? parsed.data : { instructions: DEFAULT_AGENT_INSTRUCTIONS, updatedAt: null };
}

export async function writeAgentSettings(instructions: string): Promise<AgentSettings> {
  const settings = { instructions: instructions.trim(), updatedAt: new Date().toISOString() };
  await writeJson(SETTINGS_PATH, AgentSettingsSchema.parse(settings));
  return settings;
}
