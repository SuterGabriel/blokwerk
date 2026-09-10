#!/usr/bin/env node
// Budget-Check
//
// Anforderung 4 der Ausschreibung verlangt performante Webanwendungen. "Performant"
// ohne Zahl ist eine Behauptung. Dieses Skript misst eine Zahl und haelt sie fest.
//
// Zur Hoehe der Zahl: Die Startseite verspricht im Fliesstext ein "festes
// Seitenbudget von 180 Kilobyte". Diesen Wert erreicht die Seite nicht und kann
// sie mit diesem Stack auch nicht erreichen — allein das Framework liefert rund
// 190 KB gzip aus, dazu 97 KB fuer zwei Schriften. Der Text ist Fiktion aus dem
// Mockup und bleibt stehen; das Budget hier ist die gemessene Wirklichkeit mit
// etwas Luft. Es ist eine Ratsche gegen unbemerktes Wachstum, kein erreichtes
// Ziel. Die Luecke zwischen beiden Zahlen steht in DECISIONS.md, Punkt 12 —
// sie ist genau das, was ein Budget sichtbar machen soll.
//
// Gemessen wird, was ein Browser beim ersten Aufruf einer Seite laedt:
//
//   - das vorgerenderte HTML, gzip-komprimiert
//   - jede darin referenzierte Datei unter /_next/ — JS und CSS gzip-
//     komprimiert, Schriften roh, weil woff2 bereits komprimiert ist
//
// Was NICHT mitzaehlt, und das ist die Grenze dieser Zahl:
//
//   - Bilder. Die Fixtures haben keine. Auf der echten Seite kommt das Bild
//     oben dazu, und dann ist das Budget deutlich enger als hier.
//   - Alles, was erst nach einer Interaktion nachgeladen wird.
//
// Voraussetzung ist ein Build. In der CI: npm run build:fixtures.
//
// Aufruf:
//   node scripts/budget-check.mjs
//   node scripts/budget-check.mjs --zeige   nur messen, nicht bewerten

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const build = join(wurzel, ".next");
const seitenVerzeichnis = join(build, "server", "app");

/**
 * Kilobyte, pro Seite, fuer HTML plus JS plus CSS plus Schriften.
 *
 * Gemessen am 10.09.2026: schwerste Seite 296.7 KB. Die Grenze liegt knapp
 * darueber. Wer sie anhebt, soll das begruenden muessen.
 */
const BUDGET_KB = 305;

const nurZeigen = process.argv.includes("--zeige");

console.log("");
console.log("Budget-Check");
console.log("============");
console.log("");

if (!existsSync(seitenVerzeichnis)) {
  console.log("Kein Build gefunden. Zuerst: npm run build:fixtures");
  console.log("");
  process.exit(1);
}

function htmlSammeln(verzeichnis, gesammelt = []) {
  for (const eintrag of readdirSync(verzeichnis)) {
    const pfad = join(verzeichnis, eintrag);
    if (statSync(pfad).isDirectory()) htmlSammeln(pfad, gesammelt);
    else if (eintrag.endsWith(".html")) gesammelt.push(pfad);
  }
  return gesammelt;
}

/** woff2 ist bereits komprimiert; gzip darueber misst nur den eigenen Aufwand. */
function uebertragungsgroesse(pfad) {
  const inhalt = readFileSync(pfad);
  if (/\.(js|css|json|svg|txt|html)$/.test(pfad)) return gzipSync(inhalt).length;
  return inhalt.length;
}

const seiten = htmlSammeln(seitenVerzeichnis)
  .filter((pfad) => !pfad.includes("_global-error"))
  .sort();

if (seiten.length === 0) {
  console.log("Der Build enthaelt keine vorgerenderten Seiten.");
  process.exit(1);
}

const gemessen = [];

for (const pfad of seiten) {
  const html = readFileSync(pfad, "utf8");
  let summe = gzipSync(Buffer.from(html)).length;
  const fehlend = [];

  const referenzen = [...new Set([...html.matchAll(/\/_next\/[A-Za-z0-9._/-]+/g)].map((t) => t[0]))];
  for (const referenz of referenzen) {
    const datei = join(build, referenz.replace("/_next/", ""));
    if (!existsSync(datei)) {
      fehlend.push(referenz);
      continue;
    }
    summe += uebertragungsgroesse(datei);
  }

  gemessen.push({
    route: "/" + relative(seitenVerzeichnis, pfad).replace(/\\/g, "/").replace(/\.html$/, "").replace(/^index$/, ""),
    kb: summe / 1024,
    dateien: referenzen.length,
    fehlend,
  });
}

gemessen.sort((a, b) => b.kb - a.kb);

const ueber = [];
for (const { route, kb, dateien, fehlend } of gemessen) {
  const zeile = `${route.padEnd(44)} ${kb.toFixed(1).padStart(7)} KB   ${String(dateien).padStart(2)} Dateien`;
  if (!nurZeigen && kb > BUDGET_KB) {
    console.log(`  UEBER ${zeile}`);
    ueber.push({ route, kb });
  } else {
    console.log(`  ok    ${zeile}`);
  }
  for (const referenz of fehlend) console.log(`        nicht gefunden: ${referenz}`);
}

const groesste = gemessen[0];
console.log("");
console.log("-------------");
console.log(
  `${gemessen.length} Seiten gemessen, groesste ${groesste.kb.toFixed(1)} KB, Budget ${BUDGET_KB} KB.`,
);
console.log("Ohne Bilder — die Fixtures haben keine. Siehe Kopf dieser Datei.");
console.log("");

if (nurZeigen) process.exit(0);

if (ueber.length > 0) {
  console.log(`${ueber.length} Seite(n) ueber dem Budget.`);
  console.log("");
  console.log("Die Seite ist schwerer geworden. Entweder das Gewicht zurueckdrehen —");
  console.log("oder die Grenze in dieser Datei anheben und im Commit sagen, wofuer.");
  console.log("Eine Ratsche, die man wortlos aufdreht, ist keine.");
  process.exit(1);
}

console.log("Alle Seiten im Budget.");
