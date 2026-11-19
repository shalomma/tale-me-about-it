import { type Level, LEVELS } from "@/lib/catalog/schema";

const STYLES: Record<Level, string> = {
  beginner: "bg-yellow-100 text-yellow-800",
  intermediate: "bg-green-100 text-green-800",
  experienced: "bg-purple-100 text-purple-800",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`${STYLES[level]} whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium`}>
      {LEVELS[level].book}
    </span>
  );
}
