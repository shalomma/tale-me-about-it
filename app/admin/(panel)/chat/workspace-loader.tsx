import { notFound } from "next/navigation";
import { CHAT_PROMPT_PREVIEW } from "@/lib/agent/chat-agent";
import { readAgentSettings } from "@/lib/agent/settings";
import { requireAdmin } from "@/lib/auth/guard";
import { readCatalog } from "@/lib/catalog/store";
import { getChat, listChats } from "@/lib/chat/store";
import { toTranscript } from "@/lib/chat/types";
import { ChatWorkspace } from "./chat-workspace";

/** Server half of the chat pages: loads the chat, the chat list and the agent settings. */
export async function WorkspaceLoader({ chatId, bookId }: { chatId: string | null; bookId: string | null }) {
  await requireAdmin();
  const [chats, settings, chat, catalog] = await Promise.all([
    listChats(),
    readAgentSettings(),
    chatId ? getChat(chatId) : null,
    bookId ? readCatalog() : null,
  ]);
  if (chatId && !chat) notFound();
  const seedBook = chat ? undefined : catalog?.books.find((b) => b.id === bookId);
  // A chat about an existing book starts with that book's entry as the draft
  // (the server sets up the same draft when the first message is sent).
  const seedDraft = seedBook
    ? {
        content: {
          title: seedBook.title,
          author: seedBook.author,
          topics: seedBook.topics,
          level: seedBook.level,
          linguistic: seedBook.linguistic,
          thematic: seedBook.thematic,
          psych: seedBook.psych,
          visuals: seedBook.visuals,
          mediation: seedBook.mediation,
        },
        notes: "",
        sources: [],
        updatedAt: seedBook.updatedAt,
      }
    : null;

  return (
    <ChatWorkspace
      key={chat?.id ?? `new-${bookId ?? ""}`}
      initial={{
        id: chat?.id ?? null,
        title: chat?.title ?? "",
        transcript: chat ? toTranscript(chat.messages) : [],
        draft: chat?.draft ?? seedDraft,
        bookId: chat?.bookId ?? seedBook?.id ?? null,
        savedAt: chat?.savedAt ?? seedBook?.updatedAt ?? null,
      }}
      seedBook={seedBook ? { id: seedBook.id, title: seedBook.title } : null}
      chats={chats}
      settings={settings}
      basePrompt={CHAT_PROMPT_PREVIEW}
    />
  );
}
