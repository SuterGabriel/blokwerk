import { StoryblokStory } from "@storyblok/react/rsc";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStory } from "@/lib/storyblok/fetch";

/** Zeitbasierte Revalidierung als Netz. Der Webhook ist der Normalfall. */
export const revalidate = 3600;

/**
 * Die Startseite hatte als einzige Route keine eigenen Metadaten.
 *
 * Aufgefallen ist es erst am Deployment: Der Titel kam aus dem Layout, die
 * Felder seo_title und seo_description der Story blieben ungenutzt, und beim
 * Teilen der Startseite gab es keine Open-Graph-Angaben — ausgerechnet auf der
 * Seite, die am ehesten verschickt wird.
 */
export async function generateMetadata(): Promise<Metadata> {
  const story = await getStory("home");
  if (!story) return {};

  const content = story.content as Record<string, unknown>;
  const title = (content.seo_title as string) || story.name;
  const description = (content.seo_description as string) || undefined;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function HomePage() {
  const story = await getStory("home");
  if (!story) notFound();

  return <StoryblokStory story={story} />;
}
