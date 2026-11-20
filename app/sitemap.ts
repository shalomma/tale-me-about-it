import type { MetadataRoute } from "next";
import { getPublishedBooks } from "@/lib/catalog/queries";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getPublishedBooks();
  return [
    { url: new URL("/", SITE_URL).href, changeFrequency: "weekly", priority: 1 },
    ...books.map((b) => ({ url: new URL(`/books/${b.id}`, SITE_URL).href, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
