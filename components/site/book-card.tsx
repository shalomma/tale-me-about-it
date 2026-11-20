import Link from "next/link";
import type { PublicBook } from "@/lib/catalog/queries";
import { BookCover } from "./book-cover";
import { LevelMeter } from "./level-meter";

/** A book on the shelf: cover, title, author, length. */
export function BookCard({ book }: { book: PublicBook }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group block rounded-2xl p-2 outline-offset-4 focus-visible:outline-2 focus-visible:outline-night"
    >
      <BookCover
        id={book.id}
        title={book.title}
        author={book.author}
        className="transition duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-1 group-hover:shadow-lift"
      />
      <div className="mt-4 space-y-1 px-1">
        <h3 className="text-lg leading-snug font-semibold group-hover:underline group-hover:decoration-sun group-hover:decoration-2 group-hover:underline-offset-4">
          {book.title}
        </h3>
        <p className="text-sm text-night-mute">{book.author ?? " "}</p>
        <LevelMeter level={book.level} />
      </div>
    </Link>
  );
}
