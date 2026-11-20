"use client";

import Link from "next/link";
import { type ReactNode, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Compass, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export type GuideStep = {
  /** Short name on the step rail. */
  label: string;
  title: string;
  body: ReactNode;
  /** A small sketch of the part of the screen the step is about. */
  visual: ReactNode;
  actions?: { href: string; label: string }[];
};

// --- Open/closed state, remembered per guide in localStorage ------------------

const KEY = "admin-guide:";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function isClosed(id: string) {
  try {
    return localStorage.getItem(KEY + id) === "closed";
  } catch {
    return false;
  }
}

function setClosed(id: string, closed: boolean) {
  try {
    if (closed) localStorage.setItem(KEY + id, "closed");
    else localStorage.removeItem(KEY + id);
  } catch {
    // Storage blocked: the guide still opens and closes for this page view.
  }
  listeners.forEach((l) => l());
}

type Mode = "open" | "closed" | "unknown";

function useGuideMode(id: string): [Mode, (closed: boolean) => void] {
  const [local, setLocal] = useState<boolean | null>(null);
  const stored = useSyncExternalStore<Mode>(
    subscribe,
    () => (isClosed(id) ? "closed" : "open"),
    // On the server we can't know: render the slim bar, which is the smaller layout shift.
    () => "unknown",
  );
  const mode: Mode = local === null ? stored : local ? "closed" : "open";
  return [
    mode,
    (closed) => {
      setLocal(closed);
      setClosed(id, closed);
    },
  ];
}

// --- The guide ------------------------------------------------------------------

export function Guide({ id, title, steps }: { id: string; title: string; steps: GuideStep[] }) {
  const [mode, setMode] = useGuideMode(id);
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const last = index === steps.length - 1;

  if (mode !== "open") {
    return (
      <button
        type="button"
        onClick={() => setMode(false)}
        className="group mb-6 flex w-full items-center gap-3 rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-2.5 text-start text-sm transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        <span className="grid size-7 place-items-center rounded-lg bg-violet-600 text-white">
          <Compass className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium text-violet-900">מדריך: {title}</span>
          <span className="text-violet-800/70"> · {steps.length} צעדים קצרים</span>
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-violet-700">
          הצגה
          <ChevronDown className="size-4 transition group-hover:translate-y-0.5" aria-hidden />
        </span>
      </button>
    );
  }

  function go(i: number) {
    setIndex(Math.max(0, Math.min(steps.length - 1, i)));
  }

  function finish() {
    setMode(true);
    setIndex(0);
  }

  return (
    <section aria-label={`מדריך: ${title}`} className="mb-6 overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-violet-100 bg-violet-50/70 px-4 py-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-violet-600 text-white">
          <Compass className="size-4" aria-hidden />
        </span>
        <p className="flex-1 text-sm font-semibold text-violet-950">
          <span className="font-normal text-violet-700">מדריך · </span>
          {title}
        </p>
        <button
          type="button"
          onClick={finish}
          aria-label="הסתרת המדריך"
          title="הסתרת המדריך"
          className="grid size-8 place-items-center rounded-lg text-violet-700 hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-violet-600"
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>

      {/* Step rail */}
      <ol
        className="flex items-center gap-1 px-4 pt-4"
        onKeyDown={(e) => {
          // RTL: left is forward.
          if (e.key === "ArrowLeft") go(index + 1);
          else if (e.key === "ArrowRight") go(index - 1);
          else return;
          e.preventDefault();
        }}
      >
        {steps.map((s, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <li key={s.label} className="flex min-w-0 flex-1 items-center gap-1 last:flex-none">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={active ? "step" : undefined}
                tabIndex={active ? 0 : -1}
                className={cx(
                  "flex shrink-0 items-center gap-2 rounded-full py-1 ps-1 pe-1 text-xs transition focus-visible:outline-2 focus-visible:outline-violet-600 sm:pe-3",
                  active ? "bg-violet-100 font-medium text-violet-900" : "text-zinc-600 hover:bg-zinc-100",
                )}
              >
                <span
                  className={cx(
                    "grid size-6 place-items-center rounded-full text-[11px] font-semibold tabular-nums transition",
                    active && "bg-violet-600 text-white shadow-sm shadow-violet-600/30",
                    done && "bg-violet-200 text-violet-800",
                    !active && !done && "bg-zinc-100 text-zinc-500",
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                <span className={cx("whitespace-nowrap", !active && "hidden md:inline")}>{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <span aria-hidden className={cx("h-0.5 min-w-3 flex-1 rounded-full transition", done ? "bg-violet-300" : "bg-zinc-200")} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step */}
      <div key={index} className="grid animate-rise gap-4 p-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div aria-hidden className="grain grid h-48 place-items-center overflow-hidden rounded-xl bg-violet-50/60 p-4 ring-1 ring-violet-100 ring-inset">
          {step.visual}
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="text-xs font-medium text-violet-700 tabular-nums">
            צעד {index + 1} מתוך {steps.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">{step.title}</h2>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-zinc-600 [&_b]:font-medium [&_b]:text-zinc-900">{step.body}</p>
          {step.actions && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {step.actions.map((a) => (
                <Link key={a.href} href={a.href} className="inline-flex items-center gap-1 text-sm font-medium text-violet-700 hover:underline">
                  {a.label}
                  <ArrowLeft className="size-3.5" aria-hidden />
                </Link>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => (last ? finish() : go(index + 1))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              {last ? (
                <>
                  <Check className="size-4" aria-hidden />
                  הבנתי
                </>
              ) : (
                <>
                  הבא
                  <ArrowLeft className="size-4" aria-hidden />
                </>
              )}
            </button>
            {index > 0 && (
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-violet-600"
              >
                <ArrowRight className="size-4" aria-hidden />
                הקודם
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Sketch parts for the visuals ----------------------------------------------

/** A small white panel standing in for a piece of the screen. */
export function Sketch({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("w-full max-w-60 rounded-lg bg-white p-3 shadow-md shadow-violet-900/5 ring-1 ring-zinc-200", className)}>{children}</div>;
}

/** A placeholder line of text. */
export function Line({ w = "w-full", className }: { w?: string; className?: string }) {
  return <span className={cx("block h-1.5 rounded-full bg-zinc-200", w, className)} />;
}

/** Marks the element the step is about, with a pulsing dot. `block` makes it fill the row. */
export function Spot({ block, className, children }: { block?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cx("relative rounded-md ring-2", block ? "flex w-full" : "inline-flex", "ring-violet-500 ring-offset-2 ring-offset-white", className)}>
      {children}
      <span className="absolute -end-2 -top-2 flex size-3.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-70" />
        <span className="relative inline-flex size-3.5 rounded-full border-2 border-white bg-violet-600" />
      </span>
    </span>
  );
}

const CHIP_TONES = {
  zinc: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20",
  solid: "bg-violet-600 text-white",
} as const;

/** A miniature badge or button. */
export function Chip({ tone = "zinc", className, children }: { tone?: keyof typeof CHIP_TONES; className?: string; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-4", CHIP_TONES[tone], className)}>
      {children}
    </span>
  );
}
