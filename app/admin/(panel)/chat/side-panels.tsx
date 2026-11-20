"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BookPlus, CircleCheck, ExternalLink, Plus, Save, Trash } from "lucide-react";
import { deleteChat, saveAgentInstructions, saveChatDraft } from "../../actions";
import { Badge, Button, Card, Textarea } from "@/components/admin/ui";
import type { AgentSettings } from "@/lib/agent/settings";
import { ENTRY_FIELDS } from "@/lib/catalog/fields";
import type { ChatSummary, Draft } from "@/lib/chat/types";

const shortDate = (iso: string) => new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });

// --- Draft -------------------------------------------------------------------

export function DraftPanel({
  chatId,
  draft,
  previous,
  bookId,
  savedAt,
  busy,
  onSaved,
}: {
  chatId: string | null;
  draft: Draft | null;
  previous: Draft | null;
  bookId: string | null;
  savedAt: string | null;
  busy: boolean;
  onSaved: (bookId: string, savedAt: string | null) => void;
}) {
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  if (!draft) {
    return (
      <Card className="p-5 text-sm text-zinc-600">
        עוד אין טיוטה. כשהסוכן ינסח רשומה לספר היא תופיע כאן ותתעדכן לאורך השיחה.
      </Card>
    );
  }

  const unsaved = !savedAt || draft.updatedAt > savedAt;
  const fields = ENTRY_FIELDS.map(([label, read]) => ({
    label,
    value: read(draft.content),
    changed: previous ? read(previous.content).trim() !== read(draft.content).trim() : false,
  }));

  function save() {
    if (!chatId) return;
    setMessage(null);
    startSaving(async () => {
      const result = await saveChatDraft(chatId);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      onSaved(result.data.bookId, result.data.savedAt);
      setMessage({ tone: "ok", text: result.data.created ? "נוסף לקטלוג כטיוטה לא מפורסמת" : "הספר עודכן בקטלוג" });
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {unsaved ? <Badge tone="amber">{bookId ? "שינויים שלא נשמרו בקטלוג" : "עוד לא בקטלוג"}</Badge> : <Badge tone="green">שמור בקטלוג</Badge>}
          <span className="text-xs text-zinc-500">עודכן {shortDate(draft.updatedAt)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={save} disabled={!chatId || saving || busy || !unsaved}>
            {bookId ? <Save className="size-4" aria-hidden /> : <BookPlus className="size-4" aria-hidden />}
            {saving ? "שומר…" : bookId ? "עדכון הספר בקטלוג" : "הוספה לקטלוג"}
          </Button>
          {bookId && (
            <Link
              href={`/admin/books/${bookId}`}
              className="inline-flex items-center gap-1 px-2 text-sm text-violet-700 hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              פתיחה בעורך
            </Link>
          )}
        </div>
        {message && (
          <p role="status" className={`flex items-center gap-1 text-sm ${message.tone === "ok" ? "text-emerald-700" : "text-red-700"}`}>
            {message.tone === "ok" && <CircleCheck className="size-4" aria-hidden />}
            {message.text}
          </p>
        )}
        <p className="text-xs text-zinc-500">
          אפשר גם לבקש מהסוכן בשיחה. ספר חדש נשמר לא מפורסם ובסטטוס &quot;טרם נבדק&quot;. מפרסמים מהעורך.
        </p>
      </div>

      {draft.notes.trim() && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <h3 className="mb-1 font-medium">פתוח / לא אומת</h3>
          <p className="whitespace-pre-line">{draft.notes}</p>
        </div>
      )}

      <dl className="space-y-3 text-sm">
        {fields.map(({ label, value, changed }) => (
          <div key={label} className={changed ? "-ms-3 border-s-2 border-violet-500 ps-2.5" : undefined}>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              {label}
              {changed && <span className="text-violet-700">· עודכן עכשיו</span>}
            </dt>
            <dd className={`mt-0.5 whitespace-pre-line ${value ? "text-zinc-900" : "text-zinc-400"}`}>{value || "—"}</dd>
          </div>
        ))}
      </dl>

      {draft.sources.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-medium">מקורות</h3>
          <ul className="space-y-1 text-sm">
            {draft.sources.map((s, i) => (
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
    </Card>
  );
}

// --- Agent instructions ------------------------------------------------------

export function PromptPanel({ settings, basePrompt }: { settings: AgentSettings; basePrompt: string }) {
  const [text, setText] = useState(settings.instructions);
  const [saved, setSaved] = useState(settings);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const dirty = text.trim() !== saved.instructions;

  function save() {
    setError(null);
    startSaving(async () => {
      const result = await saveAgentInstructions(text);
      if (!result.ok) setError(result.error);
      else setSaved({ instructions: text.trim(), updatedAt: result.data.updatedAt });
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="font-semibold">הנחיות קבועות</h2>
        <p className="mt-1 text-sm text-zinc-600">
          מה שתכתבו כאן נשלח לסוכן בכל הודעה בשיחה ובכל בדיקת עובדות, כך שלא צריך לחזור על אותן בקשות. אפשר לכתוב בעברית.
        </p>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={8000}
        className="min-h-48"
        aria-label="הנחיות קבועות לסוכן"
        placeholder={"למשל:\n- תמיד חמש שאלות תיווך, לא יותר\n- העדיפו את אתר ההוצאה ואת הספרייה הלאומית כמקורות\n- בלי המילה \"טראומה\" בטקסט להורים"}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={save} disabled={saving || !dirty}>
          <Save className="size-4" aria-hidden />
          {saving ? "שומר…" : "שמירת ההנחיות"}
        </Button>
        {dirty ? (
          <span className="text-xs text-amber-700">לא נשמר</span>
        ) : (
          saved.updatedAt && <span className="text-xs text-zinc-500">נשמר {shortDate(saved.updatedAt)}. חל מההודעה הבאה.</span>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <details className="rounded-lg border border-zinc-200">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">ההנחיות הבסיסיות של הסוכן (לקריאה בלבד)</summary>
        <p className="px-3 text-xs text-zinc-500">
          הטקסט שהסוכן מקבל בתחילת כל שיחה, לפני ההנחיות הקבועות שלכם, כולל תיאור הכלים שלו. משנים אותו בקוד: lib/agent/chat-agent.ts ו-lib/agent/prompt.ts.
        </p>
        <pre dir="ltr" className="m-3 max-h-[28rem] overflow-auto rounded bg-zinc-50 p-3 text-start text-xs leading-relaxed whitespace-pre-wrap text-zinc-700">
          {basePrompt}
        </pre>
      </details>
    </Card>
  );
}

// --- Chat list ---------------------------------------------------------------

export function ChatsPanel({ chats, currentId }: { chats: ChatSummary[]; currentId: string | null }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, startDeleting] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="space-y-3 p-5">
      <Link
        href="/admin/chat"
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Plus className="size-4" aria-hidden />
        שיחה חדשה
      </Link>
      {chats.length === 0 ? (
        <p className="text-sm text-zinc-600">עוד אין שיחות שמורות.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {chats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/chat/${c.id}`}
                aria-current={c.id === currentId ? "page" : undefined}
                className={`block rounded-md px-2 py-2 hover:bg-zinc-50 ${c.id === currentId ? "bg-violet-50" : ""}`}
              >
                <span dir="auto" className="block truncate text-sm font-medium">{c.title || "ללא כותרת"}</span>
                <span className="flex gap-2 text-xs text-zinc-500">
                  {shortDate(c.updatedAt)}
                  {c.bookId && <span className="text-emerald-700">· בקטלוג</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {currentId && (
        <div className="border-t border-zinc-200 pt-3">
          {confirm ? (
            <div className="flex gap-2">
              <Button
                variant="danger"
                disabled={deleting}
                onClick={() =>
                  startDeleting(async () => {
                    const result = await deleteChat(currentId);
                    if (result && !result.ok) setError(result.error);
                  })
                }
              >
                <Trash className="size-4" aria-hidden />
                {deleting ? "מוחק…" : "כן, למחוק את השיחה"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>
                ביטול
              </Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setConfirm(true)} className="text-red-700">
              <Trash className="size-4" aria-hidden />
              מחיקת השיחה הזו
            </Button>
          )}
          <p className="mt-1 text-xs text-zinc-500">מוחק רק את השיחה. ספר שכבר נשמר בקטלוג נשאר.</p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </div>
      )}
    </Card>
  );
}
