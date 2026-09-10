#!/usr/bin/env bash
# Entkopplungs-Check
#
# Blokwerks zentrale Architekturzusage steht in README.md und DECISIONS.md:
# Die Darstellungsschicht kennt das CMS nicht. Die Uebersetzung passiert
# einmalig im Adapter.
#
# Bisher war das eine Behauptung mit einem Grep daneben, den niemand ausfuehrt.
# Dieses Skript macht daraus eine Zusage, die kaputtgehen kann — dasselbe, was
# ArchUnit im Schwesterprojekt Aptum fuer die Domaenenschicht tut.
#
# Geprueft werden drei Aussagen. Die dritte ist die interessante: Sie schuetzt
# nicht die Regel, sondern die dokumentierte Ausnahme von der Regel.

set -uo pipefail
cd "$(dirname "$0")/.."

fehler=0
ok=0

melde_ok()    { printf '  ok    %s\n' "$1"; ok=$((ok + 1)); }
melde_fehler() { printf '  ROT   %s\n' "$1"; fehler=$((fehler + 1)); }

echo
echo "Entkopplungs-Check"
echo "=================="
echo

# --- 1 ------------------------------------------------------------------
# Die Zusage aus README.md, woertlich:
#   grep -rl "@storyblok" src/components/ui/   # gibt nichts aus
echo "1. Die Darstellungsschicht kennt kein CMS"
treffer=$(grep -rl "@storyblok" src/components/ui/ 2>/dev/null || true)
if [ -z "$treffer" ]; then
  melde_ok "src/components/ui/ importiert nichts aus @storyblok"
else
  melde_fehler "src/components/ui/ importiert aus @storyblok:"
  printf '%s\n' "$treffer" | sed 's/^/          /'
fi

# --- 2 ------------------------------------------------------------------
# Die Naht darf das rohe Blok-Objekt kennen, sonst findet der Visual Editor
# das DOM-Element nicht (DECISIONS.md, Punkt 5). Sie soll aber duenn bleiben.
#
# Geprueft wird der ganze Baum, nicht nur src/components/. Ein Gate, das
# seinen Geltungsbereich so zuschneidet, dass es gruen wird, prueft nichts.
#
# Die Ausnahmen stehen deshalb einzeln hier, statt weggefiltert zu werden:
# Content-Types haben keine Blok-Komponente, weil sie keine Bloks sind. Die
# Route setzt das Attribut selbst. Wer eine Zeile hinzufuegt, entscheidet
# damit sichtbar ueber die Architektur.
ERLAUBT_PRAEFIX="src/components/blocks/"
ERLAUBT_DATEIEN="src/app/artikel/[slug]/page.tsx"

echo
echo "2. storyblokEditable bleibt in der Naht"
ausserhalb=""
while read -r datei; do
  [ -n "$datei" ] || continue
  case "$datei" in "$ERLAUBT_PRAEFIX"*) continue ;; esac
  erlaubt=0
  for e in $ERLAUBT_DATEIEN; do [ "$datei" = "$e" ] && erlaubt=1; done
  [ "$erlaubt" -eq 1 ] && continue
  ausserhalb="$ausserhalb$datei"$'
'
done <<< "$(grep -rl "storyblokEditable" src/ 2>/dev/null || true)"

if [ -z "$ausserhalb" ]; then
  melde_ok "storyblokEditable steht nur in der Naht und in benannten Ausnahmen"
else
  melde_fehler "storyblokEditable steht an einer nicht benannten Stelle:"
  printf "%s" "$ausserhalb" | sed "s/^/          /"
fi

# --- 3 ------------------------------------------------------------------
# lib/types.ts behauptet ueber sich selbst: "Bewusst kein Wert-Import aus
# @storyblok/react". Der Typ-Import fuer RichTextDocument ist die eine
# dokumentierte Ausnahme.
#
# Der Unterschied ist nicht kosmetisch: `import type` verschwindet beim
# Kompilieren restlos. Ein Wert-Import dagegen bindet das SDK an die Datei,
# die ausdruecklich CMS-frei sein soll — und niemand saehe es.
echo
echo "3. Die eigenen Typen bleiben wertfrei gegenueber dem SDK"
wertimport=$(grep -n "@storyblok" src/lib/types.ts 2>/dev/null \
  | grep -v "^\s*[0-9]*:\s*\*" \
  | grep -v "import type" || true)
if [ -z "$wertimport" ]; then
  melde_ok "src/lib/types.ts benutzt nur import type (Ausnahme RichTextDocument)"
else
  melde_fehler "src/lib/types.ts hat einen Wert-Import aus @storyblok:"
  printf '%s\n' "$wertimport" | sed 's/^/          /'
fi

echo
echo "------------------"
printf '%d Zusagen halten, %d gebrochen.\n' "$ok" "$fehler"
echo

if [ "$fehler" -gt 0 ]; then
  cat <<'HINWEIS'
Eine Architekturzusage ist gebrochen.

Das ist der Sinn dieses Gates: README.md und DECISIONS.md beschreiben eine
Trennung, und diese Beschreibung soll rot werden, sobald sie nicht mehr stimmt.

Entweder den Import an die richtige Stelle ziehen — oder die Behauptung in
der Dokumentation streichen. Eine dritte Moeglichkeit gibt es nicht.
HINWEIS
  exit 1
fi

echo "Die Trennung haelt."
