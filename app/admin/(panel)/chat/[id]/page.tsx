import { Suspense } from "react";
import { WorkspaceLoader } from "../workspace-loader";

export const metadata = { title: "שיחת מחקר" };

export default function ChatPage({ params }: PageProps<"/admin/chat/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">טוען…</p>}>
      {params.then(({ id }) => (
        <WorkspaceLoader chatId={id} bookId={null} />
      ))}
    </Suspense>
  );
}
