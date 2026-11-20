import "server-only";

import { z } from "zod";
import { newBookId } from "@/lib/catalog/ids";
import { type Book, BookContentSchema } from "@/lib/catalog/schema";
import { updateCatalog } from "@/lib/catalog/store";
import type { Chat } from "./types";

export class CommitError extends Error {}

/**
 * Writes the chat's draft to the catalog and links the chat to the book.
 * A new book is saved unpublished and unverified, for the editor to review;
 * a book the chat is already linked to gets its text replaced and keeps its
 * published and review status. The caller saves the chat and revalidates.
 */
export async function commitDraft(chat: Chat): Promise<{ bookId: string; created: boolean; title: string }> {
  if (!chat.draft) throw new CommitError("אין עדיין טיוטה לשמור.");
  const parsed = BookContentSchema.safeParse(chat.draft.content);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.join(".") ?? "";
    throw new CommitError(
      field === "topics" ? "צריך לבחור לפחות נושא אחד לפני השמירה." : `שדה לא תקין בטיוטה: ${field} (${issue?.message})`,
    );
  }
  const content = parsed.data;
  const { notes, sources } = chat.draft;
  const now = new Date().toISOString();

  const result = await updateCatalog((catalog) => {
    const existing = chat.bookId ? catalog.books.find((b) => b.id === chat.bookId) : undefined;
    if (existing) {
      Object.assign(existing, content, { updatedAt: now });
      return { bookId: existing.id, created: false };
    }
    const sourceLines = sources.map((s) => `- ${s.title}: ${s.url}`).join("\n");
    const book: Book = {
      ...content,
      id: newBookId(),
      published: false,
      verification: {
        status: "unverified",
        note: ["נוסף משיחת מחקר עם הסוכן.", notes.trim(), sourceLines && `מקורות:\n${sourceLines}`]
          .filter(Boolean)
          .join("\n\n"),
        updatedAt: now,
      },
      agentReview: null,
      createdAt: now,
      updatedAt: now,
    };
    catalog.books.push(book);
    return { bookId: book.id, created: true };
  });

  chat.bookId = result.bookId;
  chat.savedAt = now;
  return { ...result, title: content.title };
}

export function commitErrorMessage(error: unknown): string {
  if (error instanceof CommitError) return error.message;
  if (error instanceof z.ZodError) return `שדה לא תקין: ${error.issues[0]?.path.join(".")}`;
  return error instanceof Error ? error.message : "שגיאה לא צפויה בשמירה";
}
