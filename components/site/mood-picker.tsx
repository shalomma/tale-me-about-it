"use client";

import { useState } from "react";
import { CloudRain, type LucideIcon, Moon, Sun, Zap } from "lucide-react";

const MOODS: {
  id: string;
  label: string;
  kid: string;
  tip: string;
  icon: LucideIcon;
  circle: string;
}[] = [
  {
    id: "sun",
    label: "שמח",
    kid: "אני שמח ורוצה לחגוג!",
    tip: "יום טוב לספר עם הרבה תנועה. קראו בקול עליז, ותנו לילד להשלים מילים שחוזרות.",
    icon: Sun,
    circle: "bg-sun text-night",
  },
  {
    id: "rain",
    label: "עצוב",
    kid: "משהו קצת עצוב לי היום.",
    tip: "שבו קרוב, קראו לאט, ועצרו לשאול מה הדמות צריכה עכשיו. אין צורך לתקן את העצב, רק להיות איתו.",
    icon: CloudRain,
    circle: "bg-sky text-white",
  },
  {
    id: "zap",
    label: "כועס",
    kid: "אני כועס מאוד!",
    tip: "קודם נושמים יחד שלוש נשימות גדולות, ורק אחר כך פותחים את הספר. מותר לכעוס, גם לגיבור בסיפור.",
    icon: Zap,
    circle: "bg-coral text-white",
  },
  {
    id: "moon",
    label: "עייף",
    kid: "אני רוצה להירגע לפני השינה.",
    tip: "אור עמום, קול שקט וספר מוכר שכבר אוהבים. חזרה על סיפור ידוע מרגיעה יותר מסיפור חדש.",
    icon: Moon,
    circle: "bg-lilac text-white",
  },
];

/** "Heart keys": the child taps how they feel, the parent gets a reading tip. */
export function MoodPicker() {
  const [mood, setMood] = useState<string | null>(null);
  const active = MOODS.find((m) => m.id === mood);

  return (
    <div>
      <div role="group" aria-label="איך מרגישים היום?" className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {MOODS.map((m) => {
          const Icon = m.icon;
          const on = m.id === mood;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={on}
              onClick={() => setMood(on ? null : m.id)}
              className="group flex w-20 flex-col items-center gap-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sun sm:w-24"
            >
              <span
                className={`flex size-18 items-center justify-center rounded-full transition duration-300 sm:size-22 ${m.circle} ${
                  on ? "scale-110 ring-4 ring-white/80" : mood ? "scale-90 opacity-50 group-hover:opacity-90" : "group-hover:scale-105"
                }`}
              >
                <Icon className="size-9 sm:size-10" strokeWidth={2.2} aria-hidden />
              </span>
              <span className="font-display text-lg font-semibold text-white">{m.label}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mx-auto mt-8 min-h-36 max-w-xl">
        {active ? (
          <div key={active.id} className="motion-safe:animate-rise rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur">
            <p className="font-hand text-xl text-white">&quot;{active.kid}&quot;</p>
            <p className="mt-3 leading-relaxed text-white/80">
              <span className="font-semibold text-sun">להורה: </span>
              {active.tip}
            </p>
          </div>
        ) : (
          <p className="pt-6 text-center text-white/60">הילד בוחר, ואתם מקבלים רעיון איך לקרוא היום.</p>
        )}
      </div>
    </div>
  );
}
