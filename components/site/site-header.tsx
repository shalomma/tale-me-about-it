import Link from "next/link";

const LINKS = [
  { href: "/#find", label: "מוצאים ספר" },
  { href: "/#library", label: "המדף" },
  { href: "/#together", label: "קוראים יחד" },
  { href: "/#why", label: "למה סיפור?" },
];

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" fill="#23274d" />
      <path d="M20 29c-3.5-2.4-7.5-3-11-2.4V12.2c3.6-.7 7.6 0 11 2.4 3.4-2.4 7.4-3.1 11-2.4v14.4c-3.5-.6-7.5 0-11 2.4Z" fill="#fbf7f0" />
      <path d="M20 14.6V29" stroke="#23274d" strokeWidth="1.6" />
      <path d="M29 5.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9Z" fill="#f6b941" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-night/5 bg-paper/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-night">
          <LogoMark />
          <span className="font-display text-xl font-semibold text-night">ספרו לי על זה</span>
        </Link>
        <nav aria-label="ניווט ראשי" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-full px-3.5 py-2 font-medium text-night-soft transition hover:bg-white hover:text-night">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/#find"
          className="rounded-full bg-night px-4 py-2 text-sm font-medium text-paper transition hover:bg-night/90 sm:px-5 sm:text-base"
        >
          מצאו ספר
        </Link>
      </div>
    </header>
  );
}
