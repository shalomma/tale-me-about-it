"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border-2 border-night/15 bg-white px-5 py-2.5 font-medium text-night transition hover:border-night/40"
    >
      <Printer className="size-4.5" aria-hidden />
      הדפסת כרטיס קריאה
    </button>
  );
}
