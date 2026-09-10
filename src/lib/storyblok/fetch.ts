import type { ISbStoriesParams, ISbStoryData } from "@storyblok/react/rsc";
import { getStoryblokApi } from "./server";
import { RESOLVE_RELATIONS } from "./components";

type FetchOptions = { preview?: boolean };

function baseParams({ preview = false }: FetchOptions): ISbStoriesParams {
  return {
    version: preview ? "draft" : "published",
    resolve_relations: RESOLVE_RELATIONS,
  };
}

/** Liefert null statt zu werfen, damit die Route mit notFound() antworten kann. */
export async function getStory(
  slug: string,
  options: FetchOptions = {},
): Promise<ISbStoryData | null> {
  try {
    const client = getStoryblokApi(options.preview);
    const response = await client.getStory(slug, baseParams(options));
    return response.data.story;
  } catch {
    return null;
  }
}

export async function getArticles(options: FetchOptions = {}): Promise<ISbStoryData[]> {
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
  const client = getStoryblokApi(false);
  const response = await client.getStories({
    version: "published",
    ...(contentType ? { content_type: contentType } : {}),
    excluding_slugs: "home",
    per_page: 100,
  });
  return response.data.stories.map((story) => story.full_slug);
}
