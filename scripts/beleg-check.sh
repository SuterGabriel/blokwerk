#!/usr/bin/env bash
# Beleg-Check
#
# docs/ANFORDERUNGEN.md ordnet jeder Anforderung der Ausschreibung eine Stelle
# im Code zu. Diese Zuordnung ist der Kern der Bewerbungsmappe — und sie ist
# die Stelle, an der ein Repo am unauffaelligsten unehrlich wird.
#
# Zwei Arten, wie das passiert, beide ohne boesen Willen:
#
#   1. Ein Beleg nennt eine Datei, die spaeter umbenannt oder geloescht wird.
#   2. Ein Beleg nennt eine Zeilennummer. Jemand fuegt oben drei Zeilen ein,
#      und der Verweis zeigt auf etwas anderes. Die Tabelle sieht weiter
#      gepflegt aus. Niemand liest eine Belegspalte gegen den Quelltext.
#
# Der zweite Fall ist der gefaehrlichere, weil er lautlos ist. Deshalb prueft
# dieses Skript nicht nur, ob Datei und Zeile existieren, sondern ob die Zeile
# noch das enthaelt, was der Beleg behauptet.
#
# Was hier absichtlich NICHT geprueft wird: ob der Beleg gut ist. Ein fehlender
# Beleg faellt hier auf, ein schwacher im Gespraech. Beides ist besser als eine
# Behauptung, die niemand prueft.

set -uo pipefail
cd "$(dirname "$0")/.."

DOK="docs/ANFORDERUNGEN.md"
fehler=0
ok=0

melde_ok()     { printf '  ok    %s\n' "$1"; ok=$((ok + 1)); }
melde_fehler() { printf '  FEHLT %s\n' "$1"; fehler=$((fehler + 1)); }

pruefe() {
  local beschreibung="$1"; shift
  if "$@" >/dev/null 2>&1; then melde_ok "$beschreibung"; else melde_fehler "$beschreibung"; fi
}

datei()    { [ -f "$1" ]; }
enthaelt() { grep -q "$2" "$1" 2>/dev/null; }

echo
echo "Beleg-Check"
echo "==========="
echo

# --- Die Mappe selbst ---------------------------------------------------
echo "Die Ausschreibung ist vollstaendig erfasst"
pruefe "$DOK existiert" datei "$DOK"
pruefe "Projekt-ID ist genannt" enthaelt "$DOK" "3044939"
pruefe "Auftraggeber ist genannt" enthaelt "$DOK" "wynwood tech"
pruefe "alle vier Anforderungen sind erfasst" \
  bash -c 'test "$(grep -c "^### [1-4]\." "'"$DOK"'")" -eq 4'
# Eine Mappe, die nur Erfuelltes auflistet, ist keine Mappe, sondern Werbung.
pruefe "die Luecken sind benannt" enthaelt "$DOK" "^## Nicht abgedeckt"
pruefe "React Native ist als Luecke benannt" enthaelt "$DOK" "React Native"
pruefe "die offenen Schritte stehen drin" enthaelt "$DOK" "Offene Punkte"

# --- Belege ohne Zeilennummer -------------------------------------------
# Alles, was in Backticks steht und wie ein Repo-Pfad aussieht, muss es geben.
echo
echo "Belegte Pfade existieren"
pfade=$(grep -oE '`[^`]+`' "$DOK" \
  | tr -d '`' \
  | grep -E '^(src|docs|scripts)/|\.md$' \
  | sed 's/:[0-9].*$//' \
  | sed 's/[.,]$//' \
  | sort -u)
while read -r pfad; do
  [ -n "$pfad" ] || continue
  if [ -e "$pfad" ]; then melde_ok "Pfad $pfad"; else melde_fehler "Pfad $pfad"; fi
done <<< "$pfade"

# --- Belege mit Zeilennummer --------------------------------------------
# Der eigentliche Punkt dieses Skripts.
#
# Die Tabelle unten ist die Ankerliste: Datei, Zeile, und ein Stueck Text, das
# dort stehen muss. Sie ist von Hand gepflegt, und das ist Absicht — wer eine
# Zeilennummer in der Mappe aendert, aendert hier mit und entscheidet dabei
# bewusst, worauf der Beleg zeigt.
#
# Formaler ginge es nicht: Welche Zeile eine Anforderung belegt, ist eine
# fachliche Aussage, keine ableitbare.
echo
echo "Belegte Zeilen zeigen noch auf das Behauptete"
while IFS='|' read -r datei zeile erwartet; do
  [ -n "${datei:-}" ] || continue
  case "$datei" in '#'*) continue ;; esac
  kurz="$(basename "$datei"):$zeile"
  if [ ! -f "$datei" ]; then
    melde_fehler "$kurz — Datei fehlt"
    continue
  fi
  gesamt=$(wc -l < "$datei")
  if [ "$zeile" -gt "$gesamt" ]; then
    melde_fehler "$kurz — Datei hat nur $gesamt Zeilen"
    continue
  fi
  inhalt=$(sed -n "${zeile}p" "$datei")
  if printf '%s' "$inhalt" | grep -qF "$erwartet"; then
    melde_ok "$kurz — $erwartet"
  else
    melde_fehler "$kurz — erwartet \"$erwartet\", gefunden: $(printf '%s' "$inhalt" | sed 's/^[[:space:]]*//' | cut -c1-50)"
  fi
done <<'ANKER'
src/app/artikel/[slug]/page.tsx|11|revalidate = 3600
src/app/artikel/[slug]/page.tsx|14|generateStaticParams
src/app/artikel/[slug]/page.tsx|19|generateMetadata
src/app/artikel/[slug]/page.tsx|77|priority
src/app/artikel/[slug]/page.tsx|78|sizes=
src/components/ui/ArticleGrid.tsx|20|sm:grid-cols-2
src/app/journal/page.tsx|7|revalidate = 3600
src/app/api/revalidate/route.ts|35|revalidatePath
src/app/preview/layout.tsx|13|draftMode
src/lib/storyblok/components.ts|13|export const components
src/lib/storyblok/components.ts|25|RESOLVE_RELATIONS
src/lib/storyblok/server.ts|32|getStoryblokApi
src/lib/storyblok/server.ts|20|enableFallbackComponent
src/lib/storyblok/fetch.ts|10|version: preview
src/lib/storyblok/fetch.ts|11|resolve_relations
src/lib/storyblok/adapters.ts|86|toArticleTeaser
src/lib/storyblok/fixtures/index.ts|17|BLOKWERK_FIXTURES
src/lib/storyblok/fetch.ts|29|registriereKomponenten
src/components/ui/Header.tsx|49|sm:hidden
src/app/sitemap.ts|18|STATISCHE_ROUTEN
src/components/ui/SbImage.tsx|24|a.storyblok.com
src/components/ui/SbImage.tsx|25|filters:format(webp)
ANKER

# --- Was die Dokumentation ueber das Projekt behauptet -------------------
echo
echo "Die uebrige Dokumentation haelt"
pruefe "DECISIONS.md existiert" datei DECISIONS.md
pruefe "SCHEMA.md existiert" datei SCHEMA.md
# Punkt 5 ist die ehrlichste Stelle des Projekts: dort stehen die Grenzen der
# Entkopplung. Sie ist auch die, die beim Kuerzen zuerst verschwinden wuerde.
pruefe "DECISIONS.md benennt die Grenzen der Entkopplung" \
  enthaelt DECISIONS.md "Zwei Stellen, an denen die Entkopplung nicht haelt\|Entkopplung nicht"
pruefe "das Entkopplungs-Gate liegt im Repo" datei scripts/entkopplung-check.sh
pruefe "der Verweis-Check liegt im Repo" datei scripts/link-check.mjs
pruefe "docs/PIPELINE.md erklaert die Gates" datei docs/PIPELINE.md
# PIPELINE.md beschreibt Hook und CI. Beides sind Dateien, also pruefbar.
pruefe "der Git-Hook liegt im Repo" datei .githooks/pre-commit
pruefe "die Einrichtung ist mitgeliefert" datei scripts/hooks-installieren.sh
pruefe "die CI liegt im Repo" datei .github/workflows/ci.yml
pruefe "die CI faehrt die vier Gates"   bash -c 'test "$(grep -c "check" .github/workflows/ci.yml)" -ge 4'
# Der Fixture-Betrieb ist die Voraussetzung dafuer, dass die CI ueberhaupt
# bauen und messen kann. Faellt er weg, faellt die Messung mit ihm.
pruefe "der Fixture-Betrieb ist da" datei src/lib/storyblok/fixtures/index.ts
pruefe "die Fixtures sagen es auf der Seite" datei src/components/ui/FixtureHinweis.tsx
pruefe "die CI baut gegen Fixtures" enthaelt .github/workflows/ci.yml "build:fixtures"
pruefe "das Budget-Gate existiert" datei scripts/budget-check.mjs
# Solange kein Deployment steht, darf die README keine Live-URL versprechen.
pruefe "README verspricht keine tote Live-URL" \
  bash -c '! grep -q "^\*\*Live:\*\* https://" README.md'

echo
echo "-----------"
printf '%d Belege halten, %d fehlen.\n' "$ok" "$fehler"
echo

if [ "$fehler" -gt 0 ]; then
  cat <<'HINWEIS'
Ein Beleg stimmt nicht mehr.

Das ist der Sinn dieses Jobs: docs/ANFORDERUNGEN.md sagt einem Auftraggeber
zu, wo eine Anforderung eingeloest ist. Diese Zusage soll kaputtgehen, wenn
sie nicht mehr stimmt — und nicht erst im Gespraech auffallen.

Entweder den Beleg nachfuehren — oder die Behauptung streichen.
HINWEIS
  exit 1
fi

echo "Alle Belege halten."
