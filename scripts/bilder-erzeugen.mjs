#!/usr/bin/env node
// Erzeugt die Bilder der Website als PNG.
//
// Warum erzeugt und nicht fotografiert: Blokwerk ist ein Studio, das es nicht
// gibt. Fremde Fotos wuerden eine Wirklichkeit behaupten, die nicht existiert.
// Diese Grafiken behaupten nichts — sie zeigen das, worueber die Seite
// schreibt: Inhalte als Bausteine, gesetzt in den Farben der Seite selbst.
//
// Gerendert mit sharp, das als Abhaengigkeit von next/image ohnehin im Projekt
// liegt. Keine neue Abhaengigkeit fuer eine einmalige Aufgabe.
//
// Aufruf:
//   node scripts/bilder-erzeugen.mjs            alle
//   node scripts/bilder-erzeugen.mjs hero       nur eines
//
// Ziel: build/bilder/ — nicht im Repo, die Bilder leben danach im CMS.

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const ziel = join(wurzel, "build", "bilder");
mkdirSync(ziel, { recursive: true });

const PAPIER = "#fbfaf6";
const PAPIER_TIEF = "#f3f1ea";
const TINTE = "#191917";
const LINIE = "#e4e0d8";
const AKZENT = "#3c5a47";

const BREITE = 1600;
const HOEHE = 900;

/** Kleiner deterministischer Zufall, damit jedes Bild anders und reproduzierbar ist. */
function streuung(saat) {
  let x = [...saat].reduce((s, z) => s + z.charCodeAt(0) * 17, 7);
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

/**
 * Vier Grundformen statt einer Komposition mit Zufallsversatz.
 *
 * Der zweite Entwurf hatte eine Figur, aber alle acht Bilder sahen gleich aus —
 * die Streuung verschob nur Positionen. Nebeneinander im Journal wirkt das wie
 * ein Bild, das versehentlich fuenfmal eingesetzt wurde.
 *
 * Deshalb: vier Anordnungen, die sich in der Silhouette unterscheiden, nicht
 * in Details. Die Saat variiert danach nur noch Groessen innerhalb der Form.
 */

function grund(dunkel) {
  const teile = [
    `<rect width="${BREITE}" height="${HOEHE}" fill="${dunkel ? TINTE : PAPIER}"/>`,
  ];
  for (let x = 200; x < BREITE; x += 200) {
    teile.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${HOEHE}" stroke="${dunkel ? "#24241f" : "#f0ede4"}" stroke-width="1"/>`,
    );
  }
  return teile;
}

function kasten(x, y, b, h, farbe) {
  return `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(b)}" height="${Math.round(h)}" rx="4" fill="${farbe}"/>`;
}

function umriss(x, y, b, h, farbe, staerke = 3) {
  return `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(b)}" height="${Math.round(h)}" rx="4" fill="none" stroke="${farbe}" stroke-width="${staerke}"/>`;
}

/** A — liegend: ein breites Band, von einer hellen Flaeche ueberlagert. */
function liegend(z, dunkel) {
  const hell = dunkel ? PAPIER : PAPIER_TIEF;
  const strich = dunkel ? "#5a5a52" : TINTE;
  const t = grund(dunkel);
  const bandH = 260 + z() * 90;
  const bandY = 330 + z() * 80;
  t.push(kasten(-60, bandY, 1240 + z() * 200, bandH, AKZENT));
  t.push(kasten(820 + z() * 120, bandY - 220 - z() * 90, 430 + z() * 120, 330 + z() * 90, hell));
  t.push(umriss(300 + z() * 120, bandY + bandH - 40, 380 + z() * 140, HOEHE, strich));
  t.push(kasten(BREITE - 150, 120 + z() * 100, 220, 520 + z() * 120, dunkel ? "#2c2c27" : LINIE));
  return t;
}

/** B — gestapelt: eine Saeule, die oben und unten aus dem Bild laeuft. */
function gestapelt(z, dunkel) {
  const hell = dunkel ? PAPIER : PAPIER_TIEF;
  const t = grund(dunkel);
  const x = 420 + z() * 100;
  const breite = 560 + z() * 100;

  // Die Bloecke stossen aneinander statt zu schweben; die Saeule ist
  // oben und unten angeschnitten, damit sie nicht im Raum haengt.
  let y = -60;
  const farben = [dunkel ? "#2c2c27" : LINIE, AKZENT, hell, AKZENT];
  for (let i = 0; i < 4 && y < HOEHE; i++) {
    const h = 210 + z() * 120;
    const versatz = i % 2 === 0 ? 0 : 150 + z() * 70;
    t.push(kasten(x + versatz, y, breite, h, farben[i]));
    y += h;
  }

  t.push(kasten(-80, 260 + z() * 140, 360, 320 + z() * 120, dunkel ? "#242420" : PAPIER_TIEF));
  t.push(umriss(x + breite - 120, 150 + z() * 120, 440, 420 + z() * 120, dunkel ? "#5a5a52" : TINTE));
  return t;
}

/** C — Treppe: Bausteine, die sich ueberlappend nach rechts oben schieben. */
function diagonal(z, dunkel) {
  const hell = dunkel ? PAPIER : PAPIER_TIEF;
  const t = grund(dunkel);
  const stufen = 5;
  const b = 360 + z() * 80;
  const h = 230 + z() * 60;

  // Ueberlappung statt Abstand: die Stufen bilden eine zusammenhaengende Masse.
  for (let i = 0; i < stufen; i++) {
    const x = -80 + i * (b * 0.62);
    const y = HOEHE - 140 - i * (h * 0.55) - h;
    const farbe = i === 2 ? AKZENT : i === 4 ? hell : dunkel ? "#2c2c27" : LINIE;
    t.push(kasten(x, y, b, h, farbe));
  }

  t.push(umriss(180 + z() * 120, -80, 520 + z() * 120, 420 + z() * 100, dunkel ? "#5a5a52" : TINTE));
  return t;
}

/** D — Fenster: eine dominante Flaeche mit einem Ausschnitt darin. */
function fenster(z, dunkel) {
  const hell = dunkel ? PAPIER : PAPIER_TIEF;
  const t = grund(dunkel);
  const x = 180 + z() * 80;
  const y = 110 + z() * 60;
  const b = 1000 + z() * 200;
  const h = 620 + z() * 80;
  t.push(kasten(x, y, b, h, AKZENT));
  t.push(kasten(x + b * 0.42, y + h * 0.3, 380 + z() * 120, 300 + z() * 90, hell));
  t.push(kasten(x - 240, y + h - 180 - z() * 80, 320, 400, dunkel ? "#2c2c27" : LINIE));
  t.push(umriss(x + b - 180, y - 70, 420, 260 + z() * 90, dunkel ? "#5a5a52" : TINTE));
  return t;
}

const FORMEN = { liegend, gestapelt, diagonal, fenster };

function komposition(saat, { dunkel = false, form = "liegend" } = {}) {
  const z = streuung(saat);
  const teile = FORMEN[form](z, dunkel);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BREITE}" height="${HOEHE}" viewBox="0 0 ${BREITE} ${HOEHE}">${teile.join("")}</svg>`;
}

// Form und Helligkeit sind so verteilt, dass im Journal nie zwei gleiche
// Silhouetten nebeneinanderstehen — die drei obersten Artikel sind die, die
// auf der Startseite zusammen im Teaser-Raster erscheinen.
const BILDER = [
  { name: "hero", saat: "blokwerk-hero", dunkel: false, form: "fenster" },
  { name: "arbeitsweise", saat: "arbeitsweise-modell", dunkel: false, form: "gestapelt" },
  { name: "technik", saat: "technik-uebergabe", dunkel: true, form: "liegend" },
  { name: "artikel-design-tokens", saat: "design-tokens", dunkel: false, form: "diagonal" },
  { name: "artikel-cms-modell", saat: "cms-modell", dunkel: true, form: "gestapelt" },
  { name: "artikel-barrierefreiheit", saat: "barrierefreiheit", dunkel: false, form: "liegend" },
  { name: "artikel-180-kilobyte", saat: "180-kilobyte", dunkel: true, form: "fenster" },
  { name: "artikel-bausteine", saat: "bausteine", dunkel: false, form: "diagonal" },
];

const gewuenscht = process.argv[2];
const auswahl = gewuenscht ? BILDER.filter((b) => b.name === gewuenscht) : BILDER;

if (auswahl.length === 0) {
  console.error(`Unbekannt: ${gewuenscht}. Moeglich: ${BILDER.map((b) => b.name).join(", ")}`);
  process.exit(2);
}

console.log("");
for (const bild of auswahl) {
  const svg = komposition(bild.saat, { dunkel: bild.dunkel, form: bild.form });
  const datei = join(ziel, `${bild.name}.png`);
  const info = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(datei);
  console.log(`  ${bild.name.padEnd(28)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log("");
console.log(`Liegt in build/bilder/`);
