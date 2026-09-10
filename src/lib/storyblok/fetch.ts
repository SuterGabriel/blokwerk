import type { ISbStoriesParams, ISbStoryData } from "@storyblok/react/rsc";
import { getStoryblokApi, registriereKomponenten } from "./server";
import { RESOLVE_RELATIONS } from "./components";
import { FIXTURES_AKTIV, fixtureArtikel, fixtureSlugs, fixtureStory } from "./fixtures";

type FetchOptions = { preview?: boolean };

function baseParams({ preview = false }: FetchOptions): ISbStoriesParams {
  return {
    version: preview ? "draft" : "published",
    resolve_relations: RESOLVE_RELATIONS,
  };
}

/**
 * Der Fixture-Betrieb haengt an dieser einen Datei.
 *
 * Weiter oben anzusetzen — etwa in den Routen — waere sichtbarer gewesen, haette
 * aber den Adapter uebersprungen. Weiter unten geht nicht: Ab getStoryblokApi
 * gibt es ohne Token nichts mehr. Der Abruf ist die Naht, an der ein Ersatz
 * ueberhaupt Sinn ergibt.
 *
 * storyblokInit registriert normalerweise als Nebenwirkung des Abrufs die
 * Komponenten-Map. Ohne Client muss das hier von Hand geschehen, sonst findet
 * StoryblokStory keine Komponente und rendert nichts.
 */
function fixtureModus(): boolean {
  if (!FIXTURES_AKTIV) return false;
  registriereKomponenten();
  return true;
}

/** Liefert null statt zu werfen, damit die Route mit notFound() antworten kann. */
export async function getStory(
  slug: string,
  options: FetchOptions = {},
): Promise<ISbStoryData | null> {
  if (fixtureModus()) return fixtureStory(slug);

  try {
    const client = getStoryblokApi(options.preview);
    const response = await client.getStory(slug, baseParams(options));
    return response.data.story;
  } catch {
    return null;
  }
}

export async function getArticles(options: FetchOptions = {}): Promise<ISbStoryData[]> {
  if (fixtureModus()) return fixtureArtikel();

  const client = getStoryblokApi(options.preview);
  const response = await client.getStories({
    ...baseParams(options),
    content_type: "article",
    sort_by: "content.date:desc",
    per_page: 50,
  });
  return response.data.stories;
}

/** Alle Slugs, die statisch vorgebaut werden sollen. Nur veroeffentlichte Inhalte. */
export async function getAllSlugs(contentType?: string): Promise<string[]> {
  if (fixtureModus()) return fixtureSlugs(contentType);

  const client = getStoryblokApi(false);
  const response = await client.getStories({
    version: "published",
    ...(contentType ? { content_type: contentType } : {}),
    excluding_slugs: "home",
    per_page: 100,
  });
  return response.data.stories.map((story) => story.full_slug);
}
