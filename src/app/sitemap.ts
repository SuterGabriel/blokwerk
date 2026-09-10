import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/storyblok/fetch";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const slugs = await getAllSlugs();

  return [
    { url: base, lastModified: new Date() },
    ...slugs.map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
