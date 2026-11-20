"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookPlus,
  Bot,
  Eye,
  EyeOff,
  FilePen,
  Globe,
  Library,
  MessagesSquare,
  MousePointerClick,
  Plus,
  Save,
  ScrollText,
  Search,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Chip, Guide, type GuideStep, Line, Sketch, Spot } from "./guide";

/* Guides for the admin pages. Each step pairs a few words with a sketch of the
   part of the screen it talks about; the sketches reuse the real labels. */

// --- Shared sketches --------------------------------------------------------------

function ChatSketch() {
  return (
    <Sketch className="space-y-2">
      <div className="flex">
        <span className="rounded-xl rounded-ss-sm bg-violet-600 px-2.5 py-1 text-[10px] text-white">שם הספר + סופר/ת</span>
      </div>
      <p className="flex items-center gap-1 text-[10px] text-zinc-500">
        <Search className="size-3" aria-hidden /> חיפוש ברשת…
      </p>
      <div className="space-y-1.5 rounded-xl rounded-se-sm bg-zinc-100 p-2">
        <Line w="w-11/12" className="bg-zinc-300" />
        <Line w="w-3/4" className="bg-zinc-300" />
      </div>
      <p className="flex items-center gap-1 text-[10px] text-violet-700">
        <FilePen className="size-3" aria-hidden /> עדכון הטיוטה
      </p>
    </Sketch>
  );
}

function DiffSketch({ spotApply }: { spotApply?: boolean }) {
  const apply = (
    <span className="flex w-full justify-center rounded-md bg-violet-600 py-1 text-[10px] font-medium text-white">החלת ההצעה על הטופס</span>
  );
  return (
    <Sketch className="space-y-2">
      <Chip tone="amber">נמצאו בעיות ברשומה</Chip>
      <div className="space-y-1">
        <div className="rounded bg-red-50 px-2 py-1.5">
          <Line w="w-4/5" className="bg-red-200" />
        </div>
        <div className="rounded bg-emerald-50 px-2 py-1.5">
          <Line w="w-11/12" className="bg-emerald-300" />
        </div>
      </div>
      {spotApply ? <Spot block>{apply}</Spot> : apply}
    </Sketch>
  );
}

function PublishSketch() {
  return (
    <div className="flex items-center gap-3">
      <Chip className="px-2 py-1 text-xs">
        <EyeOff className="size-3.5" aria-hidden /> טיוטה
      </Chip>
      <ArrowLeft className="size-4 text-violet-400" aria-hidden />
      <Spot className="rounded-md">
        <Chip tone="green" className="px-2 py-1 text-xs">
          <Eye className="size-3.5" aria-hidden /> מפורסם
        </Chip>
      </Spot>
    </div>
  );
}

function StatusSketch() {
  return (
    <Sketch className="space-y-2">
      <p className="text-[11px] font-semibold text-zinc-800">סטטוס בדיקה</p>
      <Spot block>
        <span className="flex w-full items-center justify-between rounded-md border border-zinc-300 px-2 py-1 text-[10px]">
          אומת
          <ArrowDown className="size-3 text-zinc-400" aria-hidden />
        </span>
      </Spot>
      <div className="space-y-1.5 rounded-md border border-zinc-200 p-2">
        <Line w="w-5/6" />
        <Line w="w-1/2" />
      </div>
    </Sketch>
  );
}

// --- Overview (dashboard) ------------------------------------------------------------

const COVERAGE = [
  [2, 1, 3],
  [1, 0, 2],
  [3, 2, 1],
  [0, 1, 1],
  [2, 2, 0],
];

const OVERVIEW: GuideStep[] = [
  {
    label: "מוסיפים ספר",
    title: "מתחילים משם של ספר",
    body: (
      <>
        פותחים <b>ספר חדש</b> או <b>שיחת מחקר</b> ומקלידים את שם הספר. זה כל מה שצריך כדי להתחיל.
      </>
    ),
    actions: [
      { href: "/admin/books/new", label: "ספר חדש" },
      { href: "/admin/chat", label: "שיחת מחקר" },
    ],
    visual: (
      <Sketch className="max-w-44 space-y-2 p-2 text-[11px] text-zinc-600">
        <span className="flex items-center gap-1.5 px-1.5 py-1">
          <Library className="size-3.5" aria-hidden /> קטלוג הספרים
        </span>
        <Spot block>
          <span className="flex w-full items-center gap-1.5 rounded-md bg-violet-50 px-1.5 py-1 text-violet-800">
            <MessagesSquare className="size-3.5" aria-hidden /> שיחת מחקר
          </span>
        </Spot>
        <Spot block>
          <span className="flex w-full items-center gap-1.5 rounded-md bg-violet-50 px-1.5 py-1 text-violet-800">
            <Plus className="size-3.5" aria-hidden /> ספר חדש
          </span>
        </Spot>
      </Sketch>
    ),
  },
  {
    label: "הסוכן חוקר",
    title: "הסוכן עושה את המחקר",
    body: "מחפש ברשת, מוודא שהספר קיים ומה קורה בו, ומנסח ניתוח ושאלות תיווך להורים.",
    visual: <ChatSketch />,
  },
  {
    label: "בודקים",
    title: "אתם מאשרים",
    body: (
      <>
        עוברים על ההצעה, מתקנים ומסמנים <b>סטטוס בדיקה</b>. הסוכן יכול לטעות, ושום דבר לא נשמר בלי אישור שלכם.
      </>
    ),
    visual: <DiffSketch />,
  },
  {
    label: "מפרסמים",
    title: "מפרסמים לאתר",
    body: (
      <>
        מסמנים <b>מפורסם באתר</b> ושומרים. עד אז הספר הוא טיוטה שרק אתם רואים.
      </>
    ),
    visual: <PublishSketch />,
  },
  {
    label: "עוקבים",
    title: "רואים מה חסר",
    body: (
      <>
        בטבלת הכיסוי כאן למטה, <b>תא אדום</b> הוא נושא ורמה בלי אף ספר. שם כדאי להוסיף את הספר הבא.
      </>
    ),
    actions: [{ href: "/admin/books?status=unverified", label: "ממתינים לבדיקה" }],
    visual: (
      <Sketch className="max-w-44">
        <div className="grid grid-cols-3 gap-1">
          {COVERAGE.flat().map((n, i) =>
            n === 0 && i === 4 ? (
              <Spot key={i} block className="rounded">
                <span className="flex h-5 w-full items-center justify-center rounded bg-red-50 text-[10px] text-red-600">0</span>
              </Spot>
            ) : (
              <span
                key={i}
                className={`flex h-5 items-center justify-center rounded text-[10px] ${n ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
              >
                {n}
              </span>
            ),
          )}
        </div>
      </Sketch>
    ),
  },
];

export function OverviewGuide() {
  return <Guide id="overview" title="איך עובדים כאן" steps={OVERVIEW} />;
}

// --- Books catalog ---------------------------------------------------------------------

const BOOKS: GuideStep[] = [
  {
    label: "מוצאים",
    title: "חיפוש וסינון",
    body: "מחפשים לפי שם או סופר/ת, ומצמצמים לפי נושא, רמת קריאה, סטטוס בדיקה ופרסום.",
    visual: (
      <Sketch className="space-y-2">
        <Spot block>
          <span className="flex w-full items-center gap-1.5 rounded-md border border-zinc-300 px-2 py-1 text-[10px] text-zinc-400">
            <Search className="size-3" aria-hidden /> חיפוש לפי שם או סופר/ת…
          </span>
        </Spot>
        <div className="grid grid-cols-2 gap-1.5">
          {["כל הנושאים", "כל הרמות", "כל הסטטוסים", "מפורסם וטיוטה"].map((l) => (
            <span key={l} className="flex items-center justify-between rounded-md border border-zinc-200 px-1.5 py-1 text-[9px] text-zinc-600">
              {l}
              <ArrowDown className="size-2.5 text-zinc-400" aria-hidden />
            </span>
          ))}
        </div>
      </Sketch>
    ),
  },
  {
    label: "סטטוס",
    title: "מה נבדק ומה לא",
    body: (
      <>
        הצבע מראה מה <b>אתם</b> קבעתם: אפור טרם נבדק, ירוק אומת. תג שמתחיל ב<b>הסוכן:</b> מראה מה הסוכן מצא בבדיקה האחרונה שלו.
      </>
    ),
    visual: (
      <Sketch className="max-w-48 space-y-2.5">
        <div className="grid grid-cols-2 justify-items-start gap-1.5">
          <Chip>טרם נבדק</Chip>
          <Chip tone="green">אומת</Chip>
          <Chip tone="amber">דורש תיקון</Chip>
          <Chip tone="red">לא נמצא</Chip>
        </div>
        <div className="border-t border-zinc-100 pt-2.5">
          <Spot>
            <Chip tone="amber">הסוכן: דורש תיקון</Chip>
          </Spot>
        </div>
      </Sketch>
    ),
  },
  {
    label: "מפרסמים",
    title: "פרסום בלחיצה אחת",
    body: (
      <>
        לחיצה על <b>טיוטה</b> או <b>מפורסם</b> בעמודת ״באתר״ מעלה או מורידה את הספר מהאתר. מיד, בלי שמירה.
      </>
    ),
    visual: <PublishSketch />,
  },
  {
    label: "עורכים",
    title: "פותחים ספר",
    body: "לחיצה על שם הספר פותחת את העורך: הניתוח, סוכן המחקר וסטטוס הבדיקה.",
    visual: (
      <Sketch className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            {i === 0 ? (
              <Spot>
                <span className="px-1 text-[11px] font-medium text-violet-700">שם הספר</span>
                <MousePointerClick className="absolute -bottom-3.5 start-8 size-4 fill-white text-violet-700" aria-hidden />
              </Spot>
            ) : (
              <Line w="w-20" />
            )}
            <Chip tone={i === 1 ? "green" : "zinc"}>{i === 1 ? "מפורסם" : "טיוטה"}</Chip>
          </div>
        ))}
      </Sketch>
    ),
  },
];

export function BooksGuide() {
  return <Guide id="books" title="קטלוג הספרים" steps={BOOKS} />;
}

// --- New book ------------------------------------------------------------------------------

function SaveBarSketch({ dirty, published }: { dirty?: boolean; published?: boolean }) {
  return (
    <Sketch className="flex max-w-64 items-center justify-between gap-2 py-2">
      <span className="flex items-center gap-1.5 text-[10px] text-zinc-700">
        <span className={`grid size-3 place-items-center rounded-sm border ${published ? "border-violet-600 bg-violet-600" : "border-zinc-400"}`} />
        מפורסם באתר
        {dirty && <span className="text-amber-700">· לא נשמר</span>}
      </span>
      <Spot>
        <span className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-medium text-white">
          <Save className="size-3" aria-hidden /> שמירה
        </span>
      </Spot>
    </Sketch>
  );
}

const NEW_BOOK: GuideStep[] = [
  {
    label: "כותרת",
    title: "שם הספר",
    body: "מקלידים כותרת, ואם ידוע גם סופר/ת. זה מספיק כדי שהסוכן יתחיל לחקור.",
    visual: (
      <Sketch className="grid grid-cols-2 gap-2">
        <span className="space-y-1">
          <span className="block text-[10px] font-medium text-zinc-700">כותרת</span>
          <Spot block>
            <span className="w-full rounded-md border border-zinc-300 px-1.5 py-1 text-[10px] text-zinc-900">שם הספר|</span>
          </Spot>
        </span>
        <span className="space-y-1">
          <span className="block text-[10px] font-medium text-zinc-700">סופר/ת</span>
          <span className="block rounded-md border border-zinc-300 px-1.5 py-1 text-[10px] text-zinc-400">לא חובה</span>
        </span>
      </Sketch>
    ),
  },
  {
    label: "מחקר",
    title: "הסוכן כותב את הניתוח",
    body: (
      <>
        בלוח <b>סוכן מחקר</b> שבצד לוחצים <b>מחקר וכתיבת ניתוח</b>. זה לוקח דקה-שתיים. אפשר לצרף הערה, למשל איזו מהדורה.
      </>
    ),
    actions: [{ href: "/admin/chat", label: "מעדיפים בשיחה? שיחת מחקר" }],
    visual: (
      <Sketch className="space-y-2">
        <p className="flex items-center gap-1 text-[11px] font-semibold text-zinc-800">
          <Bot className="size-3.5 text-violet-600" aria-hidden /> סוכן מחקר
        </p>
        <Spot>
          <span className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-medium text-white">
            <Sparkles className="size-3" aria-hidden /> מחקר וכתיבת ניתוח
          </span>
        </Spot>
        <div className="space-y-1 rounded-md bg-zinc-50 p-1.5 text-[9px] text-zinc-600">
          <p className="flex items-center gap-1">
            <Search className="size-2.5" aria-hidden /> חיפוש: שם הספר
          </p>
          <p className="flex items-center gap-1">
            <Globe className="size-2.5" aria-hidden /> 8 תוצאות
          </p>
        </div>
      </Sketch>
    ),
  },
  {
    label: "מחילים",
    title: "בודקים ומחילים",
    body: (
      <>
        פותחים את <b>הצגת השינויים</b>, ואם זה נראה טוב לוחצים <b>החלת ההצעה על הטופס</b>. אחר כך אפשר לערוך חופשי.
      </>
    ),
    visual: <DiffSketch spotApply />,
  },
  {
    label: "שומרים",
    title: "שמירה כטיוטה",
    body: (
      <>
        <b>שמירה</b> יוצרת ספר לא מפורסם. מסמנים <b>מפורסם באתר</b> רק אחרי שהניתוח נבדק.
      </>
    ),
    visual: <SaveBarSketch />,
  },
];

export function NewBookGuide() {
  return <Guide id="new-book" title="הוספת ספר" steps={NEW_BOOK} />;
}

// --- Book editor ---------------------------------------------------------------------------

const EDITOR: GuideStep[] = [
  {
    label: "שמירה",
    title: "פס השמירה",
    body: (
      <>
        נשאר למעלה כשגוללים. <b>לא נשמר</b> בכתום אומר שיש שינויים פתוחים. שמירה חלה על האתר מיד.
      </>
    ),
    visual: <SaveBarSketch dirty published />,
  },
  {
    label: "הניתוח",
    title: "חמישה חלקים",
    body: "פרטים, ניתוח לשוני, תמטי, פסיכולוגי ושאלות תיווך להורים. את השאלות מסדרים בחצים.",
    visual: (
      <div className="w-full max-w-60 space-y-1.5">
        {["פרטי הספר", "ניתוח לשוני וסגנוני", "ניתוח תמטי", "מסר פסיכולוגי-חברתי"].map((s) => (
          <Sketch key={s} className="px-2.5 py-1 text-[10px] font-medium text-zinc-700 shadow-none">
            {s}
          </Sketch>
        ))}
        <Spot block className="rounded-lg">
          <Sketch className="flex items-center justify-between px-2.5 py-1 text-[10px] font-medium text-zinc-700 shadow-none">
            הנחיות לתיווך הורי
            <span className="flex gap-0.5 text-zinc-500">
              <ArrowUp className="size-3" aria-hidden />
              <ArrowDown className="size-3" aria-hidden />
            </span>
          </Sketch>
        </Spot>
      </div>
    ),
  },
  {
    label: "בדיקת עובדות",
    title: "הסוכן בודק אתכם",
    body: (
      <>
        <b>בדיקת עובדות</b> משווה את הרשומה למקורות ברשת ומסמנת מה שגוי. שום דבר לא משתנה עד שתחילו ותשמרו.
      </>
    ),
    visual: (
      <Sketch className="space-y-2.5">
        <Spot>
          <span className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-medium text-white">
            <ShieldCheck className="size-3" aria-hidden /> בדיקת עובדות
          </span>
        </Spot>
        <div className="flex flex-wrap gap-1">
          <Chip tone="amber">נמצאו בעיות ברשומה</Chip>
          <Chip>ביטחון גבוה</Chip>
        </div>
        <ul className="space-y-1.5">
          {["w-5/6", "w-2/3"].map((w) => (
            <li key={w} className="flex items-center gap-1.5">
              <span className="size-1 shrink-0 rounded-full bg-zinc-400" />
              <Line w={w} />
            </li>
          ))}
        </ul>
      </Sketch>
    ),
  },
  {
    label: "סטטוס",
    title: "מסמנים מה בדקתם",
    body: "אחרי הבדיקה מעדכנים סטטוס וכותבים בהערה מול איזה מקור בדקתם. ככה יודעים מה עוד פתוח.",
    visual: <StatusSketch />,
  },
  {
    label: "שיחה",
    title: "לשינויים גדולים: שיחה",
    body: (
      <>
        <b>שיחת מחקר על הספר</b> פותחת שיחה עם הסוכן שבה הרשומה הנוכחית כבר טעונה. מבקשים, מתקנים, ומעדכנים את הקטלוג.
      </>
    ),
    visual: (
      <Spot className="rounded-xl">
        <span className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 p-2.5 text-[10px] text-violet-900">
          <MessagesSquare className="size-4 text-violet-600" aria-hidden />
          <span>
            <span className="block font-medium">שיחת מחקר על הספר</span>
            <span className="text-violet-800/80">לעבוד על הרשומה יחד עם הסוכן</span>
          </span>
        </span>
      </Spot>
    ),
  },
];

export function BookEditorGuide() {
  return <Guide id="book-editor" title="עריכת ספר" steps={EDITOR} />;
}

// --- Research chat -------------------------------------------------------------------------

function TabsSketch({ active }: { active: "טיוטה" | "הנחיות לסוכן" }) {
  const tabs = [
    { label: "טיוטה", icon: FilePen },
    { label: "הנחיות לסוכן", icon: ScrollText },
    { label: "שיחות", icon: MessagesSquare },
  ] as const;
  return (
    <span className="flex gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5">
      {tabs.map(({ label, icon: Icon }) => {
        const tab = (
          <span
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[9px] whitespace-nowrap ${
              label === active ? "bg-violet-50 font-medium text-violet-800" : "text-zinc-500"
            }`}
          >
            <Icon className="size-2.5" aria-hidden />
            {label}
          </span>
        );
        return label === active ? (
          <Spot key={label} block className="flex-1">
            {tab}
          </Spot>
        ) : (
          <span key={label} className="flex flex-1">
            {tab}
          </span>
        );
      })}
    </span>
  );
}

const CHAT: GuideStep[] = [
  {
    label: "כותבים",
    title: "שם של ספר, או כל שאלה",
    body: (
      <>
        <b>Enter</b> שולח, Shift+Enter יורד שורה. הכפתורים שמעל התיבה הם בקשות מוכנות בלחיצה.
      </>
    ),
    visual: (
      <Sketch className="space-y-2">
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] text-violet-800">מה עוד לא הצלחת לאמת?</span>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] text-violet-800">תוסיף לקטלוג</span>
        </div>
        <div className="flex items-end gap-1.5">
          <span className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-[10px] text-zinc-900">שם הספר, סופר/ת|</span>
          <Spot>
            <span className="grid size-6 place-items-center rounded-md bg-violet-600 text-white">
              <SendHorizontal className="size-3 rtl:-scale-x-100" aria-hidden />
            </span>
          </Spot>
        </div>
      </Sketch>
    ),
  },
  {
    label: "מחקר",
    title: "רואים איך הסוכן עובד",
    body: "כל חיפוש שלו מופיע בשיחה, והמקורות שמצא מופיעים מתחת לתשובה. כל תור יכול לקחת דקה-שתיים.",
    visual: (
      <Sketch className="space-y-2">
        <p className="flex items-center gap-1 text-[10px] text-zinc-500">
          <Search className="size-3" aria-hidden /> חיפוש: שם הספר עלילה
        </p>
        <div className="space-y-1.5 rounded-xl rounded-se-sm bg-zinc-100 p-2">
          <Line w="w-11/12" className="bg-zinc-300" />
          <Line w="w-2/3" className="bg-zinc-300" />
          <Spot className="mt-1">
            <span className="flex gap-1">
              {["הספרייה הלאומית", "אתר ההוצאה"].map((s) => (
                <span key={s} className="rounded bg-white px-1.5 py-0.5 text-[9px] text-violet-700 ring-1 ring-zinc-200">
                  {s}
                </span>
              ))}
            </span>
          </Spot>
        </div>
      </Sketch>
    ),
  },
  {
    label: "טיוטה",
    title: "הרשומה נבנית בצד",
    body: (
      <>
        בלשונית <b>טיוטה</b>: פס סגול מסמן מה השתנה בתור האחרון, ותיבה כתומה מראה מה הסוכן עוד לא אימת.
      </>
    ),
    visual: (
      <div className="w-full max-w-60 space-y-1.5">
        <TabsSketch active="טיוטה" />
        <Sketch className="space-y-2 p-2.5">
          <div className="rounded bg-amber-50 p-1.5 text-[9px] text-amber-900">פתוח / לא אומת</div>
          <div className="-ms-2.5 border-s-2 border-violet-500 ps-2">
            <p className="text-[9px] font-medium text-zinc-500">
              הבעיה <span className="text-violet-700">· עודכן עכשיו</span>
            </p>
            <Line w="w-5/6" className="mt-1" />
          </div>
          <div>
            <p className="text-[9px] font-medium text-zinc-500">המניע</p>
            <Line w="w-2/3" className="mt-1" />
          </div>
        </Sketch>
      </div>
    ),
  },
  {
    label: "לקטלוג",
    title: "שומרים לקטלוג",
    body: (
      <>
        <b>הוספה לקטלוג</b> שומרת את הספר כטיוטה לא מפורסמת. אפשר גם פשוט לבקש מהסוכן. מפרסמים מהעורך.
      </>
    ),
    visual: (
      <Sketch className="space-y-2">
        <Chip tone="amber">עוד לא בקטלוג</Chip>
        <Spot>
          <span className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-medium text-white">
            <BookPlus className="size-3" aria-hidden /> הוספה לקטלוג
          </span>
        </Spot>
        <p className="flex items-center gap-1 text-[10px] text-emerald-700">
          <ArrowLeft className="size-3" aria-hidden />
          <Chip tone="green">שמור בקטלוג</Chip>
        </p>
      </Sketch>
    ),
  },
  {
    label: "הנחיות",
    title: "בקשות קבועות לסוכן",
    body: (
      <>
        בלשונית <b>הנחיות לסוכן</b> כותבים מה תמיד חשוב לכם. הן נשלחות בכל הודעה ובכל בדיקת עובדות.
      </>
    ),
    visual: (
      <div className="w-full max-w-60 space-y-1.5">
        <TabsSketch active="הנחיות לסוכן" />
        <Sketch className="space-y-1.5 p-2.5 text-[9px] text-zinc-600">
          <p>- תמיד חמש שאלות תיווך, לא יותר</p>
          <p>- להעדיף את אתר ההוצאה כמקור</p>
          <Line w="w-1/2" />
        </Sketch>
      </div>
    ),
  },
];

export function ChatGuide() {
  return <Guide id="chat" title="שיחת מחקר" steps={CHAT} />;
}
