"use server";

import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAgentSettings } from "@/lib/agent/settings";
import { requireAdmin } from "@/lib/auth/guard";
import {
  adminConfigured,
  checkPassword,
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { newBookId } from "@/lib/catalog/ids";
import { CATALOG_TAG } from "@/lib/catalog/queries";
import { type Book, BookContentSchema, VERIFICATION_IDS } from "@/lib/catalog/schema";
import { updateCatalog } from "@/lib/catalog/store";
import { commitDraft, commitErrorMessage } from "@/lib/chat/commit";
import { getChat, removeChat, saveChat } from "@/lib/chat/store";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    return { ok: false, error: `שדה לא תקין: ${issue?.path.join(".")} (${issue?.message})` };
  }
  console.error("[admin action]", error);
  return { ok: false, error: error instanceof Error ? error.message : "שגיאה לא צפויה" };
}

// --- Session ---------------------------------------------------------------

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  if (!adminConfigured()) {
    return { error: "אזור הניהול לא מוגדר: חסרים ADMIN_PASSWORD או ADMIN_SESSION_SECRET (32 תווים לפחות)." };
  }
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) return { error: "סיסמה שגויה" };

  (await cookies()).set(SESSION_COOKIE, await createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  const next = String(formData.get("next") ?? "");
  // Only allow local admin paths as the redirect target.
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// --- Books -----------------------------------------------------------------

const MetaSchema = z.object({
  published: z.boolean(),
  verification: z.object({ status: z.enum(VERIFICATION_IDS), note: z.string() }),
});

export async function saveBook(
  id: string | null,
  content: unknown,
  meta: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    const parsedContent = BookContentSchema.parse(content);
    const parsedMeta = MetaSchema.parse(meta);
    const now = new Date().toISOString();

    const savedId = await updateCatalog((catalog) => {
      const existing = id ? catalog.books.find((b) => b.id === id) : undefined;
      if (id && !existing) throw new Error("הספר לא נמצא (אולי נמחק?)");

      const verificationChanged =
        !existing ||
        existing.verification.status !== parsedMeta.verification.status ||
        existing.verification.note !== parsedMeta.verification.note;

      const book: Book = {
        ...(existing ?? { id: newBookId(), agentReview: null, createdAt: now }),
        ...parsedContent,
        published: parsedMeta.published,
        verification: {
          ...parsedMeta.verification,
          updatedAt: verificationChanged ? now : (existing?.verification.updatedAt ?? null),
        },
        updatedAt: now,
      } as Book;

      if (existing) catalog.books[catalog.books.indexOf(existing)] = book;
      else catalog.books.push(book);
      return book.id;
    });

    updateTag(CATALOG_TAG);
    return { ok: true, data: { id: savedId } };
  } catch (error) {
    return failure(error);
  }
}

export async function setPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await updateCatalog((catalog) => {
      const book = catalog.books.find((b) => b.id === id);
      if (!book) throw new Error("הספר לא נמצא");
      book.published = published;
      book.updatedAt = new Date().toISOString();
    });
    updateTag(CATALOG_TAG);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteBook(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await updateCatalog((catalog) => {
      const index = catalog.books.findIndex((b) => b.id === id);
      if (index === -1) throw new Error("הספר לא נמצא");
      catalog.books.splice(index, 1);
    });
    updateTag(CATALOG_TAG);
  } catch (error) {
    return failure(error);
  }
  redirect("/admin/books");
}

// --- Research chat -----------------------------------------------------------

export async function saveAgentInstructions(instructions: string): Promise<ActionResult<{ updatedAt: string | null }>> {
  await requireAdmin();
  try {
    const settings = await writeAgentSettings(z.string().max(8000).parse(instructions));
    return { ok: true, data: { updatedAt: settings.updatedAt } };
  } catch (error) {
    return failure(error);
  }
}

/** The draft panel's save button: same as asking the agent to save. */
export async function saveChatDraft(
  chatId: string,
): Promise<ActionResult<{ bookId: string; created: boolean; savedAt: string | null }>> {
  await requireAdmin();
  try {
    const chat = await getChat(chatId);
    if (!chat) throw new Error("השיחה לא נמצאה");
    const saved = await commitDraft(chat);
    await saveChat(chat);
    updateTag(CATALOG_TAG);
    return { ok: true, data: { bookId: saved.bookId, created: saved.created, savedAt: chat.savedAt } };
  } catch (error) {
    return { ok: false, error: commitErrorMessage(error) };
  }
}

export async function deleteChat(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await removeChat(id);
  } catch (error) {
    return failure(error);
  }
  redirect("/admin/chat");
}
