import { LEVEL_IDS, LEVELS, TOPIC_IDS, TOPICS } from "@/lib/catalog/schema";

/**
 * Prompt text shared by the one-shot book agent and the research chat.
 * No server-only imports: the admin UI shows this text as-is.
 */

export const CATALOG_GUIDE = `"ספרו לי על זה" (Tale Me About It) is a Hebrew bibliotherapy app. It recommends picture books to parents of children aged 3-5 who are going through something hard, and gives the parent questions to ask while reading.

Each catalog entry describes one real, published children's book:
- title, author (Hebrew)
- topics: which of these situations the book genuinely helps with: ${TOPIC_IDS.map((t) => `${t} (${TOPICS[t]})`).join(", ")}
- level: how much listening experience the child needs: ${LEVEL_IDS.map((l) => `${l} (${LEVELS[l].book})`).join(", ")}
- linguistic: rhyme and meter, vocabulary, typography
- thematic: the problem, the motive, the twist
- psych: inner voice, coping with fear, unexpected outcome
- visuals: what the illustrations do
- mediation: about five questions for the parent to ask, each with a short explanation of why it helps`;

export const ACCURACY_RULES = `Accuracy comes first. A wrong book in front of a frightened child is worse than no book.
- Use web search to confirm the book exists, who wrote it, and what actually happens in it. Hebrew sources (publisher pages, the National Library of Israel, Simania, book stores) are usually best for Hebrew titles; translated books also have sources in their original language.
- Never invent plot details. If you cannot confirm something, say so and keep the related text general rather than specific.
- Only list a topic if the book's real story addresses it. If the book fits none of the topics, say which situations it does suit.
- Write all entry text in natural Hebrew, in the warm, professional style of the existing entries. Keep accurate existing wording rather than rewriting it for its own sake.
- Mediation questions are for a parent talking to a 3-5 year old: short, concrete, open-ended, never leading or frightening.`;

/** Appended to a system prompt when the editor has saved standing instructions. */
export function standingInstructionsBlock(instructions: string): string {
  const text = instructions.trim();
  if (!text) return "";
  return `\n\n<editor_standing_instructions>
The editor wrote these standing instructions for every session. Follow them unless they conflict with accuracy.
${text}
</editor_standing_instructions>`;
}

const str = { type: "string" } as const;

/** JSON Schema for a strict tool input object: every property required, nothing extra. */
export const strictObject = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

/** JSON Schema of a full catalog entry, used by both agents' tools. */
export const PROPOSAL_JSON_SCHEMA = strictObject({
  title: str,
  author: { ...str, description: "Author name in Hebrew, or an empty string if unknown." },
  topics: { type: "array", items: { type: "string", enum: TOPIC_IDS } },
  level: { type: "string", enum: LEVEL_IDS },
  linguistic: strictObject({ rhyme: str, vocabulary: str, typography: str }),
  thematic: strictObject({ problem: str, motive: str, twist: str }),
  psych: strictObject({ innerVoice: str, copingWithFear: str, unexpectedOutcome: str }),
  visuals: str,
  mediation: { type: "array", items: strictObject({ question: str, explanation: str }) },
});
