"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setPublished } from "../../actions";
import { Badge, Card, Input, Select, VerificationBadge } from "@/components/admin/ui";
import {
  type Book,
  LEVEL_IDS,
  LEVELS,
  TOPIC_IDS,
  TOPICS,
  VERIFICATION,
  VERIFICATION_IDS,
} from "@/lib/catalog/schema";

const VERDICT_LABEL = { verified: "הסוכן: מדויק", needs_changes: "הסוכן: דורש תיקון", not_found: "הסוכן: לא נמצא" } as const;
const VERDICT_TONE = { verified: "green", needs_changes: "amber", not_found: "red" } as const;

export function BooksTable({ books, initialStatus }: { books: Book[]; initialStatus: string }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState(initialStatus);
  const [visibility, setVisibility] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticBooks, setOptimistic] = useOptimistic(books, (state, change: { id: string; published: boolean }) =>
    state.map((b) => (b.id === change.id ? { ...b, published: change.published } : b)),
  );

  const rows = useMemo(() => {
    const q = query.trim();
    return optimisticBooks.filter(
      (b) =>
        (!q || b.title.includes(q) || (b.author ?? "").includes(q)) &&
        (topic === "all" || b.topics.includes(topic as Book["topics"][number])) &&
        (level === "all" || b.level === level) &&
        (status === "all" || b.verification.status === status) &&
        (visibility === "all" || (visibility === "published") === b.published),
    );
  }, [optimisticBooks, query, topic, level, status, visibility]);

  function togglePublished(book: Book) {
    setError(null);
    startTransition(async () => {
      setOptimistic({ id: book.id, published: !book.published });
      const result = await setPublished(book.id, !book.published);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <Card>
      <div className="grid gap-3 border-b border-zinc-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder="חיפוש לפי שם או סופר/ת…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="חיפוש" />
        <Select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="נושא">
          <option value="all">כל הנושאים</option>
          {TOPIC_IDS.map((t) => (
            <option key={t} value={t}>
              {TOPICS[t]}
            </option>
          ))}
        </Select>
        <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="רמת קריאה">
          <option value="all">כל הרמות</option>
          {LEVEL_IDS.map((l) => (
            <option key={l} value={l}>
              {LEVELS[l].book}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="סטטוס בדיקה">
          <option value="all">כל הסטטוסים</option>
          {VERIFICATION_IDS.map((s) => (
            <option key={s} value={s}>
              {VERIFICATION[s]}
            </option>
          ))}
        </Select>
        <Select value={visibility} onChange={(e) => setVisibility(e.target.value)} aria-label="פרסום">
          <option value="all">מפורסם וטיוטה</option>
          <option value="published">מפורסם באתר</option>
          <option value="draft">טיוטה</option>
        </Select>
      </div>

      {error && (
        <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Focusable and named, so keyboard users can scroll the table when it overflows. */}
      <div role="region" aria-label="רשימת הספרים" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-600">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 text-start font-medium">ספר</th>
              <th className="px-4 py-2.5 text-start font-medium">רמה</th>
              <th className="px-4 py-2.5 text-start font-medium">נושאים</th>
              <th className="px-4 py-2.5 text-start font-medium">בדיקה</th>
              <th className="px-4 py-2.5 text-start font-medium">באתר</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((b) => (
              <tr key={b.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/books/${b.id}`} className="font-medium text-zinc-900 hover:text-violet-700">
                    {b.title}
                  </Link>
                  {b.author && <div className="text-zinc-500">{b.author}</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{LEVELS[b.level].book}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {b.topics.map((t) => (
                      <Badge key={t}>{TOPICS[t]}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <VerificationBadge status={b.verification.status} />
                    {b.agentReview && (
                      <Badge tone={VERDICT_TONE[b.agentReview.verdict]}>{VERDICT_LABEL[b.agentReview.verdict]}</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => togglePublished(b)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      b.published ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-zinc-100 text-zinc-600 ring-zinc-500/10"
                    }`}
                    aria-label={b.published ? `הסתרת ${b.title} מהאתר` : `פרסום ${b.title} באתר`}
                  >
                    {b.published ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                    {b.published ? "מפורסם" : "טיוטה"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-zinc-500">אין ספרים שמתאימים לסינון.</p>}
      </div>
      <p className="border-t border-zinc-200 px-4 py-2.5 text-xs text-zinc-500">
        מציג {rows.length} מתוך {books.length}
      </p>
    </Card>
  );
}
