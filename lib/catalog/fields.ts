import { type BookContent, LEVELS, TOPICS } from "./schema";

/** Every field of an entry with its Hebrew label and how to read it as text (for diffs and previews). */
export const ENTRY_FIELDS: [label: string, read: (c: BookContent) => string][] = [
  ["כותרת", (c) => c.title],
  ["סופר/ת", (c) => c.author ?? ""],
  ["נושאים", (c) => c.topics.map((t) => TOPICS[t]).join(", ")],
  ["רמת קריאה", (c) => LEVELS[c.level].book],
  ["חריזה ומשקל", (c) => c.linguistic.rhyme],
  ["אוצר מילים", (c) => c.linguistic.vocabulary],
  ["טיפוגרפיה", (c) => c.linguistic.typography],
  ["הבעיה", (c) => c.thematic.problem],
  ["המניע", (c) => c.thematic.motive],
  ["הטוויסט", (c) => c.thematic.twist],
  ["קול פנימי", (c) => c.psych.innerVoice],
  ["התמודדות עם פחד", (c) => c.psych.copingWithFear],
  ["תוצאה לא צפויה", (c) => c.psych.unexpectedOutcome],
  ["איורים", (c) => c.visuals],
  ["שאלות להורה", (c) => c.mediation.map((m) => `${m.question} — ${m.explanation}`).join("\n")],
];
