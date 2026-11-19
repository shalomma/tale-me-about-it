import {
  BookOpenText,
  Check,
  Drama,
  Equal,
  Heart,
  Layers,
  Lightbulb,
  Puzzle,
  Quote,
  Sprout,
  Star,
  Sun,
  Wrench,
} from "lucide-react";
import { Library } from "@/components/site/library";
import { SmartMatch } from "@/components/site/smart-match";
import { getPublishedBooks } from "@/lib/catalog/queries";

export default async function HomePage() {
  const books = await getPublishedBooks();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <Star className="absolute top-40 right-10 size-14 animate-float fill-primary-light text-primary-light opacity-30" aria-hidden />
        <Sun className="absolute top-24 left-20 size-12 animate-float text-secondary opacity-40 [animation-delay:1s]" aria-hidden />
        <Heart className="absolute right-32 bottom-20 size-10 animate-float fill-accent-pink text-accent-pink opacity-40 [animation-delay:2s]" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex size-24 animate-bounce items-center justify-center rounded-full bg-surface text-5xl shadow-soft" aria-hidden>
            🦋
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-bold text-ink-dark sm:text-5xl lg:text-7xl">
            ברוכים הבאים לעולם שבו
            <br />
            <span className="magic-border text-primary">לכל רגש יש סיפור</span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed font-medium sm:text-2xl">
            ולכל סיפור יש מקום בלב. אפליקציה זו נועדה לעזור לכם, ההורים, לתווך לילדיכם עולמות רגשיים מורכבים דרך הקסם של המילה הכתובה והדמיון.
          </p>
          <a
            href="#smart-match"
            className="mx-auto inline-flex items-center gap-3 rounded-full bg-secondary px-8 py-4 font-heading text-xl font-bold text-ink-dark shadow-floating transition hover:-translate-y-1 hover:bg-yellow-500"
          >
            <BookOpenText className="size-6" aria-hidden />
            מתחילים לקרוא
          </a>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="relative z-10 scroll-mt-24 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card relative overflow-hidden rounded-3xl p-8 shadow-soft lg:p-12">
            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-ink-dark lg:text-4xl">
              <Sprout className="size-9 text-accent-green" aria-hidden /> למה לספר סיפור?
            </h2>
            <p className="mb-8 text-lg leading-relaxed">
              בגילאי 3-5, הילדים שלכם עוברים מהפכה רגשית. הם מרגישים הכל בעוצמה, אבל לא תמיד יודעים לקרוא לזה בשם. הביבליותרפיה (ריפוי דרך ספרים) פותחת בפניהם דלת בטוחה:
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Drama, bg: "bg-purple-100 text-primary", title: "השלכה", text: '"זה לא אני שמפחד, זה הגיבור בסיפור". קל יותר לדבר על קושי כשהוא קורה למישהו אחר.' },
                { icon: Equal, bg: "bg-pink-100 text-accent-pink", title: "נרמול", text: '"גם הדובי הרגיש ככה, אז זה בסדר". הבנה שהרגשות שלי טבעיים ושכולם חווים אותם.' },
                { icon: Wrench, bg: "bg-yellow-100 text-secondary", title: "ארגז כלים", text: "למידת פתרונות יצירתיים למצבים יומיומיים דרך התמודדות מוצלחת של הדמויות בסיפור." },
              ].map(({ icon: Icon, bg, title, text }) => (
                <div key={title} className="rounded-2xl border border-purple-100 bg-surface p-6 shadow-sm transition hover:scale-105">
                  <div className={`mb-4 flex size-12 items-center justify-center rounded-full ${bg}`}>
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-ink-dark">{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Smart match */}
      <section id="smart-match" className="scroll-mt-24 border-y-4 border-white bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full bg-primary p-4 text-4xl shadow-soft" aria-hidden>
              🦉
            </div>
            <h2 className="mb-4 text-4xl font-bold text-ink-dark">הסיפור הנכון בזמן הנכון</h2>
            <p className="mx-auto max-w-3xl text-xl">
              המערכת שלנו בוחרת באופן חכם את הספר המדויק ביותר עבור הילד שלכם, בהתבסס על ההתמודדות הנוכחית ועל הניסיון שלו בקריאה.
            </p>
          </div>

          <div className="flex flex-col items-start gap-10 lg:flex-row">
            <div className="space-y-8 lg:w-1/2">
              <div className="rounded-2xl border-s-4 border-accent-pink bg-surface p-6 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 text-2xl font-bold text-ink-dark">
                  <Puzzle className="size-6 text-accent-pink" aria-hidden /> התאמה לנושא או למשבר
                </h3>
                <p className="text-lg leading-relaxed">
                  בין אם מדובר בשינוי שגרתי או במשבר חיים מורכב, נאתר סיפור שנוגע בדיוק בנקודה הנכונה: מעבר דירה, התמודדות עם מחלה או ניתוח (של הילד או קרוב משפחה), מוות ופציעות, גירושין, דחייה חברתית ועוד.
                </p>
              </div>
              <div className="rounded-2xl border-s-4 border-secondary bg-surface p-6 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 text-2xl font-bold text-ink-dark">
                  <Layers className="size-6 text-secondary" aria-hidden /> התאמה לניסיון הקריאה
                </h3>
                <p className="text-lg leading-relaxed">
                  סיפור טוב צריך להתאים ליכולת ההקשבה של הילד. אנחנו מתאימים את אורך הטקסט ומורכבות השפה לניסיון הקודם שלו:
                </p>
                <ul className="mt-4 space-y-2 font-medium">
                  {[
                    "מנוסה מאוד - מסוגל להקשיב לסיפורים ארוכים ומורכבים.",
                    "מקריאים לו לעיתים רחוקות - סיפורים באורך בינוני עם איורים מרובים.",
                    "חסר ניסיון - טקסטים קצרים, פשוטים וממוקדים, עם דגש על ויזואליה.",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="size-5 shrink-0 text-green-500" aria-hidden /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <SmartMatch books={books} />
            </div>
          </div>
        </div>
      </section>

      {/* Opening ritual */}
      <section id="ritual" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="relative mb-6 inline-block">
            <div className="relative z-10 flex size-24 items-center justify-center rounded-full bg-surface text-6xl shadow-soft" aria-hidden>
              🐻
            </div>
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-200 opacity-75 [animation-duration:3s]" aria-hidden />
          </div>
          <h2 className="mb-6 text-3xl font-bold text-ink-dark lg:text-4xl">טקס הפתיחה: מתכוננים לקסם</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl">
            מומלץ ליצור &quot;טקס&quot; קבוע בכל פעם שפותחים את האפליקציה, כדי לאותת לילד שמתחיל זמן מיוחד של קשב ורוגע.
          </p>
          <blockquote className="glass-card relative rounded-3xl p-8 text-start text-lg leading-loose italic shadow-soft lg:p-10 lg:text-xl">
            <Quote className="absolute top-6 right-6 size-10 text-primary-light opacity-50" aria-hidden />
            &quot;שלום חבר קטן! ברוך הבא לממלכת הסיפורים.
            <br />
            לפני שנפתח את הספר הקסום שלנו, בוא נעשה משהו קטן יחד:
            <br />
            תניח יד אחת על הלב... אתה מרגיש אותו דופק?
            <br />
            עכשיו, קח נשימה עמוקה כמו שואב אבק... 💨
            <br />
            ותוציא אותה לאט כמו רוח נושבת... 🍃
            <br />
            יופי! עכשיו הלב שלנו מוכן להקשיב.&quot;
          </blockquote>
        </div>
      </section>

      {/* Heart keys */}
      <section id="heart-keys" className="scroll-mt-24 bg-white/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-ink-dark lg:text-4xl">בחירת &quot;מפתח הלב&quot;</h2>
            <p className="mx-auto max-w-2xl text-xl">
              במקום תפריט מורכב, תנו לילד לבחור את האייקון שמשקף את הרגש הנוכחי שלו, כדי להתאים עבורו את האווירה הנכונה.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { emoji: "☀️", title: "שמש מחייכת", text: "אני מרגיש שמח ורוצה לחגוג!", border: "border-secondary" },
              { emoji: "🌧️", title: "ענן עם גשם", text: "משהו קצת עצוב לי היום.", border: "border-accent-blue" },
              { emoji: "⚡", title: "ברק אדום", text: "אני מרגיש כועס מאוד!", border: "border-red-400" },
              { emoji: "🌙", title: "ירח מנצנץ", text: "אני רוצה להירגע לפני השינה.", border: "border-indigo-400" },
            ].map((k) => (
              <div key={k.title} className={`rounded-3xl border-b-4 bg-surface p-8 text-center shadow-soft transition hover:-translate-y-2 ${k.border}`}>
                <div className="mb-4 text-6xl" aria-hidden>
                  {k.emoji}
                </div>
                <h3 className="mb-2 text-xl font-bold text-ink-dark">{k.title}</h3>
                <p className="font-medium">&quot;{k.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parent tips + closing */}
      <section className="relative py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="lg:w-1/2">
            <div className="h-full rounded-3xl border border-purple-100 bg-purple-50 p-8">
              <div className="mb-6 flex items-center gap-3">
                <Lightbulb className="size-8 text-primary" aria-hidden />
                <h2 className="text-2xl font-bold text-ink-dark">איך לדבר על זה? (הנחיות להורה)</h2>
              </div>
              <p className="mb-6">במהלך הקריאה, יופיעו בועות קטנות להורה שיעזרו לכם לתווך את הסיפור:</p>
              <div className="space-y-6">
                {[
                  { emoji: "🛑", title: "עצרו רגע", text: "מה אתם חושבים שהארנב מרגיש עכשיו?" },
                  { emoji: "🔗", title: "חברו למציאות", text: "גם לך קרה פעם שהרגשת שאתה רוצה לצעוק חזק כמוהו?" },
                  { emoji: "✨", title: "סוף פתוח", text: "מה לדעתך יקרה מחר בבוקר בסיפור?" },
                ].map((t) => (
                  <div key={t.title} className="flex gap-4 rounded-xl bg-surface p-4 shadow-sm">
                    <div className="mt-1 text-2xl" aria-hidden>
                      {t.emoji}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-ink-dark">{t.title}</h4>
                      <p>&quot;{t.text}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center lg:w-1/2">
            <div className="glass-card w-full rounded-3xl border-4 border-white p-10 text-center shadow-floating">
              <div className="mb-6 text-6xl" aria-hidden>
                🌟
              </div>
              <h2 className="mb-6 text-3xl font-bold text-ink-dark">מסר סיום ופרידה</h2>
              <p className="font-heading text-2xl leading-relaxed">
                &quot;תודה שביקרתם בממלכה שלנו.
                <br />
                הסיפור נגמר, אבל הוא נשאר איתכם בלב לכל היום.
                <br />
                חיבוק גדול, ונתראה בסיפור הבא!&quot;
              </p>
              <a
                href="#library"
                className="mt-10 inline-block rounded-full bg-primary px-8 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 hover:bg-purple-700"
              >
                התחילו את המסע בספרייה
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Library */}
      <section id="library" className="relative z-10 scroll-mt-24 border-t-4 border-dashed border-primary-light py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-white text-4xl shadow-soft" aria-hidden>
              📚
            </div>
            <h2 className="mb-4 text-4xl font-bold text-ink-dark">הספרייה החכמה</h2>
            <p className="mx-auto max-w-3xl text-xl">
              כל ספר מנותח באופן פסיכו-פדגוגי: שפה, נושא, מסר רגשי, איורים, ושאלות שיעזרו לכם לדבר עם הילד על מה שהוא מרגיש.
            </p>
          </div>
          <Library books={books} />
        </div>
      </section>
    </>
  );
}
