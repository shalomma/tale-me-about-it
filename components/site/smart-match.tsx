"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { PublicBook } from "@/lib/catalog/queries";
import { matchBooks } from "@/lib/catalog/match";
import { type Level, LEVEL_IDS, LEVELS, type Topic, TOPIC_IDS, TOPICS } from "@/lib/catalog/schema";
import { BookCard } from "./book-card";

const MAX_RESULTS = 3;

export function SmartMatch({ books }: { books: PublicBook[] }) {
  const [topic, setTopic] = useState<Topic>("transitions");
  const [level, setLevel] = useState<Level>("intermediate");
  const [results, setResults] = useState<{ topic: Topic; level: Level; books: PublicBook[] } | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResults({ topic, level, books: matchBooks(books, topic, level).slice(0, MAX_RESULTS) });
  }

  // Show the levels from most to least experienced, as in the original design.
  const levelOptions = [...LEVEL_IDS].reverse();

  return (
    <div className="w-full">
      <div className="glass-card rounded-3xl border-4 border-white p-6 shadow-floating sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="mb-2 block font-heading text-lg font-bold text-ink-dark">
              מה מעסיק את הילד כעת?
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value as Topic)}
              className="w-full cursor-pointer rounded-xl border-2 border-purple-200 bg-white p-4 text-lg text-ink focus:border-primary focus:outline-none"
            >
              {TOPIC_IDS.map((t) => (
                <option key={t} value={t}>
                  {TOPICS[t]}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="mb-2 block font-heading text-lg font-bold text-ink-dark">מה ניסיון הקריאה שלו?</legend>
            <div className="grid grid-cols-3 gap-3">
              {levelOptions.map((l) => (
                <label
                  key={l}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                    level === l ? "border-primary bg-purple-50 shadow-inner" : "border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={l}
                    checked={level === l}
                    onChange={() => setLevel(l)}
                    className="sr-only"
                  />
                  <span className="mb-1 text-3xl" aria-hidden>
                    {LEVELS[l].emoji}
                  </span>
                  <span className="text-center text-sm font-bold">{LEVELS[l].parent}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-heading text-xl font-bold text-white shadow-md transition hover:bg-purple-700"
          >
            <Search className="size-5" aria-hidden />
            מצא את הספר המושלם
          </button>
        </form>
      </div>

      <div aria-live="polite" className="mt-8">
        {results &&
          (results.books.length ? (
            <div className="space-y-4">
              <h3 className="font-heading text-2xl font-bold text-ink-dark">הספרים שמצאנו בשבילכם</h3>
              <div className="grid gap-4">
                {results.books.map((b) => (
                  <BookCard
                    key={b.id}
                    book={b}
                    note={b.level !== results.level ? "רמת הקריאה שונה מעט ממה שביקשתם" : undefined}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-100 bg-surface p-6 text-center shadow-sm">
              <p className="text-4xl" aria-hidden>
                🌱
              </p>
              <p className="mt-2 font-heading text-xl font-bold text-ink-dark">
                עדיין אין לנו ספרים בנושא &quot;{TOPICS[results.topic]}&quot;
              </p>
              <p className="mt-1 text-ink">אנחנו בונים את הספרייה לנושא הזה ממש עכשיו. חזרו בקרוב 💜</p>
            </div>
          ))}
      </div>
    </div>
  );
}
