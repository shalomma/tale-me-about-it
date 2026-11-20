import { Suspense } from "react";
import { WorkspaceLoader } from "./workspace-loader";

export const metadata = { title: "שיחת מחקר" };

export default function NewChatPage({ searchParams }: PageProps<"/admin/chat">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">טוען…</p>}>
      {searchParams.then((sp) => (
        <WorkspaceLoader chatId={null} bookId={typeof sp.book === "string" ? sp.book : null} />
      ))}
    </Suspense>
  );
}
