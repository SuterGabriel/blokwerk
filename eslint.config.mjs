// Flat Config. `next lint` gibt es seit Next.js 16 nicht mehr — der Befehl
// wurde entfernt und deutet "lint" als Verzeichnisnamen. Gelintet wird
// deshalb direkt ueber die ESLint-CLI.
//
// ESLint bleibt auf der 9er-Linie: eslint-config-next 16 bringt einen Parser
// mit, der unter ESLint 10 bricht (scopeManager.addGlobals). Die neuere
// Hauptversion waere hier kein Fortschritt, sondern ein roter Lauf.
import next from "eslint-config-next";

const config = [
  { ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"] },
  ...next,
];

export default config;
