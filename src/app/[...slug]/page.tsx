import { StoryblokStory } from "@storyblok/react/rsc";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, getStory } from "@/lib/storyblok/fetch";

export const revalidate = 3600;

/** Unbekannte Slugs sollen 404 liefern, nicht zur Laufzeit nachgebaut werden. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs
    .filter((slug) => !slug.startsWith("artikel/"))
    .map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug.join("/"));
  if (!story) return {};

  const content = story.content as Record<string, unknown>;
  return {
    title: (content.seo_title as string) || story.name,
    description: (content.seo_description as string) || undefined,
  };
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug.join("/"));
  if (!story) notFound();

  return <StoryblokStory story={story} />;
}
