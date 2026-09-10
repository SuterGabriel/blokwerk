# Prüfungen

Blokwerk behauptet an mehreren Stellen etwas über sich selbst: die README
beschreibt eine Trennung zwischen Darstellung und CMS, `DECISIONS.md`
begründet zwölf Entscheidungen, `docs/ANFORDERUNGEN.md` ordnet jeder
Anforderung einer Ausschreibung eine Stelle im Code zu.

Vier Skripte machen aus diesen Behauptungen Zusagen, die kaputtgehen können.
Drei davon laufen ohne Abhängigkeiten und zusammen unter einer Sekunde. Das
vierte braucht einen Build und läuft deshalb nur in der CI.

## Die Gates

| Gate | Prüft | Aufruf |
|---|---|---|
| Entkopplung | Die Darstellungsschicht kennt kein CMS | `bash scripts/entkopplung-check.sh` |
| Belege | Jeder Beleg in der Anforderungsmappe zeigt noch auf das Behauptete | `bash scripts/beleg-check.sh` |
| Verweise | Kein Markdown-Verweis im Repo zeigt ins Leere | `node scripts/link-check.mjs` |
| Seitenbudget | Keine Seite überschreitet 305 KB Übertragungsgewicht | `node scripts/budget-check.mjs` |

### Entkopplung

Das Äquivalent zu einem Architekturtest. Drei Aussagen:

1. `src/components/ui/` importiert nichts aus `@storyblok` — die Zusage, die
   die README wörtlich als Grep-Befehl nennt.
2. `storyblokEditable` steht nur in der Naht `src/components/blocks/` und in
   benannten Ausnahmen.
3. `src/lib/types.ts` benutzt nur `import type`, keinen Wert-Import.

Punkt 2 wird über den **ganzen** Quellbaum geprüft, nicht nur über
`src/components/`. Ein Gate, das seinen Geltungsbereich so zuschneidet, dass es
grün wird, prüft nichts. Die eine bestehende Ausnahme —
`src/app/artikel/[slug]/page.tsx`, weil `article` ein Content-Type ist und
keine Blok-Komponente hat — steht deshalb namentlich im Skript. Wer eine Zeile
hinzufügt, entscheidet sichtbar über die Architektur.

Punkt 3 ist nicht kosmetisch: `import type` verschwindet beim Kompilieren
restlos, ein Wert-Import bindet das SDK an genau die Datei, die CMS-frei sein
soll.

### Belege

Prüft `docs/ANFORDERUNGEN.md` gegen den Quelltext. Der interessante Teil sind
die Belege mit Zeilennummer.

Ein Beleg wie `server.ts:28` bricht nicht, wenn jemand die Datei löscht — das
fiele auf. Er bricht, wenn jemand oben drei Zeilen einfügt. Dann zeigt der
Verweis auf etwas anderes, die Tabelle sieht weiter gepflegt aus, und niemand
merkt es: Niemand liest eine Belegspalte gegen den Quelltext.

Das Skript trägt deshalb eine Ankerliste — Datei, Zeile, und ein Stück Text,
das dort stehen muss. Sie ist von Hand gepflegt. Formaler ginge es nicht:
Welche Zeile eine Anforderung belegt, ist eine fachliche Aussage, keine
ableitbare.

### Verweise

Übernommen aus dem Schwesterprojekt Aptum, unverändert bis auf die
Ignorierliste. Prüft ausschliesslich Markdown-Verweise der Form `[Text](Ziel)`.
Pfade in Backticks werden bewusst nicht geprüft — ein Verweis in Klammern ist
eine Zusage für jetzt, ein Pfad in Backticks kann eine Ansage für später sein.

### Seitenbudget

Das einzige Gate, das nicht Aussagen prüft, sondern die Seite selbst. Es liest
die vorgerenderten HTML-Dateien aus `.next/server/app/`, sammelt jede darin
referenzierte Datei unter `/_next/` und rechnet zusammen, was ein Browser beim
ersten Aufruf lädt: HTML, JavaScript und CSS gzip-komprimiert, Schriften roh,
weil woff2 bereits komprimiert ist.

Es setzt einen Build voraus, und den gibt es ohne Storyblok-Token nur gegen die
Fixtures:

```bash
npm run build:fixtures
node scripts/budget-check.mjs
```

Die Grenze von 305 KB ist die gemessene Wirklichkeit mit etwas Luft, kein
erreichtes Ziel. Die Startseite verspricht im Fliesstext 180 Kilobyte; warum
diese Zahl mit React und Next.js nicht erreichbar ist und warum sie trotzdem
stehen bleibt, steht in `DECISIONS.md`, Punkt 12.

Nicht gemessen wird Geschwindigkeit. Gewicht ist nicht Latenz.

## Vor dem Commit

```bash
bash scripts/hooks-installieren.sh
```

Richtet `.githooks/pre-commit` ein. Der Hook ist mit `--no-verify` umgehbar,
und das ist Absicht: Ein Hook, der routinemässig umgangen wird, erzwingt
nichts. Dieselben Gates laufen in der CI noch einmal, dort sind sie keine
Option.

## In der CI

`.github/workflows/ci.yml`, drei Jobs.

**Was geprüft wird:** die drei schnellen Gates, `tsc --noEmit`, ESLint, ein
vollständiger `next build` gegen die Fixtures und danach das Seitenbudget.

**Was nicht geprüft wird:** der Build gegen den echten Space. Er ruft beim
Sammeln der Seitendaten die Storyblok-API auf und braucht einen Token; ohne
hinterlegtes Secret bricht er ab — nicht wegen eines Fehlers im Code, sondern
weil `src/lib/storyblok/server.ts` genau das meldet.

Der Fixture-Build ersetzt ihn nicht. Er beweist, dass die Seite baut und wie
schwer sie ist, nicht dass der Abruf funktioniert. Sobald
`STORYBLOK_PUBLIC_TOKEN` als Repository-Secret hinterlegt ist, kommt der
zweite Build dazu; das auskommentierte Gerüst steht in der Datei.

## Die Lockfile

`package-lock.json` wird in einem Linux-Container erzeugt, nicht auf dem
Entwicklungsrechner:

```bash
docker run --rm -v "C:lokwerk:/app" -w /app node:24-bookworm   npm install --package-lock-only
```

Der Grund ist ein Fall, der lokal nicht auffallen kann. npm schreibt beim
Auflösen unter Windows zwei transitive Pakete nicht in die Lockfile, die es
unter Linux verlangt — `@emnapi/runtime` und `@emnapi/core`, beides
Abhängigkeiten der WebAssembly-Varianten von sharp und Tailwind. Auf dem
eigenen Rechner läuft danach alles; in der CI bricht `npm ci` mit der Meldung
ab, Lockfile und `package.json` seien nicht synchron. Genau so ist der erste
CI-Lauf dieses Projekts gescheitert.

Die im Container erzeugte Lockfile enthält beide Plattformen — die win32-
Einträge bleiben drin, `npm ci` läuft auf Windows und auf Linux. Wer
Abhängigkeiten ändert, erzeugt sie wieder so.

## Warum das hier steht

Diese Prüfungen stammen aus dem Schwesterprojekt Aptum, wo ArchUnit die
Domänenschicht und ein Beleg-Check die Anforderungsmappe absichert. Der
Gedanke dort wie hier: Eine Architektur, die nur in der Dokumentation steht,
ist eine Absichtserklärung. Eine, die bei jedem Lauf geprüft wird, ist eine
Eigenschaft des Projekts.

Der Zuschnitt ist bewusst kleiner als in Aptum. Blokwerk ist eine Arbeitsprobe,
kein Monorepo mit drei Services. Ein Prüfapparat, der grösser wäre als die
geprüfte Sache, würde nicht Sorgfalt zeigen, sondern fehlendes Augenmass.
