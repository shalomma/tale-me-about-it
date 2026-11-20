"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CircleCheck, ExternalLink, MessagesSquare, Plus, Save, X } from "lucide-react";
import { deleteBook, saveBook } from "../../actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import {
  type AgentReview,
  type Book,
  type BookContent,
  LEVEL_IDS,
  LEVELS,
  type Topic,
  TOPIC_IDS,
  TOPICS,
  VERIFICATION,
  VERIFICATION_IDS,
  type VerificationStatus,
} from "@/lib/catalog/schema";
import { AgentPanel } from "./agent-panel";

type Meta = { published: boolean; verification: { status: VerificationStatus; note: string } };

function contentOf(book: Book): BookContent {
  const { title, author, topics, level, linguistic, thematic, psych, visuals, mediation } = book;
  return { title, author, topics, level, linguistic, thematic, psych, visuals, mediation };
}

export function BookEditor({ book, initial }: { book: Book | null; initial: BookContent }) {
  const router = useRouter();
  const [content, setContent] = useState<BookContent>(book ? contentOf(book) : initial);
  const [meta, setMeta] = useState<Meta>({
    published: book?.published ?? false,
    verification: {
      status: book?.verification.status ?? "unverified",
      note: book?.verification.note ?? "",
    },
  });
  const [review, setReview] = useState<AgentReview | null>(book?.agentReview ?? null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  // The topics error waits until the user has touched the topics or tried to save.
  const [topicsTouched, setTopicsTouched] = useState(false);
  const firstTopicRef = useRef<HTMLInputElement>(null);
  const [saving, startSaving] = useTransition();

  // Warn before leaving with unsaved edits: reloads and closing the tab (beforeunload),
  // and links inside the app, which navigate without unloading the page.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.origin !== location.origin) return;
      if (link.pathname === location.pathname && link.search === location.search) return;
      if (!window.confirm("יש שינויים שלא נשמרו. לעזוב בלי לשמור?")) {
        // Capture phase on document runs before Next's Link handler, so stopping here cancels the navigation.
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [dirty]);

  function update(change: (c: BookContent) => BookContent) {
    setContent((c) => change(structuredClone(c)));
    setDirty(true);
    setMessage(null);
  }
  function updateMeta(change: Partial<Meta>) {
    setMeta((m) => ({ ...m, ...change }));
    setDirty(true);
    setMessage(null);
  }

  function save() {
    if (content.topics.length === 0) {
      setTopicsTouched(true);
      firstTopicRef.current?.focus();
      return;
    }
    startSaving(async () => {
      const result = await saveBook(book?.id ?? null, content, meta);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setDirty(false);
      setMessage({ tone: "ok", text: meta.published ? "נשמר ופורסם באתר" : "נשמר כטיוטה" });
      if (!book) router.replace(`/admin/books/${result.data.id}`);
      else router.refresh();
    });
  }

  async function remove() {
    if (!book) return null;
    const result = await deleteBook(book.id);
    return result && !result.ok ? result.error : null;
  }

  const text = (
    group: "linguistic" | "thematic" | "psych",
    key: string,
    label: string,
  ) => (
    <Field label={label}>
      <Textarea
        value={(content[group] as Record<string, string>)[key]}
        onChange={(e) =>
          update((c) => {
            (c[group] as Record<string, string>)[key] = e.target.value;
            return c;
          })
        }
      />
    </Field>
  );

  const showTopicsError = topicsTouched && content.topics.length === 0;

  return (
    // A real form: Enter in a field saves, and the browser checks required fields before saving.
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="space-y-6">
        {/* Sticky save bar */}
        <Card className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={meta.published}
                onChange={(e) => updateMeta({ published: e.target.checked })}
                className="size-4 accent-violet-600"
              />
              מפורסם באתר
            </label>
            {book && meta.published && !dirty && (
              <Link href={`/books/${book.id}`} target="_blank" className="inline-flex items-center gap-1 text-violet-700 hover:underline">
                <ExternalLink className="size-3.5" aria-hidden />
                צפייה באתר
              </Link>
            )}
            {dirty && <span className="text-amber-700">יש שינויים שלא נשמרו</span>}
            {message && (
              <span role="status" className={`inline-flex items-center gap-1 ${message.tone === "ok" ? "text-emerald-700" : "text-red-700"}`}>
                {message.tone === "ok" && <CircleCheck className="size-4" aria-hidden />}
                {message.text}
              </span>
            )}
          </div>
          <Button type="submit" variant="primary" disabled={saving || (!dirty && Boolean(book))}>
            <Save className="size-4" aria-hidden />
            {saving ? "שומר…" : "שמירה"}
          </Button>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">פרטי הספר</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="כותרת">
              <Input value={content.title} onChange={(e) => update((c) => ({ ...c, title: e.target.value }))} required />
            </Field>
            <Field label="סופר/ת" hint="השאירו ריק אם לא ידוע">
              <Input
                value={content.author ?? ""}
                onChange={(e) => update((c) => ({ ...c, author: e.target.value.trim() ? e.target.value : null }))}
              />
            </Field>
          </div>
          <fieldset aria-describedby={showTopicsError ? "topics-error" : undefined}>
            <legend className="mb-1.5 text-sm font-medium text-zinc-800">נושאים</legend>
            <div className="flex flex-wrap gap-2">
              {TOPIC_IDS.map((t, i) => {
                const on = content.topics.includes(t);
                return (
                  <label
                    key={t}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-violet-600 ${
                      on ? "border-violet-500 bg-violet-50 text-violet-800" : "border-zinc-300 bg-white text-zinc-700"
                    }`}
                  >
                    <input
                      ref={i === 0 ? firstTopicRef : undefined}
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      aria-invalid={showTopicsError}
                      onChange={() => {
                        setTopicsTouched(true);
                        update((c) => ({
                          ...c,
                          topics: on ? c.topics.filter((x) => x !== t) : ([...c.topics, t] as Topic[]),
                        }));
                      }}
                    />
                    {TOPICS[t]}
                  </label>
                );
              })}
            </div>
            {showTopicsError && (
              <p id="topics-error" role="alert" className="mt-1 text-xs text-red-600">
                בחרו לפחות נושא אחד
              </p>
            )}
          </fieldset>
          <Field label="רמת קריאה" className="sm:max-w-xs">
            <Select value={content.level} onChange={(e) => update((c) => ({ ...c, level: e.target.value as BookContent["level"] }))}>
              {LEVEL_IDS.map((l) => (
                <option key={l} value={l}>
                  {LEVELS[l].book} (בטופס להורים: {LEVELS[l].parent})
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">ניתוח לשוני וסגנוני</h2>
          {text("linguistic", "rhyme", "חריזה ומשקל")}
          {text("linguistic", "vocabulary", "אוצר מילים")}
          {text("linguistic", "typography", "טיפוגרפיה פעילה")}
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">ניתוח תמטי</h2>
          {text("thematic", "problem", "הבעיה")}
          {text("thematic", "motive", "המניע")}
          {text("thematic", "twist", "הטוויסט")}
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">מסר פסיכולוגי-חברתי</h2>
          {text("psych", "innerVoice", "קול פנימי")}
          {text("psych", "copingWithFear", "התמודדות עם פחד")}
          {text("psych", "unexpectedOutcome", "תוצאה לא צפויה")}
          <Field label="איורים">
            <Textarea value={content.visuals} onChange={(e) => update((c) => ({ ...c, visuals: e.target.value }))} />
          </Field>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">הנחיות לתיווך הורי ({content.mediation.length})</h2>
            <Button
              onClick={() => update((c) => ({ ...c, mediation: [...c.mediation, { question: "", explanation: "" }] }))}
            >
              <Plus className="size-4" aria-hidden />
              שאלה
            </Button>
          </div>
          {content.mediation.map((m, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600">שאלה {i + 1}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" className="px-2" aria-label="הזזה למעלה" disabled={i === 0}
                    onClick={() => update((c) => { [c.mediation[i - 1], c.mediation[i]] = [c.mediation[i], c.mediation[i - 1]]; return c; })}>
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button variant="ghost" className="px-2" aria-label="הזזה למטה" disabled={i === content.mediation.length - 1}
                    onClick={() => update((c) => { [c.mediation[i + 1], c.mediation[i]] = [c.mediation[i], c.mediation[i + 1]]; return c; })}>
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button variant="ghost" className="px-2 text-red-600" aria-label="מחיקת השאלה"
                    onClick={() => update((c) => ({ ...c, mediation: c.mediation.filter((_, j) => j !== i) }))}>
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Field label="השאלה">
                  <Input value={m.question} onChange={(e) => update((c) => { c.mediation[i].question = e.target.value; return c; })} />
                </Field>
                <Field label="למה היא עוזרת">
                  <Textarea className="min-h-14" value={m.explanation}
                    onChange={(e) => update((c) => { c.mediation[i].explanation = e.target.value; return c; })} />
                </Field>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="space-y-6">
        {book && (
          <Link
            href={`/admin/chat?book=${book.id}`}
            className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 hover:bg-violet-100"
          >
            <MessagesSquare className="size-5 shrink-0 text-violet-600" aria-hidden />
            <span>
              <span className="block font-medium">שיחת מחקר על הספר</span>
              <span className="text-violet-800/80">לעבוד על הרשומה יחד עם הסוכן, בשיחה</span>
            </span>
          </Link>
        )}
        <AgentPanel
          bookId={book?.id ?? null}
          content={content}
          review={review}
          onReview={setReview}
          onApply={(proposal) => {
            update(() => structuredClone(proposal));
            setMessage({ tone: "ok", text: "ההצעה הוחלה. עברו עליה ושמרו." });
          }}
        />

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">סטטוס בדיקה</h2>
          <Select
            value={meta.verification.status}
            onChange={(e) => updateMeta({ verification: { ...meta.verification, status: e.target.value as VerificationStatus } })}
            aria-label="סטטוס בדיקה"
          >
            {VERIFICATION_IDS.map((s) => (
              <option key={s} value={s}>
                {VERIFICATION[s]}
              </option>
            ))}
          </Select>
          <Textarea
            placeholder="הערות: מה נבדק, מול איזה מקור…"
            value={meta.verification.note}
            onChange={(e) => updateMeta({ verification: { ...meta.verification, note: e.target.value } })}
            aria-label="הערות בדיקה"
          />
          {book?.verification.updatedAt && (
            <p className="text-xs text-zinc-500">
              עודכן {formatDateTime(book.verification.updatedAt)}
            </p>
          )}
        </Card>

        {book && (
          <Card className="space-y-3 p-5">
            <h2 className="font-semibold text-red-700">מחיקה</h2>
            <p className="text-sm text-zinc-600">כדי להוריד ספר מהאתר בלי למחוק אותו, בטלו את &quot;מפורסם באתר&quot;.</p>
            <ConfirmDelete
              label="מחיקת הספר"
              title={`למחוק את "${book.title}"?`}
              description="הספר יימחק מהקטלוג לצמיתות, ואי אפשר לשחזר אותו."
              confirmLabel="כן, למחוק לצמיתות"
              onConfirm={remove}
            />
          </Card>
        )}
      </div>
    </form>
  );
}
