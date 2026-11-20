"use client";

import { useDeferredValue, useState } from "react";
import { Search, X } from "lucide-react";
import type { PublicBook } from "@/lib/catalog/queries";
import { type Level, LEVEL_IDS, type Topic, TOPIC_IDS } from "@/lib/catalog/schema";
import { BookCard } from "./book-card";
import { LEVEL_UI, TOPIC_UI } from "./copy";

const PAGE = 10;

export function Library({ books }: { books: PublicBook[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const q = useDeferredValue(query.trim());

  const topicsWithBooks = TOPIC_IDS.filter((t) => books.some((b) => b.topics.includes(t)));
  const filtered = books.filter(
    (b) =>
      (level === "all" || b.level === level) &&
      (topic === "all" || b.topics.includes(topic)) &&
      (!q || b.title.includes(q) || (b.author ?? "").includes(q)),
  );
  const filtering = level !== "all" || topic !== "all" || q !== "";
  const visible = showAll || filtering ? filtered : filtered.slice(0, PAGE);

  const segment = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
      active ? "bg-night text-paper shadow-soft" : "text-night-soft hover:bg-white"
    }`;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block lg:w-80">
          <span className="sr-only">חיפוש לפי שם הספר או הסופר</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-night-mute" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי שם ספר או סופר"
            className="w-full rounded-full border-2 border-night/10 bg-white py-2.5 ps-12 pe-4 text-night placeholder:text-night-mute focus:border-night/40 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="אורך הסיפור" className="inline-flex flex-wrap rounded-full bg-paper-deep p-1">
            <button type="button" aria-pressed={level === "all"} className={segment(level === "all")} onClick={() => setLevel("all")}>
              כל האורכים
            </button>
            {LEVEL_IDS.map((l) => (
              <button key={l} type="button" aria-pressed={level === l} className={segment(level === l)} onClick={() => setLevel(l)}>
                {LEVEL_UI[l].short}
              </button>
            ))}
          </div>
          {topicsWithBooks.length > 1 && (
            <div role="group" aria-label="נושא" className="inline-flex flex-wrap rounded-full bg-paper-deep p-1">
              <button type="button" aria-pressed={topic === "all"} className={segment(topic === "all")} onClick={() => setTopic("all")}>
                כל הנושאים
              </button>
              {topicsWithBooks.map((t) => (
                <button key={t} type="button" aria-pressed={topic === t} className={segment(topic === t)} onClick={() => setTopic(t)}>
                  {TOPIC_UI[t].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} ספרים
      </p>

      {visible.length ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((b) => (
            <li key={b.id}>
              <BookCard book={b} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-night/15 px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold text-night">לא מצאנו ספר כזה במדף</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLevel("all");
              setTopic("all");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-night/15 bg-white px-4 py-2 text-sm font-medium text-night transition hover:shadow-soft"
          >
            <X className="size-4" aria-hidden />
            ניקוי הסינון
          </button>
        </div>
      )}

      {!filtering && !showAll && filtered.length > PAGE && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-full border-2 border-night bg-white px-7 py-3 font-display text-lg font-semibold text-night transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            הציגו את כל {filtered.length} הספרים
          </button>
        </div>
      )}
    </div>
  );
}
