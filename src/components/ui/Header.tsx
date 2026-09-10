import Link from "next/link";

const navigation = [
  { href: "/arbeiten", label: "Arbeiten" },
  { href: "/studio", label: "Studio" },
  { href: "/journal", label: "Journal" },
  { href: "/kontakt", label: "Kontakt" },
];

function Eintraege({ className }: { className: string }) {
  return (
    <ul className={className}>
      {navigation.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="text-ink-muted transition-colors hover:text-ink">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Die Navigation, zweimal ausgegeben: als Reihe ab 640 Pixeln, darunter als
 * Klappmenue.
 *
 * Das Klappmenue ist ein <details>-Element und kein Zustand in React. Vier
 * Links rechtfertigen keine Client-Komponente — die kostete JavaScript auf
 * jeder Seite, und das Seitenbudget aus scripts/budget-check.mjs zaehlt genau
 * das mit. Auf- und Zuklappen kann der Browser selbst, inklusive Tastatur.
 *
 * Doppelt ausgegeben statt per CSS umsortiert, weil ein Klappmenue, das auf
 * dem Desktop nur versteckt danebensteht, in der Tabreihenfolge und fuer
 * Screenreader trotzdem existiert.
 */
export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-lg tracking-tight">
          Blokwerk
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden sm:block">
          <Eintraege className="flex gap-6 text-sm" />
        </nav>

        <details className="relative sm:hidden">
          <summary
            aria-label="Menü"
            className="flex cursor-pointer list-none flex-col justify-center gap-[5px] p-2 [&::-webkit-details-marker]:hidden"
          >
            <span className="block h-px w-5 bg-ink" />
            <span className="block h-px w-5 bg-ink" />
            <span className="block h-px w-5 bg-ink" />
          </summary>
          <nav
            aria-label="Hauptnavigation"
            className="absolute right-0 top-full z-10 mt-3 w-44 border border-line bg-paper p-5"
          >
            <Eintraege className="space-y-3 text-sm" />
          </nav>
        </details>
      </div>
    </header>
  );
}
