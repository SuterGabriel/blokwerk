#!/usr/bin/env node
// Startet einen Next-Befehl mit gesetztem BLOKWERK_FIXTURES=1.
//
// Warum ein Skript und nicht `BLOKWERK_FIXTURES=1 next build` im package.json:
// Diese Form ist POSIX-Syntax. npm fuehrt Skripte unter Windows mit cmd.exe
// aus, und dort ist sie ein Fehler. Ein Projekt, dessen Befehle auf dem
// Rechner des Autors nicht laufen, hat ein Problem, das niemand sonst sieht.
//
// Aufruf: node scripts/mit-fixtures.mjs dev|build|start
import { spawn } from "node:child_process";

const argumente = process.argv.slice(2);
if (argumente.length === 0) {
  console.error("Aufruf: node scripts/mit-fixtures.mjs <next-befehl>");
  process.exit(2);
}

const kind = spawn("npx", ["next", ...argumente], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, BLOKWERK_FIXTURES: "1" },
});

kind.on("exit", (code) => process.exit(code ?? 1));
