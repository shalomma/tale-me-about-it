import type { Level } from "@/lib/catalog/schema";
import { LEVEL_UI } from "./copy";

/** Text length as three little bars, e.g. ▮▮▯ "אורך בינוני". */
export function LevelMeter({ level, detailed = false }: { level: Level; detailed?: boolean }) {
  const ui = LEVEL_UI[level];
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-night-mute">
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full ${i <= ui.step ? "bg-night/70" : "bg-night/15"}`}
            style={{ height: `${6 + i * 3}px` }}
          />
        ))}
      </span>
      <span>{detailed ? ui.description : ui.short}</span>
    </span>
  );
}
