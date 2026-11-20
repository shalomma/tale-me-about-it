import type { Metadata, Viewport } from "next";
import { Fredoka, Rubik } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const rubik = Rubik({ subsets: ["hebrew", "latin"], variable: "--font-rubik" });
const fredoka = Fredoka({ subsets: ["hebrew", "latin"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: "ספרו לי על זה",
  appleWebApp: { title: "ספרו לי על זה" },
  openGraph: { type: "website", locale: "he_IL", siteName: "ספרו לי על זה" },
  title: { default: "ספרו לי על זה · ספרים שעוזרים לדבר על מה שקשה", template: "%s | ספרו לי על זה" },
  description:
    "ספרי תמונות שנבחרו בקפידה לילדים בני 3-5 שעוברים שינוי, עם שאלות פשוטות להורים לשאול תוך כדי קריאה.",
};

export const viewport: Viewport = {
  themeColor: "#fbf7f0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${rubik.variable} ${fredoka.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
