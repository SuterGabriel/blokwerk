/**
 * Sichtbarer Hinweis, dass die Inhalte dieser Seite erfunden sind.
 *
 * Der Fixture-Betrieb ist die eine Stelle, an der dieses Repo etwas zeigen
 * kann, was es nicht hat. Ein Screenshot davon sieht aus wie eine gepflegte
 * Website. Also steht es auf der Seite selbst, nicht nur in der README.
 */
export default function FixtureHinweis() {
  if (process.env.BLOKWERK_FIXTURES !== "1") return null;

  return (
    <p className="border-b border-line bg-paper-sunk px-6 py-2 text-center text-xs text-ink-muted">
      Beispielinhalte aus <code className="font-mono">src/lib/storyblok/fixtures/</code> — kein
      CMS angebunden.
    </p>
  );
}
