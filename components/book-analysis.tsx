import { Brain, CircleQuestionMark, Heart, Languages, MessagesSquare, Paintbrush } from "lucide-react";
import type { BookContent } from "@/lib/catalog/schema";

type Analysis = Pick<BookContent, "linguistic" | "thematic" | "psych" | "visuals" | "mediation">;

function Section({
  icon,
  title,
  color,
  rows,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  rows: [string, string][];
}) {
  const filled = rows.filter(([, v]) => v.trim());
  if (!filled.length) return null;
  return (
    <section>
      <h3 className={`mb-2 flex items-center gap-2 text-lg font-bold ${color}`}>
        {icon}
        {title}
      </h3>
      <ul className="list-inside list-disc space-y-1 ps-2">
        {filled.map(([label, value]) => (
          <li key={label}>
            <b>{label}:</b> {value}
          </li>
        ))}
      </ul>
    </section>
  );
}

const QUESTION_COLORS = ["text-accent-pink", "text-accent-blue", "text-secondary", "text-accent-green", "text-primary"];

/** The full psycho-pedagogical analysis of one book, as on the original site. */
export function BookAnalysis({ book }: { book: Analysis }) {
  return (
    <div className="space-y-6 text-ink">
      <Section
        icon={<Languages className="size-5" aria-hidden />}
        title="ניתוח לשוני וסגנוני"
        color="text-primary"
        rows={[
          ["חריזה ומשקל", book.linguistic.rhyme],
          ["אוצר מילים", book.linguistic.vocabulary],
          ["טיפוגרפיה פעילה", book.linguistic.typography],
        ]}
      />
      <Section
        icon={<Brain className="size-5" aria-hidden />}
        title="ניתוח תמטי"
        color="text-accent-blue"
        rows={[
          ["הבעיה", book.thematic.problem],
          ["המניע", book.thematic.motive],
          ["הטוויסט", book.thematic.twist],
        ]}
      />
      <Section
        icon={<Heart className="size-5" aria-hidden />}
        title="מסר פסיכולוגי-חברתי"
        color="text-accent-pink"
        rows={[
          ["קול פנימי", book.psych.innerVoice],
          ["התמודדות עם פחד", book.psych.copingWithFear],
          ["תוצאה לא צפויה", book.psych.unexpectedOutcome],
        ]}
      />
      {book.visuals.trim() && (
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-secondary">
            <Paintbrush className="size-5" aria-hidden />
            איורים
          </h3>
          <p>{book.visuals}</p>
        </section>
      )}
      {book.mediation.length > 0 && (
        <section className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink-dark">
            <MessagesSquare className="size-5 text-primary" aria-hidden />
            הנחיות לתיווך הורי
          </h3>
          <div className="space-y-2">
            {book.mediation.map((m, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white p-3 shadow-sm">
                <CircleQuestionMark
                  className={`mt-1 size-5 shrink-0 ${QUESTION_COLORS[i % QUESTION_COLORS.length]}`}
                  aria-hidden
                />
                <p className="text-ink-dark">
                  <strong>{m.question}</strong>
                  {m.explanation && (
                    <>
                      <br />
                      <span className="font-normal text-ink">{m.explanation}</span>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
