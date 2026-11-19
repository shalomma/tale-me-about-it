"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

const LINKS = [
  { href: "/#vision", label: "חזון ההורים" },
  { href: "/#smart-match", label: "התאמה חכמה" },
  { href: "/#ritual", label: "טקס הפתיחה" },
  { href: "/#heart-keys", label: "מפתחות הלב" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 py-3 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-md" : "glass-card"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BookOpen className="size-8 text-primary" aria-hidden />
          <span className="font-heading text-2xl font-bold tracking-tight text-ink-dark">ספרו לי על זה</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-lg font-medium text-ink transition-colors hover:text-primary">
                {l.label}
              </Link>
            ))}
          </div>
          <Link
            href="/#library"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-bold text-white shadow-soft transition hover:scale-105 hover:bg-purple-700 sm:text-lg"
          >
            <Sparkles className="size-5" aria-hidden />
            לכניסה לממלכה
          </Link>
        </div>
      </div>
    </nav>
  );
}
