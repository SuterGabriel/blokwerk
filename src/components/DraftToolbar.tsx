import Link from "next/link";

/**
 * Der Draft Mode bleibt aktiv, bis er abgeschaltet wird. Ohne sichtbaren
 * Hinweis sieht die Redaktion spaeter unveroeffentlichte Inhalte und meldet
 * einen Fehler, der keiner ist.
 */
export default function DraftToolbar() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line bg-paper-sunk px-6 py-2 text-sm">
      <span className="font-mono text-xs">Vorschau — auch unveröffentlichte Inhalte</span>
      <Link
        prefetch={false}
        href="/api/exit-draft"
        className="text-accent underline underline-offset-4"
      >
        Vorschau verlassen
      </Link>
    </div>
  );
}
