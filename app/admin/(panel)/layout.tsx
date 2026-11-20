import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ExternalLink, LogOut } from "lucide-react";
import { logout } from "../actions";
import { AdminNavLinks } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "ניהול", template: "%s · ניהול | ספרו לי על זה" },
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 lg:flex">
      <aside className="border-b border-zinc-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-e lg:border-b-0">
        <div className="flex items-center gap-2 px-5 py-4 text-violet-700">
          <BookOpen className="size-5" aria-hidden />
          <span className="font-semibold">ספרו לי על זה</span>
        </div>
        <nav aria-label="ניווט ניהול" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          <AdminNavLinks />
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ExternalLink className="size-4" aria-hidden />
            לאתר
          </Link>
          <form action={logout} className="lg:mt-auto">
            <button
              type="submit"
              className="flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <LogOut className="size-4" aria-hidden />
              יציאה
            </button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
