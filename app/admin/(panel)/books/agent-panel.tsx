"use client";

import { useRef, useState } from "react";
import { Bot, ExternalLink, Globe, LoaderCircle, Search, ShieldCheck, Sparkles, TriangleExclamationPoint } from "lucide-react";
import { Badge, Button, Card, Field, Textarea } from "@/components/admin/ui";
import type { AgentProgress, AgentStreamEvent } from "@/lib/agent/events";
import { ENTRY_FIELDS } from "@/lib/catalog/fields";
import type { AgentReview, BookContent } from "@/lib/catalog/schema";
import { formatDateTime } from "@/lib/format";

const VERDICT = {
  verified: { label: "הרשומה מדויקת", tone: "green" },
  needs_changes: { label: "נמצאו בעיות ברשומה", tone: "amber" },
  not_found: { label: "לא הצלחתי לאמת שהספר קיים", tone: "red" },
} as const;
const CONFIDENCE = { high: "ביטחון גבוה", medium: "ביטחון בינוני", low: "ביטחון נמוך" } as const;

export function AgentPanel({
  bookId,
  content,
  review,
  onReview,
  onApply,
}: {
  bookId: string | null;
  content: BookContent;
  review: AgentReview | null;
  onReview: (r: AgentReview) => void;
  onApply: (proposal: BookContent) => void;
}) {
  const [notes, setNotes] = useState("");
  const [running, setRunning] = useState<null | "verify" | "draft">(null);
  const [log, setLog] = useState<AgentProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const canDraft = content.title.trim().length > 0;
  const hasAnalysis = Boolean(content.thematic.problem || content.mediation.length);

  async function run(mode: "verify" | "draft") {
    setRunning(mode);
    setLog([]);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, bookId, content, notes }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `שגיאה ${res.status}`);
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as AgentStreamEvent;
          if (event.type === "progress") setLog((l) => [...l, event]);
          else if (event.type === "result") onReview(event.review);
          else setError(event.message);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setRunning(null);
      abortRef.current = null;
    }
  }

  const changed = review
    ? ENTRY_FIELDS.filter(([, read]) => read(review.proposal).trim() !== read(content).trim())
    : [];

  return (
    <Card className="p-5">
      <h2 className="mb-1 flex items-center gap-2 font-semibold">
        <Bot className="size-5 text-violet-600" aria-hidden />
        סוכן מחקר
      </h2>
      <p className="mb-4 text-sm text-zinc-600">
        הסוכן מחפש ברשת, בודק שהספר והסופר/ת קיימים ושהניתוח תואם את העלילה, ומציע רשומה מתוקנת. שום דבר לא משתנה עד שתאשרו ותשמרו.
      </p>

      <Field label="הערות לסוכן (לא חובה)" className="mb-3">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="למשל: זה הספר בהוצאת כנרת משנת 2015, לא המהדורה הישנה"
          className="min-h-16"
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        {bookId && hasAnalysis && (
          <Button variant="primary" onClick={() => run("verify")} disabled={running !== null}>
            <ShieldCheck className="size-4" aria-hidden />
            בדיקת עובדות
          </Button>
        )}
        <Button
          variant={bookId && hasAnalysis ? "secondary" : "primary"}
          onClick={() => run("draft")}
          disabled={running !== null || !canDraft}
          title={canDraft ? undefined : "הזינו כותרת קודם"}
        >
          <Sparkles className="size-4" aria-hidden />
          {hasAnalysis ? "כתיבת ניתוח מחדש" : "מחקר וכתיבת ניתוח"}
        </Button>
        {running && (
          <Button variant="ghost" onClick={() => abortRef.current?.abort()}>
            עצירה
          </Button>
        )}
      </div>

      {(running || log.length > 0) && (
        <ol className="mt-4 space-y-1.5 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700" aria-live="polite">
          {log.map((p, i) => (
            <li key={i} className="flex items-start gap-1.5">
              {p.kind === "search" ? (
                <>
                  <Search className="mt-0.5 size-3.5 shrink-0" aria-hidden /> חיפוש: <span dir="auto">{p.query}</span>
                </>
              ) : p.kind === "results" ? (
                <>
                  <Globe className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {p.count} תוצאות
                </>
              ) : (
                p.text
              )}
            </li>
          ))}
          {running && (
            <li className="flex items-center gap-1.5 text-violet-700">
              <LoaderCircle className="size-3.5 motion-safe:animate-spin" aria-hidden />
              עובד… (זה יכול לקחת דקה-שתיים)
            </li>
          )}
        </ol>
      )}

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <TriangleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {review && !running && (
        <div className="mt-5 space-y-4 border-t border-zinc-200 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={VERDICT[review.verdict].tone}>{VERDICT[review.verdict].label}</Badge>
            <Badge>{CONFIDENCE[review.confidence]}</Badge>
            <span className="text-xs text-zinc-500">
              {formatDateTime(review.ranAt)}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{review.summary}</p>

          {review.issues.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-medium">בעיות שנמצאו</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
                {review.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {review.sources.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-medium">מקורות</h3>
              <ul className="space-y-1 text-sm">
                {review.sources.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-violet-700 hover:underline">
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                      <span dir="auto">{s.title || s.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-medium">
              {changed.length ? `ההצעה משנה ${changed.length} שדות` : "ההצעה זהה לרשומה הנוכחית"}
            </h3>
            {changed.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-violet-700">הצגת השינויים</summary>
                <dl className="mt-2 space-y-3">
                  {changed.map(([label, read]) => (
                    <div key={label}>
                      <dt className="font-medium">{label}</dt>
                      <dd className="mt-1 rounded bg-red-50 px-2 py-1 whitespace-pre-line text-red-800 line-through decoration-red-300">
                        {read(content) || "—"}
                      </dd>
                      <dd className="mt-1 rounded bg-emerald-50 px-2 py-1 whitespace-pre-line text-emerald-900">
                        {read(review.proposal) || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
          </div>

          {changed.length > 0 && (
            <Button variant="primary" onClick={() => onApply(review.proposal)} className="w-full">
              החלת ההצעה על הטופס
            </Button>
          )}
          <p className="text-xs text-zinc-500">
            אחרי ההחלה עברו על הטקסט, עדכנו את סטטוס הבדיקה ולחצו שמירה. הסוכן יכול לטעות.
          </p>
        </div>
      )}
    </Card>
  );
}
