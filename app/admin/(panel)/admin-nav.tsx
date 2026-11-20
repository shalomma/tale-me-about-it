"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { LayoutDashboard, Library, MessagesSquare, Plus } from "lucide-react";

const NAV = [
  { href: "/admin", label: "סקירה", icon: LayoutDashboard },
  { href: "/admin/books", label: "קטלוג הספרים", icon: Library },
  { href: "/admin/chat", label: "שיחת מחקר", icon: MessagesSquare },
  { href: "/admin/books/new", label: "ספר חדש", icon: Plus },
];

/** The longest nav href that contains the path, so /admin/books/abc marks the catalog and /admin/books/new marks "new". */
function currentHref(pathname: string) {
  return NAV.map((n) => n.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

const NAV_LINK =
  "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900";

/** The pathname is only known at request time, so the static shell renders the links unmarked. */
export function AdminNavLinks() {
  return (
    <Suspense fallback={<Links current={undefined} />}>
      <CurrentLinks />
    </Suspense>
  );
}

function CurrentLinks() {
  return <Links current={currentHref(usePathname())} />;
}

function Links({ current }: { current: string | undefined }) {
  return NAV.map(({ href, label, icon: Icon }) => (
    <Link
      key={href}
      href={href}
      aria-current={href === current ? "page" : undefined}
      // Marked with an underline as well as color, so it doesn't rely on color alone.
      className={`${NAV_LINK} aria-[current=page]:bg-violet-50 aria-[current=page]:font-medium aria-[current=page]:text-violet-800 aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4`}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </Link>
  ));
}
