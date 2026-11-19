import { BookOpen } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-bg min-h-screen overflow-x-hidden">
      <SiteNav />
      <main>{children}</main>
      <footer className="bg-ink-dark py-12 text-center text-white/80">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-3 flex items-center justify-center gap-2 font-heading text-2xl font-bold text-white">
            <BookOpen className="size-6" aria-hidden />
            ספרו לי על זה
          </p>
          <p>© 2026 ספרו לי על זה. פותח באהבה למען הילדים וההורים.</p>
        </div>
      </footer>
    </div>
  );
}
