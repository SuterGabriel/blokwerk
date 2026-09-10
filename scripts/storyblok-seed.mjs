#!/usr/bin/env node
// Seed: legt die Beispielinhalte im Storyblok-Space an.
//
// Die neun Stories stehen bereits in src/lib/storyblok/fixtures/inhalte.ts —
// dieselben, gegen die die CI baut. Sie von Hand ins CMS zu tippen waere eine
// Stunde Arbeit mit Tippfehlern als Beigabe.
//
// Voraussetzung ist, dass die Komponenten existieren:
//
//   npx storyblok login
//   npx storyblok push-components storyblok/components.json --space <id>
//
// Dann:
//
//   STORYBLOK_SPACE_ID=123456 STORYBLOK_MANAGEMENT_TOKEN=xxx \
//     node scripts/storyblok-seed.mjs
//
// Der Token ist der Personal Access Token aus *My Account -> Personal access
// tokens*, nicht einer der beiden Content-Delivery-Token aus .env.local. Er
// darf schreiben, gehoert also nicht ins Repo und nicht in ein Deployment.
//
// Ohne Zugangsdaten laeuft nur der Trockenlauf:
//
//   node scripts/storyblok-seed.mjs --dry-run
//
// Das Skript ist idempotent: Existiert eine Story mit demselben Pfad, wird sie
// aktualisiert statt ein zweites Mal angelegt.
//
// Ehrlichkeitshalber: Geschrieben, ohne einen Space zum Testen zu haben. Der
// Trockenlauf ist geprueft, der echte Lauf nicht.
//
// Node meldet beim Start eine Warnung (MODULE_TYPELESS_PACKAGE_JSON), weil
// dieses Skript eine .ts-Datei importiert und package.json kein "type" setzt.
// Sie ist harmlos und bleibt sichtbar: "type": "module" nachzutragen wuerde
// die Modulauflösung des ganzen Next-Projekts anfassen, und das ist ein
// hoher Preis fuer eine leisere Ausgabe in einem Hilfsskript.

import { randomUUID } from "node:crypto";
import { ARTIKEL, SEITEN } from "../src/lib/storyblok/fixtures/inhalte.ts";

const TROCKEN = process.argv.includes("--dry-run");
const SPACE = process.env.STORYBLOK_SPACE_ID;
const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;

// Region EU, passend zu apiOptions in src/lib/storyblok/server.ts.
const BASIS = "https://mapi.storyblok.com/v1";

if (!TROCKEN && (!SPACE || !TOKEN)) {
  console.error("STORYBLOK_SPACE_ID und STORYBLOK_MANAGEMENT_TOKEN fehlen.");
  console.error("Ohne beide geht nur: node scripts/storyblok-seed.mjs --dry-run");
  process.exit(2);
}

/** Storyblok begrenzt auf wenige Anfragen pro Sekunde. */
const warte = (ms) => new Promise((f) => setTimeout(f, ms));

async function api(pfad, optionen = {}) {
  const antwort = await fetch(`${BASIS}/spaces/${SPACE}${pfad}`, {
    ...optionen,
    headers: {
      Authorization: TOKEN,
      "Content-Type": "application/json",
      ...(optionen.headers ?? {}),
    },
  });
  if (!antwort.ok) {
    throw new Error(`${optionen.method ?? "GET"} ${pfad} — ${antwort.status} ${await antwort.text()}`);
  }
  return antwort.json();
}

/**
 * Jeder Blok braucht eine eigene UUID. Die Fixtures tragen sprechende Werte
 * wie "hero-1", damit sie im Quelltext lesbar bleiben; im CMS muessen es
 * echte sein, sonst kollidieren zwei Seiten, die denselben Baustein nutzen.
 */
function mitUuids(wert) {
  if (Array.isArray(wert)) return wert.map(mitUuids);
  if (wert && typeof wert === "object") {
    const kopie = Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, mitUuids(v)]));
    if (typeof kopie.component === "string") kopie._uid = randomUUID();
    return kopie;
  }
  return wert;
}

async function vorhandene() {
  const gefunden = new Map();
  let seite = 1;
  for (;;) {
    const { stories } = await api(`/stories?per_page=100&page=${seite}`);
    for (const story of stories) gefunden.set(story.full_slug, story.id);
    if (stories.length < 100) return gefunden;
    seite += 1;
    await warte(300);
  }
}

async function ablegen(nutzlast, bestand) {
  const pfad = nutzlast.story.slug === "home"
    ? "home"
    : `${nutzlast.parentSlug ? nutzlast.parentSlug + "/" : ""}${nutzlast.story.slug}`;

  if (TROCKEN) {
    console.log(`  wuerde anlegen  ${pfad.padEnd(40)} ${nutzlast.story.content.component}`);
    return `trocken-${nutzlast.story.slug}`;
  }

  const id = bestand.get(pfad);
  const koerper = JSON.stringify({ story: nutzlast.story, publish: 1 });
  const antwort = id
    ? await api(`/stories/${id}`, { method: "PUT", body: koerper })
    : await api("/stories", { method: "POST", body: koerper });

  console.log(`  ${id ? "aktualisiert" : "angelegt    "}    ${pfad.padEnd(40)} ${antwort.story.uuid}`);
  await warte(350);
  return antwort.story.uuid;
}

async function ordnerAnlegen(bestand) {
  if (TROCKEN) {
    console.log("  wuerde anlegen  artikel/                                 Ordner");
    return null;
  }
  if (bestand.has("artikel")) return bestand.get("artikel");

  const antwort = await api("/stories", {
    method: "POST",
    body: JSON.stringify({
      story: { name: "Artikel", slug: "artikel", is_folder: true },
    }),
  });
  console.log("  angelegt        artikel/                                 Ordner");
  await warte(350);
  return antwort.story.id;
}

async function main() {
  console.log("");
  console.log("Storyblok-Seed");
  console.log("==============");
  console.log(TROCKEN ? "Trockenlauf, es wird nichts geschrieben." : `Space ${SPACE}`);
  console.log("");

  const bestand = TROCKEN ? new Map() : await vorhandene();

  console.log(`Artikel (${ARTIKEL.length})`);
  const ordnerId = await ordnerAnlegen(bestand);

  // Erst die Artikel, dann die Seiten: Das Teaser-Grid referenziert Artikel
  // ueber ihre UUID, und die gibt es erst nach dem Anlegen.
  const uuidNachSlug = new Map();
  for (const eintrag of ARTIKEL) {
    const uuid = await ablegen(
      {
        parentSlug: "artikel",
        story: {
          name: eintrag.name,
          slug: eintrag.slug,
          content: mitUuids(eintrag.content),
          ...(ordnerId ? { parent_id: ordnerId } : {}),
        },
      },
      bestand,
    );
    uuidNachSlug.set(eintrag.slug, uuid);
  }

  console.log("");
  console.log(`Seiten (${SEITEN.length})`);
  for (const seite of SEITEN) {
    const inhalt = mitUuids(seite.content);

    // articles enthaelt in den Fixtures die ganzen Artikelobjekte, weil das
    // dem aufgelösten Abruf entspricht. Im CMS stehen dort UUIDs.
    for (const blok of inhalt.body ?? []) {
      if (blok.component === "teaser_grid" && Array.isArray(blok.articles)) {
        blok.articles = blok.articles
          .map((artikel) => uuidNachSlug.get(artikel.slug))
          .filter(Boolean);
      }
    }

    await ablegen({ story: { name: seite.name, slug: seite.slug, content: inhalt } }, bestand);
  }

  console.log("");
  if (TROCKEN) {
    console.log("Trockenlauf beendet. Mit Space-ID und Token laeuft derselbe Weg echt.");
    return;
  }
  console.log("Fertig. Danach in .env.local die beiden Delivery-Token eintragen");
  console.log("und npm run dev starten — ohne BLOKWERK_FIXTURES.");
}

main().catch((fehler) => {
  console.error("");
  console.error(String(fehler.message ?? fehler));
  console.error("");
  console.error("Bricht das Skript mit 401 ab, ist der Token kein Personal Access Token.");
  console.error("Bricht es mit 422 ab, fehlt eine Komponente — dann zuerst:");
  console.error("  npx storyblok push-components storyblok/components.json --space <id>");
  process.exit(1);
});
