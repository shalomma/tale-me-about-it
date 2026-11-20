"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BookPlus,
  ExternalLink,
  FilePen,
  Library,
  LoaderCircle,
  MessagesSquare,
  ScrollText,
  Search,
  SendHorizontal,
  Square,
  TriangleExclamationPoint,
} from "lucide-react";
import { Button, Card } from "@/components/admin/ui";
import type { AgentSettings } from "@/lib/agent/settings";
import { type ChatStreamEvent, type ChatSummary, type Draft, TOOL_LABELS, type TranscriptItem } from "@/lib/chat/types";
import { ChatsPanel, DraftPanel, PromptPanel } from "./side-panels";

type ChatState = {
  id: string | null;
  title: string;
  transcript: TranscriptItem[];
  draft: Draft | null;
  bookId: string | null;
  savedAt: string | null;
};

type Tab = "draft" | "prompt" | "chats";

const TOOL_ICONS: Record<string, typeof FilePen> = {
  [TOOL_LABELS.update_draft]: FilePen,
  [TOOL_LABELS.save_to_catalog]: BookPlus,
  [TOOL_LABELS.read_catalog]: Library,
};

export function ChatWorkspace({
  initial,
  seedBook,
  chats: initialChats,
  settings,
  basePrompt,
}: {
  initial: ChatState;
  seedBook: { id: string; title: string } | null;
  chats: ChatSummary[];
  settings: AgentSettings;
  basePrompt: string;
}) {
  const [chat, setChat] = useState<ChatState>(initial);
  const [chats, setChats] = useState(initialChats);
  const [previousDraft, setPreviousDraft] = useState<Draft | null>(null);
  const [live, setLive] = useState<TranscriptItem[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<Tab>(initial.draft ? "draft" : "prompt");
  const [announcement, setAnnouncement] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const draftRef = useRef<Draft | null>(initial.draft);
  // Follow new output only while the reader is at the bottom, so scrolling up to read isn't undone.
  const stickToBottom = useRef(true);

  const items = [...chat.transcript, ...live];
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [items.length, live, running, error]);

  /** Keeps the replaced draft so the panel can mark what the latest update changed. */
  function setDraft(draft: Draft | null) {
    const current = draftRef.current;
    if (draft && current && draft.updatedAt !== current.updatedAt) setPreviousDraft(current);
    draftRef.current = draft;
    setChat((c) => ({ ...c, draft }));
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || running) return;
    setRunning(true);
    setError(null);
    setInput("");
    setAnnouncement("הסוכן עובד…");
    stickToBottom.current = true;
    setChat((c) => ({ ...c, transcript: [...c.transcript, { kind: "user", text: message }] }));
    setLive([]);
    const controller = new AbortController();
    abortRef.current = controller;
    let finished = false;

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: chat.id, bookId: chat.id ? null : (seedBook?.id ?? null), message }),
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
          if (line.trim()) finished = handle(JSON.parse(line) as ChatStreamEvent, message) || finished;
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      if (!finished) {
        // The server never confirmed the turn: take the message back into the box.
        setChat((c) => ({ ...c, transcript: c.transcript.slice(0, -1) }));
        setInput((v) => v || message);
      }
      setLive([]);
      setRunning(false);
      abortRef.current = null;
      setAnnouncement(finished ? "הסוכן סיים לענות" : "הסוכן נעצר");
    }
  }

  /** Applies one stream event; returns true once the server has saved the turn. */
  function handle(event: ChatStreamEvent, message: string): boolean {
    switch (event.type) {
      case "text":
        setLive((l) => {
          const last = l.at(-1);
          if (last?.kind === "assistant") return [...l.slice(0, -1), { ...last, text: last.text + event.delta }];
          return [...l, { kind: "assistant", text: event.delta, sources: [] }];
        });
        return false;
      case "search":
        setLive((l) => [...l, { kind: "search", query: event.query }]);
        return false;
      case "tool":
        setLive((l) => [...l, { kind: "tool", label: event.label }]);
        return false;
      case "draft":
        setDraft(event.draft);
        setTab("draft");
        return false;
      case "error":
        setError(event.message);
        return false;
      case "done": {
        const { id, transcript, draft, bookId, savedAt, title } = event;
        setDraft(draft);
        setChat((c) => ({ ...c, id: id ?? c.id, transcript, bookId, savedAt, title }));
        if (id) {
          if (!chat.id) window.history.replaceState(null, "", `/admin/chat/${id}`);
          setChats((list) => [
            { id, title, bookId, updatedAt: new Date().toISOString() },
            ...list.filter((c) => c.id !== id),
          ]);
        }
        // If the turn failed, the server rolled it back: offer the message again.
        const kept = transcript.some((t) => t.kind === "user" && t.text === message);
        if (!kept) setInput((v) => v || message);
        return true;
      }
    }
  }

  const unsaved = Boolean(chat.draft) && (!chat.savedAt || chat.draft!.updatedAt > chat.savedAt);
  const quickPrompts =
    seedBook && !chat.id
      ? ["תבדוק את הרשומה מול מקורות ברשת ותציע תיקונים", "תציע שאלות תיווך נוספות"]
      : chat.draft
        ? [
            "מה עוד לא הצלחת לאמת?",
            "תבדוק את העלילה מול מקור נוסף",
            "תנסח מחדש את שאלות התיווך: קצרות ופשוטות יותר",
            ...(unsaved ? [chat.bookId ? "תעדכן את הספר בקטלוג" : "תוסיף את הספר לקטלוג"] : []),
          ]
        : [];

  const TABS: { id: Tab; label: string; icon: typeof FilePen }[] = [
    { id: "draft", label: "טיוטה", icon: FilePen },
    { id: "prompt", label: "הנחיות לסוכן", icon: ScrollText },
    { id: "chats", label: `שיחות (${chats.length})`, icon: MessagesSquare },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      {/* Conversation */}
      <Card className="flex h-[75dvh] flex-col lg:h-[calc(100dvh-5rem)]">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-5 py-3">
          <div className="min-w-0">
            <h1 className="truncate font-semibold">{chat.title || seedBook?.title || "שיחת מחקר חדשה"}</h1>
            <p className="text-xs text-zinc-500">
              {chat.bookId || seedBook ? "שיחה על ספר מהקטלוג" : "מחקר על ספר ובניית רשומה לקטלוג, יחד עם הסוכן"}
            </p>
          </div>
          {(chat.bookId ?? seedBook?.id) && (
            <Link
              href={`/admin/books/${chat.bookId ?? seedBook?.id}`}
              className="inline-flex items-center gap-1 text-sm text-violet-700 hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              לעורך הספר
            </Link>
          )}
        </header>

        {/* One short status in a live region. Making the whole transcript live would have
            screen readers read every streamed fragment. */}
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        <div
          ref={logRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
          }}
          role="log"
          aria-live="off"
          aria-label="השיחה"
          tabIndex={0}
          className="flex-1 space-y-3 overflow-y-auto px-5 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-600"
        >
          {items.length === 0 && <EmptyState seedTitle={seedBook?.title ?? null} />}
          {items.map((item, i) => (
            <Item key={i} item={item} />
          ))}
          {running && (
            <p className="flex items-center gap-1.5 text-xs text-violet-700">
              <LoaderCircle className="size-3.5 motion-safe:animate-spin" aria-hidden />
              הסוכן עובד…
            </p>
          )}
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <TriangleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}
        </div>

        <form
          className="space-y-2 border-t border-zinc-200 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          {quickPrompts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={running}
                  onClick={() => send(p)}
                  className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs text-violet-800 hover:bg-violet-100 disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey) return;
                e.preventDefault();
                // Enter that confirms an IME composition must not send. keyCode 229 catches
                // Safari, which clears isComposing before this handler runs.
                if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                e.currentTarget.form?.requestSubmit();
              }}
              placeholder={chat.transcript.length || seedBook ? "כתבו לסוכן…" : "שם הספר (ואם אפשר סופר/ת), או כל שאלה"}
              aria-label="הודעה לסוכן"
              className="field-sizing-content max-h-48 min-h-16 flex-1 resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm leading-relaxed placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
            />
            {running ? (
              <Button type="button" onClick={() => abortRef.current?.abort()} aria-label="עצירה">
                <Square className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={!input.trim()} aria-label="שליחה">
                <SendHorizontal className="size-4 rtl:-scale-x-100" aria-hidden />
              </Button>
            )}
          </div>
          <p className="text-xs text-zinc-500">Enter לשליחה, Shift+Enter לשורה חדשה. כל תור יכול לקחת דקה-שתיים כשהסוכן מחפש ברשת.</p>
        </form>
      </Card>

      {/* Side panel */}
      <div className="xl:h-[calc(100dvh-5rem)] xl:overflow-y-auto">
        <div
          role="tablist"
          aria-label="לוח צד"
          onKeyDown={(e) => {
            // Arrow keys move between tabs and select them (selection follows focus).
            // Next is to the left in RTL.
            const i = TABS.findIndex((t) => t.id === tab);
            const step = { ArrowLeft: 1, ArrowRight: -1, Home: -i, End: TABS.length - 1 - i }[e.key];
            if (step === undefined) return;
            e.preventDefault();
            const next = TABS[(i + step + TABS.length) % TABS.length].id;
            setTab(next);
            tabRefs.current[next]?.focus();
          }}
          className="mb-3 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm whitespace-nowrap text-zinc-600 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-violet-600 aria-selected:bg-violet-50 aria-selected:text-violet-800 aria-selected:after:absolute aria-selected:after:inset-x-2 aria-selected:after:bottom-0 aria-selected:after:border-b-2 aria-selected:after:border-violet-600"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
        {/* All panels stay mounted (hidden when not selected), so unsaved text in one survives switching tabs. */}
        <div role="tabpanel" id="panel-draft" aria-labelledby="tab-draft" hidden={tab !== "draft"}>
          <DraftPanel
            chatId={chat.id}
            draft={chat.draft}
            previous={previousDraft}
            bookId={chat.bookId}
            savedAt={chat.savedAt}
            busy={running}
            onSaved={(bookId, savedAt) => setChat((c) => ({ ...c, bookId, savedAt }))}
          />
        </div>
        <div role="tabpanel" id="panel-prompt" aria-labelledby="tab-prompt" hidden={tab !== "prompt"}>
          <PromptPanel settings={settings} basePrompt={basePrompt} />
        </div>
        <div role="tabpanel" id="panel-chats" aria-labelledby="tab-chats" hidden={tab !== "chats"}>
          <ChatsPanel chats={chats} currentId={chat.id} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ seedTitle }: { seedTitle: string | null }) {
  return (
    <div className="mx-auto max-w-md space-y-2 py-10 text-center text-sm text-zinc-600">
      {seedTitle ? (
        <p>
          שיחה על <strong>{seedTitle}</strong>. הרשומה הנוכחית כבר בטיוטה. בקשו מהסוכן לבדוק אותה, לשנות ניסוח או להוסיף שאלות, וכשתהיו מרוצים בקשו לעדכן את הספר בקטלוג.
        </p>
      ) : (
        <>
          <p>כתבו שם של ספר. הסוכן יחפש ברשת, יבדוק שהספר קיים ומה קורה בו, וינסח טיוטת רשומה בלוח שבצד.</p>
          <p>משם ממשיכים בשיחה: מבקשים תיקונים, שואלים מה לא אומת. כשהטיוטה טובה, בקשו &quot;תוסיף לקטלוג&quot;. הספר יישמר כטיוטה לא מפורסמת.</p>
        </>
      )}
    </div>
  );
}

function Item({ item }: { item: TranscriptItem }) {
  switch (item.kind) {
    case "user":
      return (
        <div className="flex">
          <p dir="auto" className="max-w-[85%] rounded-2xl rounded-ss-sm bg-violet-600 px-4 py-2 text-sm whitespace-pre-wrap text-white">
            {item.text}
          </p>
        </div>
      );
    case "assistant":
      return (
        <div className="max-w-[95%] space-y-2 rounded-2xl rounded-se-sm bg-zinc-100 px-4 py-3">
          <p dir="auto" className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-900">
            {item.text.trim()}
          </p>
          {item.sources.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {item.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex max-w-60 items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs text-violet-700 ring-1 ring-zinc-200 hover:underline"
                  >
                    <ExternalLink className="size-3 shrink-0" aria-hidden />
                    <span dir="auto" className="truncate">
                      {s.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    case "search":
      return (
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Search className="size-3.5 shrink-0" aria-hidden />
          חיפוש: <span dir="auto">{item.query}</span>
        </p>
      );
    case "tool": {
      const Icon = TOOL_ICONS[item.label] ?? FilePen;
      return (
        <p className="flex items-center gap-1.5 text-xs text-violet-700">
          <Icon className="size-3.5 shrink-0" aria-hidden />
          {item.label}
        </p>
      );
    }
  }
}
