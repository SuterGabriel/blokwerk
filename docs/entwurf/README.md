# Entwurf

Die beiden Vorlagen, gegen die Blokwerk gebaut ist. Sie liegen hier, damit die
Umsetzung nachprüfbar bleibt: Wer die Oberfläche beurteilen will, soll nicht
raten müssen, was sie darstellen sollte.

| Datei | Was drinsteht |
|---|---|
| [wireframes.pdf](./wireframes.pdf) | Struktur und Hierarchie in Graustufen. Jede Zone ist mit ihrem Storyblok-Bloknamen und der Komponente beschriftet. Drei Ansichten: Startseite Desktop, Artikel-Detail Desktop, Startseite mobil. |
| [mockups.pdf](./mockups.pdf) | Dieselben Ansichten ausgestaltet, dazu eine Komponentenübersicht mit Zuständen (Button default/hover/secondary, Artikelkarte default/hover, Metazeile, unbekannter Baustein, leeres Teaser-Grid). |

Der Weg war Wireframe → Mockup → Code, in dieser Reihenfolge. Die Beschriftung
im Wireframe ist deshalb keine Nachdokumentation, sondern die Vorgabe: Der
Blokname links stand vor der Datei, die ihn heute rendert.

## Zone im Wireframe → Datei im Repo

| Blok | Wireframe | Umsetzung |
|---|---|---|
| `header` | Header.tsx | [Header.tsx](../../src/components/ui/Header.tsx) |
| `hero` | Hero.tsx | [Hero.tsx](../../src/components/blocks/Hero.tsx) → [HeroView.tsx](../../src/components/ui/HeroView.tsx) |
| `text_image` | TextImage.tsx | [TextImage.tsx](../../src/components/blocks/TextImage.tsx) → [TextImageView.tsx](../../src/components/ui/TextImageView.tsx) |
| `teaser_grid` | TeaserGrid.tsx | [TeaserGrid.tsx](../../src/components/blocks/TeaserGrid.tsx) → [TeaserGridView.tsx](../../src/components/ui/TeaserGridView.tsx) |
| `quote` | Quote.tsx | [Quote.tsx](../../src/components/blocks/Quote.tsx) → [QuoteView.tsx](../../src/components/ui/QuoteView.tsx) |
| `footer` | Footer.tsx | [Footer.tsx](../../src/components/ui/Footer.tsx) |
| Artikel-Detail | ArticleHeader / ArticleImage / RichText | [artikel/[slug]/page.tsx](../../src/app/artikel/%5Bslug%5D/page.tsx) |

Die Zweiteilung Blok → View steht nicht im Wireframe. Sie kam beim Bauen dazu,
begründet in [DECISIONS.md](../../DECISIONS.md), Punkt 4: Die linke Spalte ist
die Naht zum CMS, die rechte kennt es nicht.

## Zustände aus der Komponentenübersicht

Das Mockup zeigt drei Zustände, die in einem Screenshot sonst nie vorkommen,
weil man für sie das CMS kaputtmachen muss. Sie sind umgesetzt:

| Zustand | Umsetzung |
|---|---|
| Unbekannter Baustein | [UnknownBlock.tsx](../../src/components/blocks/UnknownBlock.tsx) |
| Teaser-Grid, leer | `EmptyState` in [TeaserGridView.tsx](../../src/components/ui/TeaserGridView.tsx) |
| Metazeile | [Meta.tsx](../../src/components/ui/Meta.tsx) |

## Was im Entwurf steht und noch nicht im Code

Der Stand:

- **Mobile Navigation.** Wireframe 3 zeigt im Header ein Menüsymbol,
  [Header.tsx](../../src/components/ui/Header.tsx) rendert die vier Links auf
  jeder Breite nebeneinander.
- **Zweiter Hero-Button.** Das Mockup zeigt „Projekt anfragen“ und „Journal
  lesen“. Die Komponente kann beides
  ([HeroView.tsx](../../src/components/ui/HeroView.tsx)), das Schema hat das
  Feld — es hängt nur an Inhalten im Space.

Der dritte Punkt aus dem Mockup, die **Artikelübersicht**, ist inzwischen
gebaut: [journal/page.tsx](../../src/app/journal/page.tsx). Sie ist eine eigene
Route und keine Story im CMS — warum, steht in
[DECISIONS.md](../../DECISIONS.md), Punkt 10.

Die beiden verbliebenen stehen im Mockup unter „Nächste Schritte“ und sind
bewusst offen geblieben, nicht übersehen.
