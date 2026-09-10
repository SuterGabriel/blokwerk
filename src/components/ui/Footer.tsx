import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-sunk">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <p className="font-serif text-lg">Blokwerk</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            Wir nehmen ab Oktober 2026 wieder neue Projekte an. Eine kurze
            Beschreibung genügt für ein erstes Gespräch.
          </p>
        </div>
        <div>
          <p className="text-sm">Studio</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/arbeiten" className="hover:text-ink">Arbeiten</Link></li>
            <li><Link href="/studio" className="hover:text-ink">Team</Link></li>
            <li><Link href="/journal" className="hover:text-ink">Journal</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm">Kontakt</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>hallo@blokwerk.ch</li>
            <li>Josefstrasse 148</li>
            <li>8005 Zürich</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-ink-muted">
          © {new Date().getFullYear()} Blokwerk GmbH
        </p>
      </div>
    </footer>
  );
}
