import {
  BookOpen,
  Check,
  CirclePause,
  Drama,
  Hand,
  Heart,
  Leaf,
  Link2,
  Sparkles,
  Wind,
  Wrench,
} from "lucide-react";
import { Cloud, Moon, Squiggle, Star } from "@/components/site/doodles";
import { Finder } from "@/components/site/finder";
import { Library } from "@/components/site/library";
import { MoodPicker } from "@/components/site/mood-picker";
import { getPublishedBooks } from "@/lib/catalog/queries";

export default async function HomePage() {
  const books = await getPublishedBooks();

  return (
    <>
      {/* Hero + finder */}
      <section id="find" className="relative scroll-mt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-sun-soft/70 blur-3xl" />
          <div className="absolute top-40 -right-32 size-[22rem] rounded-full bg-lilac-soft/60 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pt-6 pb-16 sm:gap-10 sm:pt-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pt-16 lg:pb-24">
          <div className="relative">
            <Star className="absolute -top-2 left-6 size-7 animate-twinkle text-sun max-lg:hidden" />
            <Moon className="absolute -bottom-10 left-24 size-9 animate-drift text-lilac/70 max-lg:hidden" />
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-night-soft shadow-soft">
              <span className="size-2 rounded-full bg-sage" aria-hidden />
              לגילאי 3-5 · {books.length} ספרים במדף
            </p>
            <h1 className="text-[2.6rem] leading-[1.08] font-semibold sm:text-6xl lg:text-[4.2rem]">
              כשקשה לדבר,
              <br />
              <span className="scribble">אפשר לקרוא</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed sm:mt-6 sm:text-xl">
              ספרי תמונות שנבחרו בקפידה לילדים שעוברים שינוי, ולכל ספר שאלות פשוטות לשאול תוך כדי קריאה. ענו על שתי שאלות,
              ונמצא לכם את הספר המתאים.
            </p>
            <ul className="mt-7 space-y-2.5 max-sm:hidden">
              {["כל ספר מנותח: שפה, עלילה, מסר רגשי ואיורים", "שאלות שיחה מוכנות לכל ספר", "בלי הרשמה ובלי פרסומות"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sage-soft text-[#3c7a59]">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Finder books={books} />
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-white px-6 py-10 shadow-soft sm:px-10">
          <h2 id="how-title" className="sr-only">
            איך זה עובד
          </h2>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              { title: "בוחרים מה קורה", text: "מעבר, מחלה, פרידה או קושי עם חברים. נושא אחד, בלחיצה.", color: "bg-sun-soft text-[#7a5208]" },
              { title: "מקבלים ספר מתאים", text: "לפי הנושא ולפי כמה הילד רגיל להקשיב לסיפורים.", color: "bg-sky-soft text-[#2f6e9c]" },
              { title: "קוראים ומדברים", text: "עם שאלות מוכנות שעוזרות לילד לספר מה הוא מרגיש.", color: "bg-rose-soft text-[#a4485b]" },
            ].map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-semibold ${s.color}`}>
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Library */}
      <section id="library" aria-labelledby="library-title" className="scroll-mt-16 px-4 pt-24 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <Squiggle className="mb-3 w-20 text-coral" />
            <h2 id="library-title" className="text-4xl font-semibold sm:text-5xl">
              המדף שלנו
            </h2>
            <p className="mt-3 text-lg leading-relaxed">
              {books.length} ספרים שבחרנו אחד אחד. לחצו על ספר כדי לראות על מה הוא באמת, ואילו שאלות כדאי לשאול בזמן הקריאה.
            </p>
          </div>
          <Library books={books} />
        </div>
      </section>

      {/* Why stories */}
      <section id="why" aria-labelledby="why-title" className="scroll-mt-16 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 id="why-title" className="text-4xl font-semibold sm:text-5xl">
              למה דווקא <span className="scribble">סיפור</span>?
            </h2>
            <p className="mt-5 text-lg leading-relaxed">
              בגילאי 3-5 ילדים מרגישים הכל בעוצמה, אבל לא תמיד יודעים לקרוא לזה בשם. ספר נותן להם דלת בטוחה: אפשר לדבר על הגיבור,
              ובדרך לדבר גם על עצמם.
            </p>
            <p className="mt-3 leading-relaxed text-night-mute">לשיטה הזו קוראים ביבליותרפיה: עזרה רגשית דרך ספרים.</p>
          </div>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: Drama, title: "השלכה", text: "\"זה לא אני שמפחד, זה הגיבור.\" קל יותר לדבר על קושי כשהוא קורה למישהו אחר.", color: "bg-lilac-soft text-[#5b45a3]" },
              { icon: Heart, title: "נרמול", text: "\"גם הדובי הרגיש ככה.\" הילד מגלה שהרגשות שלו טבעיים, ושגם אחרים מרגישים אותם.", color: "bg-rose-soft text-[#a4485b]" },
              { icon: Wrench, title: "ארגז כלים", text: "הגיבור מוצא פתרון, והילד לוקח איתו רעיון חדש להתמודדות בעולם האמיתי.", color: "bg-sage-soft text-[#3c7a59]" },
            ].map(({ icon: Icon, title, text, color }) => (
              <li key={title} className="rounded-3xl bg-white p-6 shadow-soft">
                <span className={`mb-4 flex size-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-1.5 leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reading together: the bedtime section */}
      <section id="together" aria-labelledby="together-title" className="scroll-mt-16 px-3 pb-20 sm:px-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-night px-5 py-16 text-white/80 sm:px-10 lg:py-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Moon className="absolute top-10 left-10 size-14 text-sun/90" />
            <Star className="absolute top-24 left-40 size-4 animate-twinkle text-white/70" />
            <Star className="absolute top-14 right-[18%] size-3 animate-twinkle text-white/50 [animation-delay:1.2s]" />
            <Star className="absolute right-10 bottom-24 size-5 animate-twinkle text-sun/70 [animation-delay:0.6s]" />
            <Star className="absolute bottom-10 left-[30%] size-3 animate-twinkle text-white/40 [animation-delay:2s]" />
            <Cloud className="absolute -right-6 top-[38%] w-40 text-white/5" />
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="together-title" className="text-4xl font-semibold text-white sm:text-5xl">
                קוראים יחד
              </h2>
              <p className="mt-4 text-lg leading-relaxed">
                הספר הוא רק ההתחלה. הנה שלושה הרגלים קטנים שהופכים קריאה לשיחה, ומתאימים לכל ספר בבית.
              </p>
            </div>

            {/* 1. Opening ritual */}
            <div className="mt-16">
              <h3 className="flex items-center gap-3 text-2xl font-semibold text-white">
                <span className="flex size-9 items-center justify-center rounded-full bg-sun font-display text-lg text-night">1</span>
                טקס פתיחה קטן
              </h3>
              <p className="mt-2 max-w-2xl">דקה של רוגע לפני שפותחים את הספר מסמנת לילד שמתחיל זמן מיוחד של קשב.</p>
              <ol className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { icon: Hand, title: "יד על הלב", text: "\"אתה מרגיש אותו דופק?\"" },
                  { icon: Wind, title: "שואפים עמוק", text: "\"כמו שואב אבק...\"" },
                  { icon: Leaf, title: "נושפים לאט", text: "\"כמו רוח נושבת...\"" },
                  { icon: BookOpen, title: "פותחים את הספר", text: "\"עכשיו הלב מוכן להקשיב.\"" },
                ].map(({ icon: Icon, title, text }) => (
                  <li key={title} className="rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                    <Icon className="size-7 text-sun" aria-hidden />
                    <p className="mt-3 font-display text-lg font-semibold text-white">{title}</p>
                    <p className="mt-1 font-hand text-white/70">{text}</p>
                  </li>
                ))}
              </ol>
              <details className="group mt-4 max-w-2xl rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                <summary className="cursor-pointer list-none px-5 py-3.5 font-medium text-white marker:hidden">
                  <span className="me-2 inline-block text-sun transition group-open:rotate-90" aria-hidden>
                    ‹
                  </span>
                  הטקסט המלא להקראה
                </summary>
                <p className="px-5 pb-5 font-hand text-lg leading-loose text-white/85">
                  &quot;שלום חבר קטן! ברוך הבא לממלכת הסיפורים.
                  <br />
                  לפני שנפתח את הספר הקסום שלנו, בוא נעשה משהו קטן יחד:
                  <br />
                  תניח יד אחת על הלב... אתה מרגיש אותו דופק?
                  <br />
                  עכשיו, קח נשימה עמוקה כמו שואב אבק...
                  <br />
                  ותוציא אותה לאט כמו רוח נושבת...
                  <br />
                  יופי! עכשיו הלב שלנו מוכן להקשיב.&quot;
                </p>
              </details>
            </div>

            {/* 2. Heart keys */}
            <div className="mt-20">
              <h3 className="flex items-center gap-3 text-2xl font-semibold text-white">
                <span className="flex size-9 items-center justify-center rounded-full bg-sun font-display text-lg text-night">2</span>
                איך מרגישים היום?
              </h3>
              <p className="mt-2 mb-10 max-w-2xl">תנו לילד לבחור. זה המקום היחיד באתר שהוא בשבילו.</p>
              <MoodPicker />
            </div>

            {/* 3. During reading */}
            <div className="mt-16">
              <h3 className="flex items-center gap-3 text-2xl font-semibold text-white">
                <span className="flex size-9 items-center justify-center rounded-full bg-sun font-display text-lg text-night">3</span>
                תוך כדי קריאה
              </h3>
              <p className="mt-2 max-w-2xl">אין צורך לשאול הכל. שאלה אחת טובה בעמוד הנכון שווה יותר מעשר.</p>
              <ul className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { icon: CirclePause, title: "עצרו רגע", text: "\"מה אתה חושב שהארנב מרגיש עכשיו?\"" },
                  { icon: Link2, title: "חברו למציאות", text: "\"גם לך קרה פעם שרצית לצעוק חזק כמוהו?\"" },
                  { icon: Sparkles, title: "השאירו סוף פתוח", text: "\"מה לדעתך יקרה בסיפור מחר בבוקר?\"" },
                ].map(({ icon: Icon, title, text }) => (
                  <li key={title} className="rounded-3xl bg-white p-6 text-night-soft">
                    <Icon className="size-7 text-coral" aria-hidden />
                    <p className="mt-3 font-display text-lg font-semibold text-night">{title}</p>
                    <p className="mt-1 font-hand text-lg leading-relaxed">{text}</p>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mx-auto mt-20 max-w-xl text-center font-hand text-2xl leading-relaxed text-white">
              &quot;הסיפור נגמר, אבל הוא נשאר איתנו בלב.
              <br />
              חיבוק גדול, ונתראה בסיפור הבא!&quot;
            </p>
            <div className="mt-8 text-center">
              <a
                href="#find"
                className="inline-flex items-center gap-2 rounded-full bg-sun px-7 py-3.5 font-display text-lg font-semibold text-night transition hover:-translate-y-0.5 hover:bg-[#f8c55e]"
              >
                מצאו את הספר הבא
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
