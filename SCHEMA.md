# Inhaltsmodell

Zum Abtippen in Storyblok. Alle technischen Namen müssen exakt so heissen, weil
der Code sie referenziert: die Komponentennamen in `lib/storyblok/components.ts`,
die Feldnamen in `lib/storyblok/adapters.ts`.

Space in der Region **EU** anlegen. Bei einer anderen Region muss `region` in
`lib/storyblok/server.ts` angepasst werden — sonst kommen leere Antworten ohne
verständlichen Fehler zurück.

## Content-Types

### `page`

| Feld | Typ | Hinweis |
|---|---|---|
| `title` | Text | |
| `body` | Blocks | erlaubt: hero, text_image, teaser_grid, quote |
| `seo_title` | Text | |
| `seo_description` | Textarea | |

Bei `body` unter *Allowed components* nur die vier Bloks zulassen. Das ist die
Einschränkung, die Block-Suppe verhindert.

### `article`

Alle Artikel im Ordner `artikel/` anlegen, damit CMS-Pfad und Route
übereinstimmen.

| Feld | Typ | Hinweis |
|---|---|---|
| `title` | Text | |
| `teaser` | Textarea | zwei bis drei Zeilen |
| `image` | Asset | Bild |
| `image_caption` | Text | optional |
| `date` | Datetime | |
| `author` | Text | |
| `author_bio` | Textarea | optional |
| `topic` | Text | optional, erscheint in der Metazeile |
| `reading_minutes` | Number | optional |
| `body` | Richtext | |

## Nestable Blocks

### `hero`

| Feld | Typ |
|---|---|
| `eyebrow` | Text |
| `headline` | Text |
| `intro` | Textarea |
| `primary_label` | Text |
| `primary_link` | Link |
| `secondary_label` | Text |
| `secondary_link` | Link |
| `image` | Asset |

### `text_image`

| Feld | Typ | Hinweis |
|---|---|---|
| `eyebrow` | Text | |
| `headline` | Text | |
| `text` | Textarea | Absätze durch Leerzeile trennen |
| `image` | Asset | |
| `image_position` | Single-Option | Werte `left` und `right`, Standard `right` |

### `teaser_grid`

| Feld | Typ | Hinweis |
|---|---|---|
| `headline` | Text | |
| `articles` | Multi-Options | Source: Stories, gefiltert auf Content-Type `article` |
| `more_label` | Text | optional |
| `more_link` | Link | optional |

### `quote`

| Feld | Typ |
|---|---|
| `text` | Textarea |
| `author` | Text |
| `role` | Text |

## Schneller als abtippen

Die vollständige Anleitung mit allen Schritten steht in
[docs/EINRICHTUNG.md](./docs/EINRICHTUNG.md). Kurzfassung:

Die Komponenten oben liegen als JSON im Format der Storyblok-CLI bereit, die
Beispielinhalte als Seed-Skript:

```bash
npx storyblok login
npx storyblok push-components storyblok/components.json --space <id>

STORYBLOK_SPACE_ID=<id> STORYBLOK_MANAGEMENT_TOKEN=<personal-access-token>   node scripts/storyblok-seed.mjs
```

Das Skript legt fünf Artikel und vier Seiten an, in dieser Reihenfolge, weil
das Teaser-Grid die Artikel über ihre UUID referenziert. Es ist idempotent:
Ein zweiter Lauf aktualisiert, statt zu verdoppeln. Was es vorher tut, zeigt
`node scripts/storyblok-seed.mjs --dry-run`.

Beides ist ungetestet gegen einen echten Space — geschrieben habe ich es ohne
Zugang. Der Trockenlauf stimmt, der erste echte Lauf findet bei dir statt.

## Inhalte

Mindestens fünf Artikel und eine Story `home` vom Typ `page`, sonst wirkt das
Teaser-Grid leer. Beispielinhalte stehen im Mockup und lassen sich direkt
übernehmen.

## Fallback prüfen

Zum Testen des Abnahmekriteriums einen fünften Blok anlegen, etwa
`interactive_timeline`, ihn in `body` einer Seite einsetzen und **nicht** in
`lib/storyblok/components.ts` registrieren. Die Seite muss weiterhin rendern und
den Platzhalter aus `components/blocks/UnknownBlock.tsx` zeigen.
