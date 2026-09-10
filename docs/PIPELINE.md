# Prüfungen

Blokwerk behauptet an mehreren Stellen etwas über sich selbst: die README
beschreibt eine Trennung zwischen Darstellung und CMS, `DECISIONS.md`
begründet acht Entscheidungen, `docs/ANFORDERUNGEN.md` ordnet jeder
Anforderung einer Ausschreibung eine Stelle im Code zu.

Drei Skripte machen aus diesen Behauptungen Zusagen, die kaputtgehen können.
Alle drei laufen ohne Abhängigkeiten und zusammen unter einer Sekunde.

## Die drei Gates

| Gate | Prüft | Aufruf |
|---|---|---|
| Entkopplung | Die Darstellungsschicht kennt kein CMS | `bash scripts/entkopplung-check.sh` |
| Belege | Jeder Beleg in der Anforderungsmappe zeigt noch auf das Behauptete | `bash scripts/beleg-check.sh` |
| Verweise | Kein Markdown-Verweis im Repo zeigt ins Leere | `node scripts/link-check.mjs` |

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

## Vor dem Commit

```bash
bash scripts/hooks-installieren.sh
```

Richtet `.githooks/pre-commit` ein. Der Hook ist mit `--no-verify` umgehbar,
und das ist Absicht: Ein Hook, der routinemässig umgangen wird, erzwingt
nichts. Dieselben Gates laufen in der CI noch einmal, dort sind sie keine
Option.

## In der CI

`.github/workflows/ci.yml`, zwei Jobs.

**Was geprüft wird:** die drei Gates, `tsc --noEmit`, `next lint`.

**Was nicht geprüft wird:** `next build`. Der Build ruft beim Sammeln der
Seitendaten die Storyblok-API auf und braucht dafür einen Token. Ohne
hinterlegte Secrets bricht er ab — nicht wegen eines Fehlers im Code, sondern
weil `src/lib/storyblok/server.ts:18` genau das meldet.

Ein Job, der das verschweigt und trotzdem grün meldet, wäre schlimmer als kein
Job. Sobald `STORYBLOK_PUBLIC_TOKEN` als Repository-Secret hinterlegt ist,
kommt der Build-Job dazu; das auskommentierte Gerüst steht in der Datei.

## Warum das hier steht

Diese Prüfungen stammen aus dem Schwesterprojekt Aptum, wo ArchUnit die
Domänenschicht und ein Beleg-Check die Anforderungsmappe absichert. Der
Gedanke dort wie hier: Eine Architektur, die nur in der Dokumentation steht,
ist eine Absichtserklärung. Eine, die bei jedem Lauf geprüft wird, ist eine
Eigenschaft des Projekts.

Der Zuschnitt ist bewusst kleiner als in Aptum. Blokwerk ist eine Arbeitsprobe,
kein Monorepo mit drei Services. Ein Prüfapparat, der grösser wäre als die
geprüfte Sache, würde nicht Sorgfalt zeigen, sondern fehlendes Augenmass.
