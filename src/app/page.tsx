import { StoryblokStory } from "@storyblok/react/rsc";
import { notFound } from "next/navigation";
import { getStory } from "@/lib/storyblok/fetch";

/** Zeitbasierte Revalidierung als Netz. Der Webhook ist der Normalfall. */
export const revalidate = 3600;

export default async function HomePage() {
  const story = await getStory("home");
  if (!story) notFound();

  return <StoryblokStory story={story} />;
}
