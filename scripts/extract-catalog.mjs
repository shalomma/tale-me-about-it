// One-off: pull the 20-book catalog out of the original Gemini app into data/books.json.
// Usage: node scripts/extract-catalog.mjs reference/gemini-original.html data/books.json
import fs from "node:fs";
import vm from "node:vm";

const [src = "reference/gemini-original.html", out = "data/books.json"] = process.argv.slice(2);
const html = fs.readFileSync(src, "utf8");

const LEVEL_BY_LABEL = {
  "קורא מתחיל": "beginner",
  "קורא פחות מנוסה": "intermediate",
  "קורא מנוסה מאוד": "experienced",
};

// Parenthesised notes in titles that are topic hints, not authors.
const NOT_AUTHORS = new Set(["גן חדש", "עובר דירה", "ספרות מתפתחת"]);

const LABELS = {
  linguistic: { "חריזה ומשקל": "rhyme", "אוצר מילים": "vocabulary", "טיפוגרפיה פעילה": "typography" },
  thematic: { "הבעיה": "problem", "המניע": "motive", "הטוויסט": "twist" },
  psych: { "קול פנימי": "innerVoice", "התמודדות עם פחד": "copingWithFear", "תוצאה לא צפויה": "unexpectedOutcome" },
};

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** "<b>הבעיה:</b> טקסט" -> ["הבעיה", "טקסט"] */
function splitLabel(item) {
  const m = item.match(/^\s*<b>([^<:]+):<\/b>\s*([\s\S]*)$/);
  if (!m) throw new Error(`Unlabelled item: ${item}`);
  return [m[1].trim(), decode(m[2])];
}

function section(kind, items) {
  if (items.length !== 3) throw new Error(`${kind}: expected 3 items, got ${items.length}`);
  const result = {};
  for (const item of items) {
    const [label, value] = splitLabel(item);
    const key = LABELS[kind][label];
    if (!key) throw new Error(`${kind}: unknown label "${label}"`);
    result[key] = value;
  }
  return result;
}

function parseTitle(raw) {
  const clean = decode(raw).replace(/^\d+\.\s*/, "");
  const m = clean.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!m) return { title: clean, author: null };
  const [, title, paren] = m;
  if (NOT_AUTHORS.has(paren.trim())) return { title, author: null };
  return { title, author: paren.trim() };
}

// --- Books 1-6: static <details> markup -----------------------------------
const gridStart = html.indexOf('id="books-grid"');
const gridEnd = html.indexOf("showMoreBooksBtn", gridStart);
const grid = html.slice(gridStart, gridEnd);
const staticBooks = grid
  .split("<details")
  .slice(1)
  .map((block) => {
    const title = block.match(/<summary[\s\S]*?<span>([^<]+)<\/span>/)[1];
    const level = decode(block.match(/rounded-full whitespace-nowrap">([^<]+)</)[1]);
    const lists = [...block.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/g)].map((m) =>
      [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => li[1]),
    );
    const visuals = decode(block.match(/fa-paint-brush[\s\S]*?<p>([\s\S]*?)<\/p>/)[1]);
    const mediation = [
      ...block.matchAll(/<strong>([\s\S]*?)<\/strong><br><span[^>]*>([\s\S]*?)<\/span>/g),
    ].map((m) => ({ q: decode(m[1]), exp: decode(m[2]) }));
    return { title, level, linguistic: lists[0], thematic: lists[1], psych: lists[2], visuals, mediation };
  });

// --- Books 7-20: the `remainingBooks` array literal ------------------------
const arrStart = html.indexOf("const remainingBooks = [");
const arrEnd = html.indexOf("];", arrStart);
const literal = html.slice(html.indexOf("[", arrStart), arrEnd + 1);
// Plain object/array literals only; evaluated in an empty context with a timeout.
const dynamicBooks = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });

const now = new Date().toISOString();
const books = [...staticBooks, ...dynamicBooks].map((b, i) => {
  const { title, author } = parseTitle(b.title);
  const level = LEVEL_BY_LABEL[decode(b.level)];
  if (!level) throw new Error(`Unknown level "${b.level}" on ${b.title}`);
  // Key order matches lib/catalog/schema.ts, so saves from the admin keep diffs minimal.
  return {
    title,
    author,
    topics: ["transitions"],
    level,
    linguistic: section("linguistic", b.linguistic),
    thematic: section("thematic", b.thematic),
    psych: section("psych", b.psych),
    visuals: decode(b.visuals),
    mediation: (b.mediation ?? []).map((m) => ({ question: decode(m.q), explanation: decode(m.exp) })),
    id: `book-${String(i + 1).padStart(2, "0")}`,
    // Already live on the current site, so they stay published; none are fact-checked yet.
    published: true,
    verification: { status: "unverified", note: "", updatedAt: null },
    agentReview: null,
    createdAt: now,
    updatedAt: now,
  };
});

fs.writeFileSync(out, JSON.stringify({ version: 1, books }, null, 2) + "\n");
console.log(`Wrote ${books.length} books to ${out}`);
for (const b of books) {
  console.log(`${b.id}  ${b.level.padEnd(12)}  ${b.mediation.length}q  ${b.title}${b.author ? ` — ${b.author}` : ""}`);
}
