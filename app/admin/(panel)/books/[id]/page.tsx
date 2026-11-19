import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { emptyContent } from "@/lib/catalog/schema";
import { readCatalog } from "@/lib/catalog/store";
import { BookEditor } from "../book-editor";

export default function EditBookPage({ params }: PageProps<"/admin/books/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">טוען…</p>}>
      {params.then(({ id }) => (
        <Editor id={id} />
      ))}
    </Suspense>
  );
}

async function Editor({ id }: { id: string }) {
  await requireAdmin();
  const { books } = await readCatalog();
  const book = books.find((b) => b.id === id);
  if (!book) notFound();
  return (
    <>
      <PageHeader title={book.title} description={book.author ?? undefined} />
      <BookEditor book={book} initial={emptyContent()} />
    </>
  );
}
