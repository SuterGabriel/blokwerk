# Anforderungen und Belege

Diese Datei hält fest, gegen welche Ausschreibung Blokwerk als Nachweis
antritt und welche Stelle im Code welche Anforderung belegt. Die Belegspalte
zeigt auf Dateien, nicht auf Absichten. Wo nichts steht, steht nichts.

## Ausschreibung

| | |
|---|---|
| Titel | Frontend Developer — 100% remote, Vollzeit/Teilzeit, langfristiges Projekt |
| Auftraggeber | wynwood tech solutions GmbH |
| Projekt-ID | 3044939 |
| Ort | Berlin, Deutschland — 100% Remote |
| Vertragsart | Freiberuflich |
| Start | ab sofort |
| Dauer | 12 Monate, Verlängerung möglich |
| Auslastung | 100%, Teilzeit ebenfalls möglich |
| Sprache | Deutsch, deutsche Geschäftszeiten |
| Veröffentlicht | 08.09.2026, 10:30 Uhr |
| Erfasst am | 10.09.2026 |

Genannte Schlagworte: JavaScript, Next.js, Front End, Full Stack Entwicklung,
React Native.

## Die vier Anforderungen, wörtlich

### 1. „Erfahrung in der Frontend-Entwicklung mit React und Next.js."

**Status: belegt.**

| Konzept | Beleg |
|---|---|
| App Router mit React Server Components | `src/app/` durchgehend, Client-Komponenten nur wo nötig (`StoryblokProvider`, `DraftToolbar`) |
| Statische Generierung | `generateStaticParams` in `src/app/artikel/[slug]/page.tsx:14` |
| ISR | `export const revalidate = 3600` ebenda, Zeile 11 |
| Gezielte Neuvalidierung | `revalidatePath` in `src/app/api/revalidate/route.ts:35` |
| Metadaten je Artikel inkl. Open Graph | `generateMetadata` ebenda, Zeile 19–40 |
| Metadaten der Startseite aus dem CMS | `generateMetadata` in `src/app/page.tsx:17` — `seo_title` und `seo_description` der Story `home` |
| Draft Mode | `src/app/preview/layout.tsx:13` |
| Routing mit Catch-all und optionalem Catch-all | `src/app/[...slug]/` und `src/app/preview/[[...slug]]/` |
| Statische Route neben dem Catch-all | `src/app/journal/page.tsx:7` — eigene Uebersichtsseite, Begruendung `DECISIONS.md` Punkt 10 |
| `robots.txt` und Sitemap als Code | `src/app/robots.ts`, `src/app/sitemap.ts` |

Anmerkung zur Ehrlichkeit: Das ist ein Einarbeitungsprojekt, keine Kundenarbeit.
Belegt ist damit die Beherrschung der Konzepte, nicht eine Projekthistorie.

Seit dem 12.09.2026 läuft der Build nicht mehr nur gegen Fixtures, sondern
gegen einen echten Storyblok-Space: sechzehn Routen, alle Slugs über die
Content Delivery API geholt.

### 2. „Erfahrung mit Storyblok oder vergleichbaren Headless-CMS-Plattformen."

**Status: belegt.** Die Anforderung sagt „oder", nicht „und" — Storyblok ist
belegt, damit ist sie erfüllt. Offen bleibt nicht die Anforderung, sondern eine
Zeile der Selbsteinschätzung; das steht unten.

| Konzept | Beleg |
|---|---|
| Zwei Content-Types, vier verschachtelbare Bloks | `SCHEMA.md` |
| Komponenten-Map | `src/lib/storyblok/components.ts:13` |
| Registrierter Fallback für unbekannte Bloks | `enableFallbackComponent` / `customFallbackComponent` in `src/lib/storyblok/server.ts:28` |
| Aufgelöste Relationen | `RESOLVE_RELATIONS` in `src/lib/storyblok/components.ts:25`, angewandt in `fetch.ts:10` |
| Visual Editor über die Bridge | `src/components/StoryblokProvider.tsx`, `storyblokEditable` in `src/components/blocks/` |
| Trennung Draft / Published über zwei Token | `src/lib/storyblok/server.ts:12–21` |
| Image Service | `src/components/ui/SbImage.tsx:24` |

Zu „vergleichbaren Plattformen": Die Ausschreibung verlangt weiter unten eine
Liste weiterer Headless-CMS-Plattformen samt Selbsteinschätzung. Diese Liste ist
kurz — ich habe mit Sanity und Contentful nicht gearbeitet. Die Adapterschicht
ist so gebaut, dass ein Wechsel eine neue Adapterdatei wäre und keine neue
Oberfläche (`DECISIONS.md`, Punkt 4) — das ist ein Argument für Übertragbarkeit,
aber kein Erfahrungsnachweis. Wenn danach gefragt wird, gehört das so gesagt.

### 3. „Verständnis für Headless-CMS-Architekturen, Content-Modelle und API-basierte Content-Ausspielung."

**Status: belegt — das ist der Kern des Projekts.**

| Konzept | Beleg |
|---|---|
| Content-Modell als eigenständige Entscheidung | `SCHEMA.md`, Begründung in `DECISIONS.md` Punkt 1 |
| Referenz statt Kopie im Teaser-Grid | `DECISIONS.md` Punkt 2, Adapter `adapters.ts:86` filtert unaufgelöste Referenzen heraus |
| Trennung CMS-Format / Anwendungsformat | `src/lib/storyblok/adapters.ts` gegen `src/lib/types.ts` |
| Nachweis der Entkopplung | `grep -rl "@storyblok" src/components/ui/` gibt nichts aus |
| Wo die Entkopplung *nicht* hält, samt Begründung | `DECISIONS.md` Punkt 5 |
| Ausspielung Draft vs. Published | `src/lib/storyblok/fetch.ts:9` |
| Veröffentlichung als Ereignis statt als Intervall | `src/app/api/revalidate/route.ts`, Begründung `DECISIONS.md` Punkt 3 |

Der Punkt, der im Gespräch am meisten trägt, ist `DECISIONS.md` Punkt 5: die
Stellen, an denen die Abstraktion bewusst gebrochen wurde, und warum eine
vollständige Entkopplung dort teurer gewesen wäre als der Nutzen.

### 4. „Erfahrung in der Umsetzung responsiver, performanter Webanwendungen."

**Status: belegt, mit einer benannten Grenze.** Das ausgelieferte Gewicht ist
gemessen und wird in der CI gehalten. Nicht gemessen ist Geschwindigkeit — dafür
braucht es ein Deployment.

| Konzept | Beleg |
|---|---|
| Responsive Umsetzung | Tailwind-Breakpoints durchgehend, etwa `sm:grid-cols-2` in `src/components/ui/ArticleGrid.tsx:20` |
| Navigation, die auf 390 Pixeln funktioniert | `src/components/ui/Header.tsx:49` — Klappmenü als `<details>`, ohne Client-Komponente und damit ohne zusätzliches JavaScript |
| `sizes` statt fester Bildbreiten | `artikel/[slug]/page.tsx:78` |
| Serverseitige Skalierung und WebP | `src/components/ui/SbImage.tsx:25` |
| `priority` für das Bild above the fold | `artikel/[slug]/page.tsx:77` |
| Statisch ausgeliefert statt pro Aufruf gerendert | `generateStaticParams` plus `dynamicParams = false` |
| Lint auf React-Regeln | `eslint.config.mjs`, Lauf in der CI |
| Vorlage, gegen die gebaut wurde | [docs/entwurf/](./entwurf/README.md) — Wireframes und Mockups, je in Desktop- und Mobilbreite |
| Gemessenes Seitengewicht | `scripts/budget-check.mjs`, in der CI nach jedem Build |
| Build ohne Zugangsdaten, damit die Messung überhaupt läuft | `src/lib/storyblok/fixtures/index.ts:17`, Begründung `DECISIONS.md` Punkt 11 |

Die Messung, Stand 10.09.2026, gebaut gegen die Fixtures und ohne Bilder:

| | |
|---|---|
| Schwerste Seite | 297,1 KB (Startseite) |
| Leichteste gemessene Seite | 179,8 KB (404) |
| Davon Framework | rund 190 KB gzip |
| Davon zwei Schriften | 97 KB |
| Davon eigenes CSS | 4,5 KB |
| Grenze im Gate | 305 KB pro Seite |

Der unbequeme Teil davon steht in `DECISIONS.md` Punkt 12: Die Startseite
verspricht im Fliesstext 180 Kilobyte, und diese Zahl ist mit React und Next.js
nicht erreichbar — der eigene Anteil an der Seite liegt bei etwa vier Prozent.
Das Gate hält deshalb die gemessene Wirklichkeit, nicht den Anspruch. Wer im
Gespräch danach fragt, bekommt die Tabelle und keine Ausrede.

Offen bleibt Geschwindigkeit. Gewicht ist nicht Latenz. „Performant" im Sinne
von Largest Contentful Paint ist bis zu einem Lighthouse-Lauf gegen ein
Deployment weiterhin unbelegt. Siehe „Offene Punkte".

## Wie dieses Dokument geprüft wird

Eine Belegspalte ist nur so viel wert, wie sie stimmt. Drei Gates halten sie
aktuell, ausgeführt vor jedem Commit und in der CI:

| Gate | Prüft |
|---|---|
| `scripts/beleg-check.sh` | Jeder Pfad oben existiert. Jede Zeilennummer zeigt noch auf das, was hier behauptet wird. |
| `scripts/entkopplung-check.sh` | Die Architekturzusagen aus README und DECISIONS.md halten. |
| `scripts/link-check.mjs` | Kein Verweis zwischen den Dokumenten zeigt ins Leere. |
| `scripts/budget-check.mjs` | Keine Seite überschreitet das Gewicht, das hier oben steht. Braucht einen Build und läuft deshalb nur in der CI, nicht vor dem Commit. |

Der Beleg-Check prüft nicht nur, ob eine Datei existiert, sondern ob die
belegte **Zeile** noch den behaupteten Inhalt trägt. Das ist der lautlose Fall:
Jemand fügt oben drei Zeilen ein, der Verweis zeigt auf etwas anderes, und die
Tabelle sieht weiter gepflegt aus. Details in [PIPELINE.md](./PIPELINE.md),
Begründung in [DECISIONS.md](../DECISIONS.md), Punkt 9.

Was die Gates ausdrücklich **nicht** sind: Tests. Sie prüfen Aussagen über den
Code, nicht sein Verhalten. Warum es keine Unit-Tests gibt, steht in
DECISIONS.md, Punkt 7.

## Nicht abgedeckt

Ehrlichkeitshalber, weil die Lücken im Gespräch ohnehin auffallen:

**React Native.** Steht in der Schlagwortliste, aber in keiner der vier
Anforderungen. Blokwerk deckt es nicht ab, und ich habe damit nicht gearbeitet.

**Full Stack Entwicklung.** Ebenfalls nur Schlagwort. Blokwerk hat bewusst keine
Datenbank und keine Authentifizierung (`DECISIONS.md` Punkt 8) — der Zustand
kommt vollständig aus dem CMS. Backend-Erfahrung ist über andere Projekte zu
belegen, nicht über dieses.

**Tests.** Nicht vorhanden, begründet in `DECISIONS.md` Punkt 7. Wenn im
Gespräch danach gefragt wird, ist der Adapter die Stelle, an der ich anfangen
würde — dort liegt die einzige nennenswerte Logik.

## Offene Punkte bis zur Bewerbungsreife

Diese Schritte brauchen Zugänge, die nur Gabriel hat. Der Weg dafür steht in
[EINRICHTUNG.md](./EINRICHTUNG.md):

1. ~~**Storyblok-Space anlegen**~~ — erledigt am 12.09.2026: Region EU, sechs
   Komponenten über die CLI, vier Seiten und fünf Artikel. Die drei Seiten
   `arbeiten`, `studio` und `kontakt` liegen darin, der Header verlinkt sie
   nicht mehr ins 404.
2. ~~**Beide Token** in `.env.local`~~ — erledigt. `npm run build` gegen die
   echte API liefert alle sechzehn Routen, ohne Fixture-Hinweis.
3. **Auf Vercel deployen.** Solange das nicht steht, verspricht `README.md` eine
   Live-URL, die ins Leere führt — das wäre bei einer Bewerbung der teuerste
   einzelne Fehler.
4. **Webhook einrichten** (`Settings → Webhooks`, Story published/unpublished).
5. **Lighthouse gegen das Deployment laufen lassen** und die Zahlen hier
   eintragen. Erst dann ist Anforderung 4 vollständig belegt.
6. ~~**Fallback prüfen**~~ — erledigt und dauerhaft geprüft: Die Fixture-Seite
   `studio` enthält einen Blok `interactive_timeline`, der nicht registriert
   ist. Jeder CI-Build rendert ihn als Platzhalter. Im echten Space bleibt die
   Probe trotzdem sinnvoll, weil dort das CMS den Bloknamen liefert und nicht
   eine Datei im Repo.
7. **Token als GitHub-Secret hinterlegen.** Die CI baut inzwischen gegen die
   Fixtures und misst dabei das Seitengewicht. Was weiterhin ungeprüft ist: ob
   der Abruf gegen den echten Space funktioniert. Das Gerüst für den zweiten
   Build steht auskommentiert in `.github/workflows/ci.yml`.

## Selbsteinschätzung

Die Ausschreibung verlangt eine Selbsteinschätzung von 0 bis 10 in Frontend
Development, JavaScript, Next.js, React, Storyblok sowie weiteren
Headless-CMS-Plattformen. Diese Zahlen sind Gabriels Aussage gegenüber einem
Auftraggeber und werden hier bewusst nicht vorweggenommen. Sie gehören in die
Bewerbung, nicht ins Repository.
