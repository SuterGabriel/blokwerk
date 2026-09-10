import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/storyblok/fetch";

export const revalidate = 3600;

/**
 * Routen, die es im Code gibt, aber nicht im CMS.
 *
 * Die Sitemap baute sich ausschliesslich aus den Slugs des CMS. Das stimmte,
 * solange jede Seite eine Story war — mit /journal war es still falsch: Die
 * Seite existiert, ist verlinkt, und stand in keiner Sitemap. Ein fehlender
 * Eintrag faellt niemandem auf, er kostet nur Sichtbarkeit.
 *
 * Wer eine weitere Route unter src/app/ anlegt, die keine Story hat, traegt
 * sie hier ein. Automatisch ableiten liesse sich das nicht, ohne das
 * Dateisystem zu durchsuchen und dabei jede dynamische Route falsch zu raten.
 */
const STATISCHE_ROUTEN = ["journal"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const slugs = await getAllSlugs();

  // Sollte im CMS doch einmal eine Story "journal" liegen, gewinnt die Route.
  const alle = [...new Set([...STATISCHE_ROUTEN, ...slugs])];

  return [
    { url: base, lastModified: new Date() },
    ...alle.map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
