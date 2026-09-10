import type { SbBlokData } from "@storyblok/react/rsc";

/**
 * Faellt ein: wenn ein Blok im CMS existiert, aber in der Komponenten-Map fehlt.
 * Registriert ueber customFallbackComponent in lib/storyblok/server.ts.
 *
 * Die Seite bleibt lesbar, der technische Name ist sichtbar, und der Inhalt
 * geht nicht verloren — er wird nur nicht dargestellt. Kein Rot, weil das
 * kein Fehler der Redaktion ist.
 */
export default function UnknownBlock({ blok }: { blok: SbBlokData }) {
  return (
    <div className="mx-auto my-8 max-w-3xl border border-dashed border-line px-6 py-8">
      <p className="font-mono text-sm">
        Baustein „{String(blok?.component ?? "unbekannt")}“ wird hier nicht dargestellt.
      </p>
      <p className="mt-2 font-mono text-xs text-ink-muted">
        Kein Renderer registriert. Inhalt bleibt im CMS erhalten.
      </p>
    </div>
  );
}
