import "server-only";

import { z } from "zod";
import { deleteJson, readJson, writeJson } from "@/lib/storage/json-store";
import { type Chat, ChatSchema, type ChatSummary } from "./types";

/**
 * Each chat is one JSON file (its full API history can be large); a small
 * index file lists them for the sidebar.
 */
const INDEX_PATH = "chats/index.json";
const chatPath = (id: string) => `chats/${id}.json`;

const IndexSchema = z.array(
  z.object({ id: z.string(), title: z.string(), bookId: z.string().nullable(), updatedAt: z.string() }),
);

export function newChatId() {
  return `chat-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function listChats(): Promise<ChatSummary[]> {
  const parsed = IndexSchema.safeParse(await readJson(INDEX_PATH));
  return parsed.success ? parsed.data.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
}

export async function getChat(id: string): Promise<Chat | null> {
  if (!/^chat-[a-z0-9]+$/.test(id)) return null;
  const data = await readJson(chatPath(id));
  return data ? ChatSchema.parse(data) : null;
}

export async function saveChat(chat: Chat): Promise<void> {
  chat.updatedAt = new Date().toISOString();
  await writeJson(chatPath(chat.id), ChatSchema.parse(chat));
  const index = (await listChats()).filter((c) => c.id !== chat.id);
  const { id, title, bookId, updatedAt } = chat;
  await writeJson(INDEX_PATH, [{ id, title, bookId, updatedAt }, ...index]);
}

export async function removeChat(id: string): Promise<void> {
  await deleteJson(chatPath(id));
  await writeJson(INDEX_PATH, (await listChats()).filter((c) => c.id !== id));
}
