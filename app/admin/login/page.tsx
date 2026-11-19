import type { Metadata } from "next";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "כניסה לניהול", robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-violet-700">
          <BookOpen className="size-6" aria-hidden />
          <span className="text-lg font-semibold">ספרו לי על זה · ניהול</span>
        </div>
        <Suspense>
          {searchParams.then((sp) => (
            <LoginForm next={typeof sp.next === "string" ? sp.next : "/admin"} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
