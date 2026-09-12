import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kolophon",
  description:
    "Blokwerk ist eine Arbeitsprobe: ein fiktives Studio, dessen Inhalte aus Storyblok kommen und mit Next.js gerendert werden. Diese Seite erklärt, was daran zu sehen ist.",
};

/**
 * Die Seite, die erklaert, was diese Website ist.
 *
 * Ohne sie sieht ein Besucher ein Digitalstudio, das es nicht gibt, und muss
 * raten, was er beurteilen soll. Bewusst eine Route im Code und keine Story:
 * Sie beschreibt das Projekt, nicht das fiktive Studio — eine Redaktion haette
 * hier nichts zu pflegen.
 */

const REPO = "https://github.com/SuterGabriel/blokwerk";

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="font-serif text-2xl tracking-tight">{titel}</h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

function Zeile({ was, wo }: { was: string; wo: React.ReactNode }) {
  return (
    <tr className="border-b border-line align-top">
      <td className="py-3 pr-6 text-ink">{was}</td>
      <td className="py-3 text-ink-muted">{wo}</td>
    </tr>
  );
}

export default function KolophonPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-16 pb-8">
      <p className="text-sm text-ink-muted">Kolophon</p>
      <h1 className="mt-5 font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl">
        Was Sie hier sehen
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-muted">
        Blokwerk ist ein Digitalstudio, das es nicht gibt. Die Website ist echt:
        Sie bezieht ihre Inhalte aus einem Storyblok-Space und wird mit Next.js
        im App Router gerendert. Entstanden ist sie als Arbeitsprobe von{" "}
        <span className="text-ink">Gabriel Suter</span>.
      </p>

      <Abschnitt titel="Wie die Seite gebaut ist">
        <p>
          Zwei Inhaltstypen — Seite und Artikel — und vier Bausteine, die eine
          Redaktion frei stapelt: Hero, Text mit Bild, Teaser-Raster, Zitat. Aus
          dem Modell entsteht jede Seite, die Sie hier sehen, ohne dass dafür
          Code geschrieben wird.
        </p>
        <p>
          Ausgeliefert wird statisch. Beim Bauen holt die Anwendung jede Story
          über die Content Delivery API und legt fertige Seiten ab. Wird im CMS
          etwas veröffentlicht, meldet ein Webhook das an eine Route, die genau
          die betroffene Seite neu baut — nicht die ganze Site, und nicht erst
          nach Ablauf eines Intervalls.
        </p>
        <table className="mt-6 w-full text-sm">
          <tbody>
            <Zeile was="Framework" wo="Next.js 16, App Router, React Server Components" />
            <Zeile was="CMS" wo="Storyblok, Region EU, zwei Content-Types und vier Bloks" />
            <Zeile was="Auslieferung" wo="statisch vorgebaut, ISR mit einer Stunde als Netz" />
            <Zeile was="Aktualisierung" wo="Webhook auf eine Route, die gezielt neu validiert" />
            <Zeile
              was="Gewicht"
              wo="rund 297 KB pro Seite, gemessen und in der CI als Grenze gehalten"
            />
          </tbody>
        </table>
      </Abschnitt>

      <Abschnitt titel="Drei Dinge, die man selten sieht">
        <p>
          <span className="text-ink">Ein unbekannter Baustein kippt die Seite nicht.</span>{" "}
          Liefert das CMS einen Blok, für den es im Frontend keine Komponente
          gibt — etwa nach einem Import —, erscheint ein ruhiger Platzhalter mit
          dem technischen Namen. Der Inhalt bleibt erhalten, die Seite bleibt
          lesbar.
        </p>
        <p>
          <span className="text-ink">Ein leeres Teaser-Raster erklärt sich.</span>{" "}
          Wird ein referenzierter Artikel depubliziert, entsteht keine Lücke im
          Layout, sondern ein Hinweis, was zu tun ist.
        </p>
        <p>
          <span className="text-ink">Entwürfe sind technisch getrennt.</span> Die
          öffentliche Seite liest mit einem Token, der Entwürfe gar nicht erst
          herausgibt. Die Vorschau läuft über eine eigene Route mit einem
          zweiten Token. Ein Leck ist damit nicht durch Vergessen möglich.
        </p>
      </Abschnitt>

      <Abschnitt titel="Was im Repository steht">
        <p>
          Der Quelltext liegt offen, zusammen mit den Entscheidungen, die dahinter
          stehen — auch den unbequemen. Eine davon betrifft diese Seite selbst:
          Der Abschnitt „Technik“ auf der Startseite verspricht ein Seitenbudget
          von 180 Kilobyte. Gemessen sind rund 297. Warum diese Zahl mit React
          und Next.js nicht erreichbar ist und warum die Behauptung trotzdem
          stehen bleibt, steht in den Entscheidungen, Punkt 12.
        </p>
        <p>
          Vier Prüfungen laufen bei jedem Commit und in der CI. Sie testen nicht
          den Code, sondern die Aussagen über ihn: dass die Darstellungsschicht
          das CMS nicht kennt, dass jeder Beleg in der Anforderungsmappe noch auf
          die behauptete Codezeile zeigt, dass kein Verweis ins Leere führt, und
          dass keine Seite schwerer wird als erlaubt.
        </p>
        <p>
          <a
            href={REPO}
            className="text-accent underline underline-offset-4"
            rel="noopener noreferrer"
            target="_blank"
          >
            github.com/SuterGabriel/blokwerk
          </a>
        </p>
      </Abschnitt>

      <Abschnitt titel="Was die Seite nicht ist">
        <p>
          Kein Kundenprojekt. Die Texte, das Studio, die Zahlen darin sind
          erfunden — die Personen ebenso. Was echt ist, ist der Weg vom
          Inhaltsmodell über die API bis zur ausgelieferten Seite.
        </p>
      </Abschnitt>

      <p className="mt-12 border-t border-line pt-8 text-sm text-ink-muted">
        <Link href="/" className="text-accent underline underline-offset-4">
          Zurück zur Startseite
        </Link>
      </p>
    </main>
  );
}
