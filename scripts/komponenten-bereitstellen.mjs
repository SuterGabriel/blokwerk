#!/usr/bin/env node
// Legt storyblok/components.json dort ab, wo die Storyblok-CLI sie sucht.
//
// Die CLI (v4) liest beim Push nicht aus einem uebergebenen Pfad, sondern aus
// .storyblok/components/<space-id>/components.json. Das Verzeichnis ist ihr
// Arbeitsordner und steht in .gitignore — die gepflegte Fassung bleibt
// storyblok/components.json, geprueft vom Beleg-Check.
//
// Dieses Skript kopiert nur. Es existiert, weil die Alternative zwei Befehle
// waeren, die unter PowerShell und bash verschieden heissen, und weil ein
// Tippfehler in der Space-ID sonst still ins Leere kopiert.
//
// Aufruf:
//   node scripts/komponenten-bereitstellen.mjs <space-id>
//
// Danach:
//   npx storyblok components push --space <space-id>

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const quelle = join(wurzel, "storyblok", "components.json");

const space = process.argv[2];
if (!space || !/^\d+$/.test(space)) {
  console.error("Aufruf: node scripts/komponenten-bereitstellen.mjs <space-id>");
  console.error("Die Space-ID ist eine reine Zahl, ohne die Raute aus der Storyblok-Oberflaeche.");
  process.exit(2);
}

const inhalt = JSON.parse(readFileSync(quelle, "utf8"));
if (!Array.isArray(inhalt)) {
  console.error(`${quelle} muss ein Array sein — das ist das Format, das die CLI liest.`);
  process.exit(1);
}

const ziel = join(wurzel, ".storyblok", "components", space, "components.json");
mkdirSync(dirname(ziel), { recursive: true });
copyFileSync(quelle, ziel);

console.log("");
console.log(`${inhalt.length} Komponenten bereitgelegt:`);
for (const komponente of inhalt) console.log(`  ${komponente.name}`);
console.log("");
console.log(`Ziel: .storyblok/components/${space}/components.json`);
console.log("");
console.log(`Jetzt: npx storyblok components push --space ${space}`);
