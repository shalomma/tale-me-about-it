import { z } from "zod";

/**
 * Topics a parent can pick in the smart-match form.
 * Keys are stable ids stored in the catalog; labels are what people see.
 */
export const TOPICS = {
  transitions: "מעבר דירה או גן חדש",
  illness: "התמודדות עם מחלה/ניתוח",
  divorce: "גירושין או פרידה של הורים",
  social: "דחייה חברתית או מריבה עם חבר",
  loss: "התמודדות עם אובדן",
} as const;

export type Topic = keyof typeof TOPICS;
export const TOPIC_IDS = Object.keys(TOPICS) as [Topic, ...Topic[]];

/**
 * Reading experience. The original Gemini app used two different label sets:
 * one on the books ("קורא מתחיל"...) and one in the parent form ("חסר ניסיון"...).
 * This maps them onto one scale, ordered from least to most experienced.
 */
export const LEVELS = {
  beginner: { book: "קורא מתחיל", parent: "חסר ניסיון", emoji: "📗" },
  intermediate: { book: "קורא פחות מנוסה", parent: "לעיתים רחוקות", emoji: "📖" },
  experienced: { book: "קורא מנוסה מאוד", parent: "מנוסה מאוד", emoji: "📚" },
} as const;

export type Level = keyof typeof LEVELS;
export const LEVEL_IDS = Object.keys(LEVELS) as [Level, ...Level[]];
export const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, experienced: 2 };

export const VERIFICATION = {
  unverified: "טרם נבדק",
  verified: "אומת",
  needs_changes: "דורש תיקון",
  not_found: "לא נמצא",
} as const;

export type VerificationStatus = keyof typeof VERIFICATION;
export const VERIFICATION_IDS = Object.keys(VERIFICATION) as [
  VerificationStatus,
  ...VerificationStatus[],
];

const text = z.string().trim();

export const MediationSchema = z.object({
  question: text.min(1),
  explanation: text,
});

/** The analysis an editor (or the agent) writes about a book. */
export const BookContentSchema = z.object({
  title: text.min(1),
  author: text.nullable(),
  topics: z.array(z.enum(TOPIC_IDS)).min(1),
  level: z.enum(LEVEL_IDS),
  linguistic: z.object({ rhyme: text, vocabulary: text, typography: text }),
  thematic: z.object({ problem: text, motive: text, twist: text }),
  psych: z.object({ innerVoice: text, copingWithFear: text, unexpectedOutcome: text }),
  visuals: text,
  mediation: z.array(MediationSchema),
});

export type BookContent = z.infer<typeof BookContentSchema>;

/**
 * What the agent proposes. Topics may be empty: "this book doesn't really fit any
 * of our topics" is a valid finding. The editor still requires one before saving.
 */
export const ProposalSchema = BookContentSchema.extend({ topics: z.array(z.enum(TOPIC_IDS)) });

export const AgentReviewSchema = z.object({
  mode: z.enum(["verify", "draft"]),
  verdict: z.enum(["verified", "needs_changes", "not_found"]),
  confidence: z.enum(["high", "medium", "low"]),
  summary: z.string(),
  issues: z.array(z.string()),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
  proposal: ProposalSchema,
  model: z.string(),
  ranAt: z.string(),
});

export type AgentReview = z.infer<typeof AgentReviewSchema>;

export const BookSchema = BookContentSchema.extend({
  id: z.string().regex(/^[a-z0-9-]+$/),
  published: z.boolean(),
  verification: z.object({
    status: z.enum(VERIFICATION_IDS),
    note: z.string(),
    updatedAt: z.string().nullable(),
  }),
  agentReview: AgentReviewSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Book = z.infer<typeof BookSchema>;

export const CatalogSchema = z.object({
  version: z.literal(1),
  books: z.array(BookSchema),
});

export type Catalog = z.infer<typeof CatalogSchema>;

export function emptyContent(): BookContent {
  return {
    title: "",
    author: null,
    topics: ["transitions"],
    level: "intermediate",
    linguistic: { rhyme: "", vocabulary: "", typography: "" },
    thematic: { problem: "", motive: "", twist: "" },
    psych: { innerVoice: "", copingWithFear: "", unexpectedOutcome: "" },
    visuals: "",
    mediation: [],
  };
}
