/**
 * Die Komponenten-Map: Storyblok-Komponentenname -> React-Komponente.
 *
 * Fehlt hier ein Eintrag, greift customFallbackComponent (siehe server.ts).
 * Die Seite rendert dann einen sichtbaren Platzhalter statt einer stillen Luecke.
 */
import Page from "@/components/blocks/Page";
import Hero from "@/components/blocks/Hero";
import TextImage from "@/components/blocks/TextImage";
import TeaserGrid from "@/components/blocks/TeaserGrid";
import Quote from "@/components/blocks/Quote";

export const components = {
  page: Page,
  hero: Hero,
  text_image: TextImage,
  teaser_grid: TeaserGrid,
  quote: Quote,
};

/**
 * Relationen, die Storyblok beim Abruf aufloesen soll.
 * Ohne diesen Eintrag liefert teaser_grid.articles nur UUIDs.
 */
export const RESOLVE_RELATIONS = ["teaser_grid.articles"];
