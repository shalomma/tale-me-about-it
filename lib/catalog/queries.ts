import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { Book } from "./schema";
import { readCatalog } from "./store";

/** Cache tag for everything the public site reads from the catalog. */
export const CATALOG_TAG = "catalog";

/** What the public site is allowed to see: no review notes or agent output. */
export type PublicBook = Omit<Book, "published" | "verification" | "agentReview" | "createdAt" | "updatedAt">;

function toPublic(b: Book): PublicBook {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    topics: b.topics,
    level: b.level,
    linguistic: b.linguistic,
    thematic: b.thematic,
    psych: b.psych,
    visuals: b.visuals,
    mediation: b.mediation,
  };
}

export async function getPublishedBooks(): Promise<PublicBook[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { books } = await readCatalog();
  return books.filter((b) => b.published).map(toPublic);
}

export async function getPublishedBook(id: string): Promise<PublicBook | null> {
  const books = await getPublishedBooks();
  return books.find((b) => b.id === id) ?? null;
}
