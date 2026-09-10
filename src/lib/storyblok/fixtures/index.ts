/**
 * Der Fixture-Betrieb: dieselben Inhalte, ohne Storyblok dahinter.
 *
 * Wozu — kurz, die lange Fassung steht in DECISIONS.md, Punkt 11: Ohne Token
 * bricht `next build` ab, und ohne Build gibt es keine Zahl zu "performant"
 * aus Anforderung 4. Mit Fixtures baut die CI die Seite vollstaendig und misst
 * das ausgelieferte JavaScript.
 *
 * Der Schalter ist ausdruecklich, nicht abgeleitet: BLOKWERK_FIXTURES=1. Ein
 * Deployment, dem der Token fehlt, faellt damit weiterhin mit einer klaren
 * Meldung aus, statt still Beispielinhalte auszuliefern. Das war das einzige
 * ernsthafte Risiko dieser Sache.
 */
import type { ISbStoryData } from "@storyblok/react/rsc";
import { ARTIKEL, SEITEN } from "./inhalte";

export const FIXTURES_AKTIV = process.env.BLOKWERK_FIXTURES === "1";

type RohStory = {
  name: string;
  slug: string;
  full_slug: string;
  content: Record<string, unknown>;
};

/**
 * Die eine Stelle mit einer Typzusicherung.
 *
 * ISbStoryData beschreibt eine vollstaendige API-Antwort mit rund zwanzig
 * Feldern, von denen dieses Projekt sechs liest. Sie alle auszufuellen wuerde
 * Genauigkeit vortaeuschen, wo Erfundenes steht — deshalb hier einmal
 * zugesichert und nirgends sonst.
 */
function alsStory(roh: RohStory, index: number): ISbStoryData {
  const datum = typeof roh.content.date === "string" ? roh.content.date : "2026-01-01 09:00";
  return {
    id: 1000 + index,
    uuid: `fixture-${roh.slug}`,
    name: roh.name,
    slug: roh.slug,
    full_slug: roh.full_slug,
    content: roh.content,
    created_at: datum,
    published_at: datum,
    first_published_at: datum,
  } as unknown as ISbStoryData;
}

const SEITEN_STORIES = SEITEN.map((seite, index) => alsStory(seite as RohStory, index));

const ARTIKEL_STORIES = ARTIKEL.map((eintrag, index) =>
  alsStory(eintrag as RohStory, 100 + index),
);

/** Wie sort_by: "content.date:desc" beim echten Abruf. */
const ARTIKEL_SORTIERT = [...ARTIKEL_STORIES].sort((a, b) =>
  String((b.content as Record<string, unknown>).date).localeCompare(
    String((a.content as Record<string, unknown>).date),
  ),
);

export function fixtureStory(slug: string): ISbStoryData | null {
  const gesucht = slug.replace(/^\/+|\/+$/g, "");
  return (
    [...SEITEN_STORIES, ...ARTIKEL_STORIES].find((story) => story.full_slug === gesucht) ?? null
  );
}

export function fixtureArtikel(): ISbStoryData[] {
  return ARTIKEL_SORTIERT;
}

/** Entspricht getAllSlugs: ohne `home`, optional auf einen Content-Type gefiltert. */
export function fixtureSlugs(contentType?: string): string[] {
  const quelle =
    contentType === "article"
      ? ARTIKEL_STORIES
      : [...SEITEN_STORIES, ...ARTIKEL_STORIES].filter(
          (story) => !contentType || (story.content as Record<string, unknown>).component === contentType,
        );
  return quelle.map((story) => story.full_slug).filter((slug) => slug !== "home");
}
