"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, RotateCcw } from "lucide-react";
import type { PublicBook } from "@/lib/catalog/queries";
import { matchBooks } from "@/lib/catalog/match";
import { type Level, LEVEL_IDS, LEVEL_RANK, type Topic, TOPIC_IDS } from "@/lib/catalog/schema";
import { BookCover } from "./book-cover";
import { LEVEL_UI, TOPIC_UI } from "./copy";
import { Cloud, Star } from "./doodles";
import { LevelMeter } from "./level-meter";

const MAX_RESULTS = 3;

type State = { step: "topic" } | { step: "level"; topic: Topic } | { step: "results"; topic: Topic; level: Level };

export function Finder({ books }: { books: PublicBook[] }) {
  const [state, setState] = useState<State>({ step: "topic" });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [state.step]);

  const counts = Object.fromEntries(TOPIC_IDS.map((t) => [t, books.filter((b) => b.topics.includes(t)).length])) as Record<
    Topic,
    number
  >;

  const back = () =>
    setState((s) => (s.step === "results" ? { step: "level", topic: s.topic } : { step: "topic" }));

  const stepIndex = state.step === "topic" ? 0 : state.step === "level" ? 1 : 2;

  return (
    <div className="relative rounded-[28px] border border-night/5 bg-white p-5 shadow-lift sm:p-7">
      <div className="mb-5 flex h-9 items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex ? "w-8 bg-night" : i < stepIndex ? "w-4 bg-night/40" : "w-4 bg-night/10"
              }`}
            />
          ))}
        </div>
        {state.step !== "topic" && (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-night-mute transition hover:bg-paper hover:text-night"
          >
            <ArrowRight className="size-4" aria-hidden />
            חזרה
          </button>
        )}
      </div>

      <div key={state.step} className="motion-safe:animate-rise">
        {state.step === "topic" && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none sm:text-[1.7rem]">
              מה קורה אצלכם עכשיו?
            </h2>
            <p className="mt-1 text-night-mute">בחרו נושא, ונמצא ספר שמדבר בדיוק על זה.</p>
            <ul className="mt-5 space-y-2.5">
              {TOPIC_IDS.map((t) => {
                const ui = TOPIC_UI[t];
                const Icon = ui.icon;
                return (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => setState({ step: "level", topic: t })}
                      className={`group flex w-full items-center gap-4 rounded-2xl border-2 border-night/8 bg-white p-3 text-start transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night ${ui.tile}`}
                    >
                      <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${ui.iconBg}`}>
                        <Icon className="size-6" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg leading-tight font-semibold text-night">{ui.label}</span>
                        <span className="block text-sm text-night-mute">{ui.hint}</span>
                      </span>
                      {counts[t] > 0 ? (
                        <span className="shrink-0 rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-night-soft">
                          {counts[t]} ספרים
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-dashed border-night/20 px-2.5 py-1 text-xs text-night-mute">
                          בקרוב
                        </span>
                      )}
                      <ChevronLeft className="size-5 shrink-0 text-night/30 transition group-hover:-translate-x-0.5 group-hover:text-night" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {state.step === "level" && (
          <>
            <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-sm font-medium text-night-soft">
              {TOPIC_UI[state.topic].label}
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none sm:text-[1.7rem]">
              כמה אתם רגילים לקרוא יחד?
            </h2>
            <p className="mt-1 text-night-mute">כך נתאים את אורך הסיפור לסבלנות של הילד.</p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {LEVEL_IDS.map((l) => {
                const ui = LEVEL_UI[l];
                return (
                  <li key={l}>
                    <button
                      type="button"
                      onClick={() => setState({ step: "results", topic: state.topic, level: l })}
                      className="flex h-full w-full items-center gap-4 rounded-2xl border-2 border-night/8 bg-white p-4 text-start transition hover:-translate-y-0.5 hover:border-sun hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night sm:flex-col sm:items-start sm:gap-3"
                    >
                      <span className="flex h-10 items-end gap-1" aria-hidden>
                        {[1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`w-2.5 rounded-full ${i <= ui.step ? "bg-sun" : "bg-night/10"}`}
                            style={{ height: `${10 + i * 9}px` }}
                          />
                        ))}
                      </span>
                      <span>
                        <span className="block font-display text-lg leading-tight font-semibold text-night">{ui.question}</span>
                        <span className="mt-0.5 block text-sm text-night-mute">{ui.questionHint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {state.step === "results" && (
          <Results
            books={matchBooks(books, state.topic, state.level)}
            topic={state.topic}
            level={state.level}
            headingRef={headingRef}
            onRestart={() => setState({ step: "topic" })}
          />
        )}
      </div>
    </div>
  );
}

function Results({
  books,
  topic,
  level,
  headingRef,
  onRestart,
}: {
  books: PublicBook[];
  topic: Topic;
  level: Level;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  if (!books.length) {
    return (
      <div className="py-2 text-center">
        <div className="relative mx-auto mb-4 h-20 w-28" aria-hidden>
          <Cloud className="absolute top-4 right-0 w-24 text-sky-soft" />
          <Star className="absolute top-0 left-1 size-6 motion-safe:animate-twinkle text-sun" />
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
          המדף הזה עוד מתמלא
        </h2>
        <p className="mx-auto mt-2 max-w-sm leading-relaxed">
          עדיין אין לנו ספרים על &quot;{TOPIC_UI[topic].label}&quot;. אנחנו בוחרים ובודקים אותם בימים אלה.
        </p>
        <p className="mx-auto mt-2 max-w-sm leading-relaxed">
          בינתיים, טקס הפתיחה והשאלות שבהמשך מתאימים לכל ספר שאתם כבר אוהבים.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <a
            href="#together"
            className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-2.5 font-medium text-paper transition hover:bg-night/90"
          >
            איך קוראים יחד
            <ArrowLeft className="size-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full border border-night/15 px-5 py-2.5 font-medium text-night transition hover:bg-paper"
          >
            <RotateCcw className="size-4" aria-hidden />
            נושא אחר
          </button>
        </div>
      </div>
    );
  }

  const top = books.slice(0, MAX_RESULTS);
  return (
    <>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none sm:text-[1.7rem]">
        מצאנו לכם {top.length === 1 ? "ספר" : `${top.length} ספרים`}
      </h2>
      <p className="mt-1 text-night-mute">
        {TOPIC_UI[topic].label} · {LEVEL_UI[level].short}
      </p>
      <ul className="mt-5 space-y-3">
        {top.map((b, i) => {
          const diff = LEVEL_RANK[b.level] - LEVEL_RANK[level];
          return (
            <li key={b.id}>
              <Link
                href={`/books/${b.id}`}
                className="group flex gap-4 rounded-2xl border-2 border-night/8 p-3 transition hover:-translate-y-0.5 hover:border-sun hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night"
              >
                <BookCover id={b.id} title={b.title} author={b.author} className="w-20 shrink-0 sm:w-24" />
                <div className="min-w-0 flex-1 py-0.5">
                  {i === 0 && (
                    <span className="mb-1 inline-block rounded-full bg-sun-soft px-2 py-0.5 text-xs font-semibold text-[#7a5208]">
                      ההתאמה הכי טובה
                    </span>
                  )}
                  <h3 className="text-lg leading-tight font-semibold">{b.title}</h3>
                  {b.author && <p className="text-sm text-night-mute">{b.author}</p>}
                  {b.thematic.problem && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed">{b.thematic.problem}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <LevelMeter level={b.level} />
                    {diff !== 0 && (
                      <span className="text-xs text-coral">{diff > 0 ? "קצת ארוך מהרגיל אצלכם" : "קצת קצר מהרגיל אצלכם"}</span>
                    )}
                  </div>
                </div>
                <ChevronLeft className="size-5 shrink-0 self-center text-night/30 transition group-hover:-translate-x-0.5 group-hover:text-night" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-night/8 pt-4 text-sm">
        {books.length > top.length ? (
          <a href="#library" className="font-medium text-night underline decoration-sun decoration-2 underline-offset-4">
            עוד {books.length - top.length} ספרים בנושא במדף
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 text-night-mute transition hover:text-night"
        >
          <RotateCcw className="size-4" aria-hidden />
          להתחיל מחדש
        </button>
      </div>
    </>
  );
}
