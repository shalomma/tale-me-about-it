import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { BooksGuide } from "@/components/admin/guides";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { readCatalog } from "@/lib/catalog/store";
import { BooksTable } from "./books-table";

export default function BooksPage({ searchParams }: PageProps<"/admin/books">) {
  return (
    <>
      <BooksGuide />
      <PageHeader
        title="קטלוג הספרים"
        description="חיפוש, סינון, פרסום והסרה מהאתר. לחצו על ספר כדי לערוך אותו או להריץ עליו את הסוכן."
        actions={
          <Link
            href="/admin/books/new"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Plus className="size-4" aria-hidden />
            ספר חדש
          </Link>
        }
      />
      <Suspense fallback={<p className="text-sm text-zinc-500">טוען…</p>}>
        {searchParams.then((sp) => (
          <Books initialStatus={typeof sp.status === "string" ? sp.status : "all"} />
        ))}
      </Suspense>
    </>
  );
}

async function Books({ initialStatus }: { initialStatus: string }) {
  await requireAdmin();
  const { books } = await readCatalog();
  return <BooksTable books={books} initialStatus={initialStatus} />;
}
