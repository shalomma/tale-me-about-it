import {
  Stethoscope,
  Feather,
  HeartHandshake,
  House,
  type LucideIcon,
  Users,
} from "lucide-react";
import type { Level, Topic } from "@/lib/catalog/schema";

/** How the public site talks about each topic: short, warm, parent-facing. */
export const TOPIC_UI: Record<
  Topic,
  { label: string; hint: string; icon: LucideIcon; tile: string; iconBg: string }
> = {
  transitions: {
    label: "מעבר דירה או גן חדש",
    hint: "שינוי בבית, בגן או בשגרה",
    icon: House,
    tile: "hover:border-sun",
    iconBg: "bg-sun-soft text-[#9a6a10]",
  },
  illness: {
    label: "מחלה או ניתוח",
    hint: "של הילד או של מישהו קרוב",
    icon: Stethoscope,
    tile: "hover:border-sky",
    iconBg: "bg-sky-soft text-[#2f6e9c]",
  },
  divorce: {
    label: "פרידה של ההורים",
    hint: "שני בתים, שינוי במשפחה",
    icon: HeartHandshake,
    tile: "hover:border-rose",
    iconBg: "bg-rose-soft text-[#a4485b]",
  },
  social: {
    label: "קושי עם חברים",
    hint: "מריבה, דחייה, בדידות בגן",
    icon: Users,
    tile: "hover:border-sage",
    iconBg: "bg-sage-soft text-[#3c7a59]",
  },
  loss: {
    label: "אובדן",
    hint: "פרידה ממישהו אהוב",
    icon: Feather,
    tile: "hover:border-lilac",
    iconBg: "bg-lilac-soft text-[#5b45a3]",
  },
};

/** Reading-experience levels, phrased for parents instead of as reader grades. */
export const LEVEL_UI: Record<
  Level,
  { step: 1 | 2 | 3; short: string; description: string; question: string; questionHint: string }
> = {
  beginner: {
    step: 1,
    short: "סיפור קצר",
    description: "טקסט קצר ופשוט, הרבה איורים",
    question: "כמעט לא",
    questionHint: "עוד לא רגילים לשבת עם ספר",
  },
  intermediate: {
    step: 2,
    short: "אורך בינוני",
    description: "סיפור באורך בינוני עם איורים רבים",
    question: "מדי פעם",
    questionHint: "סיפור קצר עד הסוף זה בסדר",
  },
  experienced: {
    step: 3,
    short: "סיפור ארוך",
    description: "סיפור ארוך ועשיר בשפה ובעלילה",
    question: "כמעט כל ערב",
    questionHint: "אוהבים סיפורים ארוכים",
  },
};
