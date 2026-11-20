import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, BookOpenText, Hand, Heart, Languages, type LucideIcon, Palette } from "lucide-react";
import { BookCard } from "@/components/site/book-card";
import { BookCover } from "@/components/site/book-cover";
import { TOPIC_UI } from "@/components/site/copy";
import { Star } from "@/components/site/doodles";
import { LevelMeter } from "@/components/site/level-meter";
import { PrintButton } from "@/components/site/print-button";
import { matchBooks } from "@/lib/catalog/match";
import { getPublishedBook, getPublishedBooks, type PublicBook } from "@/lib/catalog/queries";

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
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8">
      <Link
        href="/#library"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-night-mute transition hover:bg-white hover:text-night print:hidden"
      >
        <ArrowRight className="size-4" aria-hidden />
        חזרה למדף
      </Link>
      <Suspense fallback={<BookSkeleton />}>
        {params.then(({ id }) => (
          <BookView id={id} />
        ))}
      </Suspense>
    </div>
  );
}

function BookSkeleton() {
  return (
    <div className="mt-6 grid animate-pulse gap-10 md:grid-cols-[300px_1fr]">
      <div className="mx-auto aspect-[3/4] w-56 rounded-xl bg-paper-deep md:w-full" />
      <div className="space-y-4 pt-4">
        <div className="h-6 w-40 rounded-full bg-paper-deep" />
        <div className="h-12 w-3/4 rounded-2xl bg-paper-deep" />
        <div className="h-24 rounded-2xl bg-paper-deep" />
      </div>
    </div>
  );
}

async function BookView({ id }: { id: string }) {
  const [book, all] = await Promise.all([getPublishedBook(id), getPublishedBooks()]);
  if (!book) notFound();

  const related = book.topics[0]
    ? matchBooks(all, book.topics[0], book.level)
        .filter((b) => b.id !== book.id)
        .slice(0, 4)
    : [];

  return (
    <article>
      {/* Header */}
      <header className="mt-6 grid items-start gap-10 md:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
        <div className="relative mx-auto w-52 sm:w-60 md:w-full print:w-40">
          <div aria-hidden className="absolute -inset-6 -z-0 rounded-full bg-sun-soft/80 blur-2xl print:hidden" />
          <Star className="absolute -top-3 -left-3 z-10 size-7 animate-twinkle text-sun print:hidden" />
          <BookCover id={book.id} title={book.title} author={book.author} className="relative -rotate-2" />
        </div>

        <div className="md:pt-2">
          <ul className="flex flex-wrap gap-2">
            {book.topics.map((t) => {
              const ui = TOPIC_UI[t];
              const Icon = ui.icon;
              return (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-night-soft shadow-soft">
                  <Icon className="size-4" aria-hidden />
                  {ui.label}
                </li>
              );
            })}
          </ul>
          <h1 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">{book.title}</h1>
          {book.author && <p className="mt-2 text-lg text-night-mute">מאת {book.author}</p>}
          <div className="mt-3">
            <LevelMeter level={book.level} detailed />
          </div>

          {book.thematic.problem && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-night">{book.thematic.problem}</p>}

          {book.psych.innerVoice && (
            <figure className="mt-6 max-w-2xl rounded-3xl border-s-4 border-sun bg-white p-5 shadow-soft">
              <figcaption className="text-sm font-medium text-night-mute">המשפט שהילד לוקח איתו</figcaption>
              <blockquote className="mt-1 font-hand text-xl leading-relaxed text-night">{book.psych.innerVoice}</blockquote>
            </figure>
          )}

          <div className="mt-7 flex flex-wrap gap-3 print:hidden">
            {book.mediation.length > 0 && (
              <a
                href="#questions"
                className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-2.5 font-medium text-paper transition hover:bg-night/90"
              >
                {book.mediation.length} שאלות לשיחה
                <ArrowLeft className="size-4" aria-hidden />
              </a>
            )}
            <PrintButton />
          </div>
        </div>
      </header>

      {/* Questions */}
      {book.mediation.length > 0 && (
        <section id="questions" aria-labelledby="questions-title" className="mt-16 scroll-mt-20 rounded-[32px] bg-white p-6 shadow-soft sm:p-10 print:mt-8 print:p-0 print:shadow-none">
          <h2 id="questions-title" className="text-3xl font-semibold sm:text-4xl">
            שאלות לשאול תוך כדי קריאה
          </h2>
          <p className="mt-2 text-lg">אפשר לבחור אחת או שתיים. אין תשובות נכונות, רק הזמנה לדבר.</p>
          <ol className="mt-8 grid gap-4 lg:grid-cols-2">
            {book.mediation.map((m, i) => (
              <li key={i} className="flex gap-4 rounded-3xl bg-paper p-5 break-inside-avoid">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-semibold ${NUMBER_COLORS[i % NUMBER_COLORS.length]}`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-hand text-xl leading-relaxed text-night">{m.question}</p>
                  {m.explanation && (
                    <>
                      <details className="group mt-2 print:hidden">
                        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-night-mute transition hover:text-night [&::-webkit-details-marker]:hidden">
                          <span className="inline-block transition group-open:-rotate-90" aria-hidden>
                            ‹
                          </span>
                          למה זה עוזר?
                        </summary>
                        <p className="mt-2 leading-relaxed">{m.explanation}</p>
                      </details>
                      <p className="mt-2 hidden text-sm leading-relaxed print:block">{m.explanation}</p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/#together"
            className="mt-6 flex items-center gap-3 rounded-2xl bg-sun-soft/60 px-5 py-4 text-night transition hover:bg-sun-soft print:hidden"
          >
            <Hand className="size-5 shrink-0" aria-hidden />
            <span className="flex-1">
              <b className="font-semibold">רגע לפני שפותחים את הספר:</b> יד על הלב ושלוש נשימות עמוקות יחד.
            </span>
            <span className="text-sm font-medium whitespace-nowrap underline underline-offset-4">לטקס הפתיחה</span>
          </Link>
        </section>
      )}

      {/* What's in the book */}
      <section aria-labelledby="inside-title" className="mt-16 print:break-before-page">
        <h2 id="inside-title" className="text-3xl font-semibold sm:text-4xl">
          מה יש בספר
        </h2>
        <p className="mt-2 text-lg">הניתוח שלנו, כדי שתדעו למה לצפות לפני שאתם מקריאים.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <AnalysisCard
            icon={BookOpenText}
            color="bg-sky-soft text-[#2f6e9c]"
            title="הסיפור"
            rows={[
              ["הבעיה", book.thematic.problem],
              ["מה מניע את הגיבור", book.thematic.motive],
              ["הטוויסט", book.thematic.twist],
            ]}
          />
          <AnalysisCard
            icon={Heart}
            color="bg-rose-soft text-[#a4485b]"
            title="המסר הרגשי"
            rows={[
              ["הקול הפנימי", book.psych.innerVoice],
              ["התמודדות עם פחד", book.psych.copingWithFear],
              ["תוצאה לא צפויה", book.psych.unexpectedOutcome],
            ]}
          />
          <AnalysisCard
            icon={Languages}
            color="bg-lilac-soft text-[#5b45a3]"
            title="שפה וקצב"
            rows={[
              ["חריזה ומשקל", book.linguistic.rhyme],
              ["אוצר מילים", book.linguistic.vocabulary],
              ["טיפוגרפיה", book.linguistic.typography],
            ]}
          />
          <AnalysisCard icon={Palette} color="bg-sun-soft text-[#7a5208]" title="האיורים" rows={[["", book.visuals]]} />
        </div>
      </section>

      {related.length > 0 && <Related books={related} />}
    </article>
  );
}

const NUMBER_COLORS = [
  "bg-sun-soft text-[#7a5208]",
  "bg-sky-soft text-[#2f6e9c]",
  "bg-rose-soft text-[#a4485b]",
  "bg-sage-soft text-[#3c7a59]",
  "bg-lilac-soft text-[#5b45a3]",
];

function AnalysisCard({
  icon: Icon,
  color,
  title,
  rows,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  rows: [string, string][];
}) {
  const filled = rows.filter(([, v]) => v.trim());
  if (!filled.length) return null;
  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft break-inside-avoid sm:p-7">
      <h3 className="flex items-center gap-3 text-xl font-semibold">
        <span className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-5" aria-hidden />
        </span>
        {title}
      </h3>
      <dl className="mt-4 space-y-3">
        {filled.map(([label, value]) => (
          <div key={label || "text"}>
            {label && <dt className="text-sm font-semibold text-night">{label}</dt>}
            <dd className="leading-relaxed">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Related({ books }: { books: PublicBook[] }) {
  return (
    <section aria-labelledby="related-title" className="mt-20 print:hidden">
      <h2 id="related-title" className="text-3xl font-semibold">
        עוד ספרים שיכולים לעזור
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6">
        {books.map((b) => (
          <li key={b.id}>
            <BookCard book={b} />
          </li>
        ))}
      </ul>
    </section>
  );
}
