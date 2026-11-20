import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { OverviewGuide } from "@/components/admin/guides";
import { Badge, Card, PageHeader, VerificationBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { LEVEL_IDS, LEVELS, TOPIC_IDS, TOPICS, VERIFICATION } from "@/lib/catalog/schema";
import { readCatalog } from "@/lib/catalog/store";

export default function DashboardPage() {
  return (
    <>
      <OverviewGuide />
      <PageHeader title="סקירה" description="מצב הקטלוג, פערים בכיסוי הנושאים, ומה מחכה לבדיקה." />
      <Suspense fallback={<p className="text-sm text-zinc-500">טוען…</p>}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await requireAdmin();
  const { books } = await readCatalog();
  const published = books.filter((b) => b.published);
  const queue = books.filter((b) => b.verification.status !== "verified");

  const config = [
    { label: "סוכן AI", env: "ANTHROPIC_API_KEY", ok: Boolean(process.env.ANTHROPIC_API_KEY) },
    {
      label: "אחסון קבוע (Vercel Blob)",
      env: "BLOB_READ_WRITE_TOKEN",
      ok: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      note: process.env.BLOB_READ_WRITE_TOKEN ? undefined : "בפיתוח מקומי נשמר ל-data/books.json",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="ספרים בקטלוג" value={books.length} />
        <Stat label="מפורסמים באתר" value={published.length} />
        <Stat label={VERIFICATION.verified} value={books.length - queue.length} />
        <Stat label="ממתינים לבדיקה" value={queue.length} />
      </div>

      <Card className="p-5">
        <h2 className="mb-1 font-semibold">כיסוי נושאים</h2>
        <p className="mb-4 text-sm text-zinc-600">ספרים מפורסמים לכל נושא ורמת קריאה. תא אדום = הורה שיבחר בשילוב הזה לא יקבל ספר מדויק.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-zinc-500">
                <th className="py-2 text-start font-medium">נושא</th>
                {LEVEL_IDS.map((l) => (
                  <th key={l} className="py-2 text-center font-medium">
                    {LEVELS[l].book}
                  </th>
                ))}
                <th className="py-2 text-center font-medium">סה״כ</th>
              </tr>
            </thead>
            <tbody>
              {TOPIC_IDS.map((t) => {
                const inTopic = published.filter((b) => b.topics.includes(t));
                return (
                  <tr key={t} className="border-t border-zinc-100">
                    <td className="py-2">{TOPICS[t]}</td>
                    {LEVEL_IDS.map((l) => {
                      const n = inTopic.filter((b) => b.level === l).length;
                      return (
                        <td key={l} className="py-2 text-center">
                          <span className={`inline-block min-w-8 rounded px-2 py-0.5 ${n ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {n}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2 text-center font-medium">{inTopic.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">ממתינים לבדיקה ({queue.length})</h2>
            <Link href="/admin/books?status=unverified" className="text-sm text-violet-700 hover:underline">
              לכל הקטלוג
            </Link>
          </div>
          {queue.length === 0 ? (
            <p className="text-sm text-zinc-600">כל הספרים אומתו 🎉</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {queue.slice(0, 10).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/books/${b.id}`} className="min-w-0 truncate text-sm hover:text-violet-700">
                    <span className="font-medium">{b.title}</span>
                    {b.author && <span className="text-zinc-500"> · {b.author}</span>}
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    {b.agentReview && <Badge tone="violet">יש הצעת סוכן</Badge>}
                    {!b.published && <Badge>טיוטה</Badge>}
                    <VerificationBadge status={b.verification.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">הגדרות סביבה</h2>
          <ul className="space-y-3 text-sm">
            {config.map((c) => (
              <li key={c.label} className="flex items-start gap-2">
                {c.ok ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="מוגדר" />
                ) : (
                  <CircleX className="mt-0.5 size-4 shrink-0 text-red-500" aria-label="לא מוגדר" />
                )}
                <span>
                  {c.label}{" "}
                  <code dir="ltr" className="rounded bg-zinc-100 px-1 text-xs">
                    {c.env}
                  </code>
                  {c.note && <span className="block text-xs text-zinc-500">{c.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
