import { StoryblokStory } from "@storyblok/react/rsc";
import { notFound } from "next/navigation";
import { getStory } from "@/lib/storyblok/fetch";

/** Vorschau wird nie zwischengespeichert, sonst sieht der Editor alte Staende. */
export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug?.length ? slug.join("/") : "home", { preview: true });
  if (!story) notFound();

  return <StoryblokStory story={story} />;
}
