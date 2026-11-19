import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { BookAnalysis } from "@/components/book-analysis";
import { LevelBadge } from "@/components/site/level-badge";
import { getPublishedBook, getPublishedBooks } from "@/lib/catalog/queries";
import { TOPICS } from "@/lib/catalog/schema";

export async function generateStaticParams() {
  const books = await getPublishedBooks();
  return books.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/books/[id]">): Promise<Metadata> {
  const book = await getPublishedBook((await params).id);
  if (!book) return {};
  return {
    title: book.author ? `${book.title} (${book.author})` : book.title,
    description: book.thematic.problem || undefined,
  };
}

export default function BookPage({ params }: PageProps<"/books/[id]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6">
      <Link href="/#library" className="mb-6 inline-flex items-center gap-1 font-bold text-primary hover:underline">
        <ArrowRight className="size-4" aria-hidden />
        חזרה לספרייה
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/70" />}>
        {params.then(({ id }) => (
          <BookArticle id={id} />
        ))}
      </Suspense>
    </div>
  );
}

async function BookArticle({ id }: { id: string }) {
  const book = await getPublishedBook(id);
  if (!book) notFound();

  return (
    <article className="rounded-3xl border border-purple-100 bg-surface p-6 shadow-soft sm:p-10">
      <header className="mb-8 border-b border-purple-100 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1.5 size-8 shrink-0 text-primary" aria-hidden />
            <div>
              <h1 className="text-3xl font-bold text-ink-dark sm:text-4xl">{book.title}</h1>
              {book.author && <p className="mt-1 text-lg">{book.author}</p>}
            </div>
          </div>
          <LevelBadge level={book.level} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {book.topics.map((t) => (
            <span key={t} className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-primary">
              {TOPICS[t]}
            </span>
          ))}
        </div>
      </header>
      <BookAnalysis book={book} />
    </article>
  );
}
