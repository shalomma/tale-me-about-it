import type { Metadata } from "next";
import { Heebo, Varela_Round } from "next/font/google";
import "./globals.css";

const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo" });
const varela = Varela_Round({ weight: "400", subsets: ["hebrew", "latin"], variable: "--font-varela" });

export const metadata: Metadata = {
  title: { default: "ספרו לי על זה - קסם הביבליותרפיה", template: "%s | ספרו לי על זה" },
  description:
    "ספרים מותאמים אישית שעוזרים להורים לתווך לילדים בגילאי 3-5 עולמות רגשיים מורכבים: מעבר דירה, גן חדש, פרידה ועוד.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" data-scroll-behavior="smooth" className={`${heebo.variable} ${varela.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
