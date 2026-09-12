#!/usr/bin/env node
// Erzeugt aus den Fixtures die Story-Dateien, die `storyblok stories push`
// erwartet: eine Datei je Story unter .storyblok/stories/<space-id>/, benannt
// <slug>_<uuid>.json.
//
// Warum zusaetzlich zu scripts/storyblok-seed.mjs: Das Seed-Skript spricht die
// Management API und braucht dafuer einen Personal Access Token. Die CLI ist
// nach `storyblok login` ohnehin angemeldet. Wer die CLI schon benutzt, soll
// nicht noch ein zweites Geheimnis erzeugen muessen.
//
// Zwei Durchgaenge, und das ist keine Umstaendlichkeit, sondern die Folge des
// Inhaltsmodells: Das teaser_grid referenziert Artikel ueber ihre UUID. Beim
// ersten Lauf gibt es die noch nicht.
//
//   node scripts/stories-bereitstellen.mjs <space-id> --artikel
//   npx storyblok stories push --space <space-id> --publish
//   npx storyblok stories pull --space <space-id>
//   node scripts/stories-bereitstellen.mjs <space-id> --seiten
//   npx storyblok stories push --space <space-id> --publish
//
// Der zweite Lauf liest die UUIDs aus den heruntergeladenen Dateien.

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARTIKEL, SEITEN } from "../src/lib/storyblok/fixtures/inhalte.ts";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

const space = process.argv[2];
const nurArtikel = process.argv.includes("--artikel");
const nurSeiten = process.argv.includes("--seiten");

if (!space || !/^\d+$/.test(space) || (!nurArtikel && !nurSeiten)) {
  console.error("Aufruf: node scripts/stories-bereitstellen.mjs <space-id> --artikel|--seiten");
  process.exit(2);
}

const verzeichnis = join(wurzel, ".storyblok", "stories", space);
mkdirSync(verzeichnis, { recursive: true });

/** Jeder Blok braucht eine eigene UUID; die sprechenden Werte aus den Fixtures sind nur fuer Menschen. */
function mitUuids(wert) {
  if (Array.isArray(wert)) return wert.map(mitUuids);
  if (wert && typeof wert === "object") {
    const kopie = Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, mitUuids(v)]));
    if (typeof kopie.component === "string") kopie._uid = randomUUID();
    return kopie;
  }
  return wert;
}

/**
 * Liest die bereits im Space liegenden Stories, um an ihre UUIDs zu kommen.
 *
 * Geschluesselt wird nach dem letzten Pfadsegment, nicht nach full_slug. Der
 * Grund ist ein Fall aus dem ersten Lauf: Die CLI legt neue Stories auf der
 * obersten Ebene an, auch wenn die Datei einen Pfad nennt. Wer dann nach
 * full_slug sucht, findet seine eigene Story nicht wieder und legt sie ein
 * zweites Mal an — bis Storyblok den Slug als vergeben meldet.
 */
function bestand() {
  const gefunden = new Map();
  if (!existsSync(verzeichnis)) return gefunden;
  for (const datei of readdirSync(verzeichnis)) {
    if (!datei.endsWith(".json")) continue;
    try {
      const story = JSON.parse(readFileSync(join(verzeichnis, datei), "utf8"));
      if (!story.slug) continue;
      // Gibt es denselben Slug zweimal — etwa als Rest eines fehlgeschlagenen
      // Laufs auf der obersten Ebene —, gewinnt die veroeffentlichte Fassung.
      // Sonst zeigt eine Referenz auf eine Story, die nie ausgeliefert wird.
      const bisher = gefunden.get(story.slug);
      if (!bisher || (story.published && !bisher.published)) gefunden.set(story.slug, story);
    } catch {
      // Kaputte Datei im Arbeitsverzeichnis der CLI ist kein Grund abzubrechen.
    }
  }
  return gefunden;
}

const vorhanden = bestand();

/**
 * Die Fixtures enthalten auf der Seite `studio` einen Blok
 * `interactive_timeline`, der absichtlich in keiner Komponenten-Map steht — er
 * zeigt im Fixture-Build den Platzhalter fuer unbekannte Bloks.
 *
 * Im CMS hat er nichts verloren: Dort waere er ein Baustein, den das Modell
 * nicht kennt und den page.body ohnehin nicht zulaesst. Die Probe aus
 * SCHEMA.md bleibt eine Probe, die man einmal von Hand macht — kein Inhalt,
 * der dauerhaft in einem Space liegt.
 *
 * Deshalb hier gefiltert, gegen das Schema, das tatsaechlich im Space steht.
 */
function bekannteKomponenten() {
  const pfad = join(wurzel, ".storyblok", "components", space, "components.json");
  if (!existsSync(pfad)) return null;
  try {
    return new Set(JSON.parse(readFileSync(pfad, "utf8")).map((k) => k.name));
  } catch {
    return null;
  }
}

const bekannt = bekannteKomponenten();

function ohneUnbekannte(bloks) {
  if (!bekannt) return bloks;
  return bloks.filter((blok) => {
    if (bekannt.has(blok.component)) return true;
    console.log(`  (ausgelassen: ${blok.component} — im Space nicht als Komponente vorhanden)`);
    return false;
  });
}

function schreiben(story) {
  const alt = vorhanden.get(story.slug);
  // Existiert die Story schon, dieselbe UUID behalten — sonst legt der Push
  // eine zweite an, statt die erste zu aktualisieren.
  const uuid = alt?.uuid ?? randomUUID();
  const vollstaendig = {
    ...(alt ?? {}),
    ...story,
    uuid,
    published: true,
  };
  const datei = join(verzeichnis, `${story.slug}_${uuid}.json`);
  writeFileSync(datei, JSON.stringify(vollstaendig, null, 2) + "\n", "utf8");
  console.log(`  ${story.full_slug.padEnd(46)} ${story.is_folder ? "Ordner" : story.content.component}`);
}

console.log("");
console.log(`Stories fuer Space ${space}`);
console.log("");

if (nurArtikel) {
  schreiben({
    name: "Artikel",
    slug: "artikel",
    full_slug: "artikel",
    is_folder: true,
    content: {},
  });

  // Ohne parent_id landen die Artikel auf der obersten Ebene, und /artikel/<slug>
  // laeuft ins Leere. Die ID des Ordners gibt es erst, nachdem er existiert —
  // beim ersten Lauf ist sie daher unbekannt und der zweite zieht sie nach.
  const ordner = vorhanden.get("artikel");
  if (!ordner) {
    console.log("  (Ordner noch ohne ID — nach dem ersten Push pullen und erneut ausfuehren)");
  }

  for (const eintrag of ARTIKEL) {
    schreiben({
      name: eintrag.name,
      slug: eintrag.slug,
      full_slug: eintrag.full_slug,
      is_folder: false,
      ...(ordner?.id ? { parent_id: ordner.id } : {}),
      content: mitUuids(eintrag.content),
    });
  }
}

if (nurSeiten) {
  const uuidNachSlug = new Map();
  for (const [slug, story] of vorhanden) {
    if (story.content?.component === "article") uuidNachSlug.set(slug, story.uuid);
  }

  const fehlend = ARTIKEL.filter((a) => !uuidNachSlug.has(a.slug)).map((a) => a.slug);
  if (fehlend.length > 0) {
    console.error(`Fuer diese Artikel fehlt die UUID: ${fehlend.join(", ")}`);
    console.error("Zuerst --artikel pushen und danach `storyblok stories pull` ausfuehren.");
    process.exit(1);
  }

  for (const seite of SEITEN) {
    const inhalt = mitUuids(seite.content);
    inhalt.body = ohneUnbekannte(inhalt.body ?? []);
    for (const blok of inhalt.body) {
      if (blok.component === "teaser_grid" && Array.isArray(blok.articles)) {
        blok.articles = blok.articles.map((artikel) => uuidNachSlug.get(artikel.slug)).filter(Boolean);
      }
    }
    schreiben({
      name: seite.name,
      slug: seite.slug,
      full_slug: seite.full_slug,
      is_folder: false,
      content: inhalt,
    });
  }
}

console.log("");
console.log(`Jetzt: npx storyblok stories push --space ${space} --publish`);
