import { Suspense } from "react";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { emptyContent } from "@/lib/catalog/schema";
import { BookEditor } from "../book-editor";

export default function NewBookPage() {
  return (
    <>
      <PageHeader
        title="ספר חדש"
        description="הזינו כותרת (ואם אפשר סופר/ת), ותנו לסוכן לחקור ולנסח את הניתוח, או עבדו על הספר בשיחת מחקר. ספר חדש נשמר כטיוטה עד שתפרסמו אותו."
      />
      <Suspense fallback={<p className="text-sm text-zinc-500">טוען…</p>}>
        <NewEditor />
      </Suspense>
    </>
  );
}

async function NewEditor() {
  await requireAdmin();
  return <BookEditor book={null} initial={emptyContent()} />;
}
