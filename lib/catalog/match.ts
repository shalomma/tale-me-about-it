import { type Level, LEVEL_RANK, type Topic } from "./schema";

type Matchable = { topics: Topic[]; level: Level };

/**
 * Books for a topic, best reading-level fit first: an exact level match,
 * then one step easier, then one step harder, and so on.
 */
export function matchBooks<T extends Matchable>(books: T[], topic: Topic, level: Level): T[] {
  const target = LEVEL_RANK[level];
  const score = (b: T) => {
    const diff = LEVEL_RANK[b.level] - target;
    // Prefer easier over harder at the same distance: a short book is still readable.
    return Math.abs(diff) * 2 + (diff > 0 ? 1 : 0);
  };
  return books
    .filter((b) => b.topics.includes(topic))
    .map((book, index) => ({ book, index, s: score(book) }))
    .sort((a, b) => a.s - b.s || a.index - b.index)
    .map((x) => x.book);
}
