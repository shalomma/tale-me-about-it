import Link from "next/link";
import { LogoMark, SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site min-h-screen overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[60] focus:rounded-full focus:bg-night focus:px-4 focus:py-2 focus:text-paper"
      >
        דלגו לתוכן
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <footer className="border-t border-night/5 bg-paper-deep print:hidden">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-xl font-semibold text-night">ספרו לי על זה</span>
            </Link>
            <p className="mt-3 max-w-md leading-relaxed">
              ספרי תמונות לילדים בני 3–5 שעוברים משהו לא פשוט, עם שאלות שעוזרות להורים לפתוח שיחה.
            </p>
          </div>
          <div className="rounded-2xl bg-white/60 p-5 text-sm leading-relaxed">
            <p className="font-semibold text-night">חשוב לדעת</p>
            <p className="mt-1">
              ספר הוא דרך טובה לפתוח שיחה, אבל הוא לא תחליף לליווי מקצועי. אם הקושי נמשך זמן רב או מחמיר, כדאי להתייעץ עם
              רופא הילדים, עם הגננת או עם פסיכולוג ילדים.
            </p>
          </div>
        </div>
        <div className="border-t border-night/5 py-5 text-center text-sm text-night-mute">
          © 2026 ספרו לי על זה · נבנה באהבה, לילדים ולהורים
        </div>
      </footer>
    </div>
  );
}
