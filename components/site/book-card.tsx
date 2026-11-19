import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { PublicBook } from "@/lib/catalog/queries";
import { LevelBadge } from "./level-badge";

export function BookCard({ book, note }: { book: PublicBook; note?: string }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-purple-100 bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 size-6 shrink-0 text-primary" aria-hidden />
          <div>
            <h3 className="font-heading text-xl font-bold text-ink-dark">{book.title}</h3>
            {book.author && <p className="text-sm text-ink/80">{book.author}</p>}
          </div>
        </div>
        <LevelBadge level={book.level} />
      </div>
      {book.thematic.problem && <p className="leading-relaxed text-ink">{book.thematic.problem}</p>}
      {note && <p className="text-sm font-medium text-accent-pink">{note}</p>}
      <span className="mt-auto inline-flex items-center gap-1 font-bold text-primary">
        לניתוח המלא ולשאלות להורה
        <ArrowLeft className="size-4 transition group-hover:-translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
