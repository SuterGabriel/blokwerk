import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import FixtureHinweis from "@/components/ui/FixtureHinweis";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Blokwerk", template: "%s — Blokwerk" },
  description: "Digitalstudio in Zürich. Websites, die man in fünf Jahren noch pflegen kann.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* Sprungmarke fuer Tastatur und Screenreader: sichtbar erst beim
            Fokussieren. Ohne sie tabbt man auf jeder Unterseite erneut durch
            die vier Navigationspunkte, bevor der Inhalt kommt. */}
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-line focus:bg-paper focus:px-4 focus:py-2 focus:text-sm"
        >
          Zum Inhalt springen
        </a>
        <FixtureHinweis />
        <Header />
        <div id="inhalt" className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
