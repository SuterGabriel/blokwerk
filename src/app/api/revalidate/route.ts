import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Ziel des Storyblok-Webhooks.
 *
 * Storyblok schickt bei Veroeffentlichung unter anderem den full_slug der
 * betroffenen Story. Damit wird gezielt eine Seite neu gebaut statt der
 * gesamten Site — und die Aenderung ist in Sekunden live, nicht nach Ablauf
 * des revalidate-Intervalls.
 *
 * Einrichtung in Storyblok: Settings -> Webhooks -> Story published/unpublished
 * URL: https://<domain>/api/revalidate?secret=<STORYBLOK_WEBHOOK_SECRET>
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");

  if (!process.env.STORYBLOK_WEBHOOK_SECRET || secret !== process.env.STORYBLOK_WEBHOOK_SECRET) {
    return NextResponse.json({ revalidated: false, reason: "unauthorized" }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const payload = (await request.json()) as { full_slug?: string; story_id?: number };
    slug = payload.full_slug;
  } catch {
    // Kein oder ungueltiger Body: unten wird auf die Startseite zurueckgefallen.
  }

  const paths = ["/"];
  if (slug && slug !== "home") {
    paths.push(slug.startsWith("artikel/") ? `/artikel/${slug.replace(/^artikel\//, "")}` : `/${slug}`);
  }

  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, paths, at: Date.now() });
}
