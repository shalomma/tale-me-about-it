"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PublicBook } from "@/lib/catalog/queries";
import { type Topic, TOPIC_IDS, TOPICS } from "@/lib/catalog/schema";
import { BookCard } from "./book-card";

const PAGE = 6;

export function Library({ books }: { books: PublicBook[] }) {
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [visible, setVisible] = useState(PAGE);

  const topicsWithBooks = TOPIC_IDS.filter((t) => books.some((b) => b.topics.includes(t)));
  const filtered = useMemo(
    () => (topic === "all" ? books : books.filter((b) => b.topics.includes(topic))),
    [books, topic],
  );

  const chip = (active: boolean) =>
    `rounded-full border-2 px-4 py-1.5 font-medium transition ${
      active ? "border-primary bg-primary text-white" : "border-purple-200 bg-white text-ink hover:border-primary"
    }`;

  return (
    <div>
      {topicsWithBooks.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="סינון לפי נושא">
          <button type="button" className={chip(topic === "all")} onClick={() => setTopic("all")}>
            הכל
          </button>
          {topicsWithBooks.map((t) => (
            <button
              key={t}
              type="button"
              className={chip(topic === t)}
              onClick={() => {
                setTopic(t);
                setVisible(PAGE);
              }}
            >
              {TOPICS[t]}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.slice(0, visible).map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      {visible < filtered.length && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE * 3)}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-3 font-heading text-lg font-bold text-ink-dark shadow-floating transition hover:-translate-y-1 hover:bg-yellow-500"
          >
            <ChevronDown className="size-5" aria-hidden />
            הציגו עוד ספרים ({filtered.length - visible})
          </button>
        </div>
      )}
    </div>
  );
}
