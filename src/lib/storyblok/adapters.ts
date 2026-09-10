/**
 * Die einzige Stelle, an der Storyblok-Feldnamen vorkommen.
 *
 * Jeder Adapter nimmt ein rohes Blok-Objekt und gibt einen Typ aus lib/types.ts
 * zurueck. Fehlende Felder werden hier abgefangen, nicht in den Komponenten:
 * ein leeres Asset-Feld liefert in Storyblok ein Objekt mit filename === null,
 * was ungeprueft als leerer src im DOM landen wuerde.
 */
import type { ISbStoryData, SbBlokData } from "@storyblok/react/rsc";
import type {
  Article,
  ArticleTeaser,
  Hero,
  Image,
  Link,
  Quote,
  RichTextDocument,
  TextImage,
  TeaserGrid,
} from "@/lib/types";

type SbAsset = { filename?: string | null; alt?: string | null } | null | undefined;
type SbLink = { cached_url?: string; url?: string; linktype?: string } | null | undefined;

function toImage(asset: SbAsset, fallbackAlt = ""): Image | undefined {
  if (!asset?.filename) return undefined;
  return { src: asset.filename, alt: asset.alt || fallbackAlt };
}

function toLink(link: SbLink, label?: string): Link | undefined {
  if (!label) return undefined;
  const raw = link?.url || link?.cached_url || "";
  if (!raw) return undefined;
  const href = link?.linktype === "story" && !raw.startsWith("/") ? `/${raw}` : raw;
  return { href, label };
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Storyblok liefert Textarea-Inhalte als einen String mit Zeilenumbruechen. */
function toParagraphs(value: unknown): string[] {
  return str(value)
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toHero(blok: SbBlokData): Hero {
  return {
    eyebrow: str(blok.eyebrow) || undefined,
    headline: str(blok.headline),
    intro: str(blok.intro) || undefined,
    primaryAction: toLink(blok.primary_link as SbLink, str(blok.primary_label) || undefined),
    secondaryAction: toLink(blok.secondary_link as SbLink, str(blok.secondary_label) || undefined),
    image: toImage(blok.image as SbAsset, str(blok.headline)),
  };
}

export function toTextImage(blok: SbBlokData): TextImage {
  return {
    eyebrow: str(blok.eyebrow) || undefined,
    headline: str(blok.headline),
    paragraphs: toParagraphs(blok.text),
    image: toImage(blok.image as SbAsset, str(blok.headline)),
    imagePosition: blok.image_position === "left" ? "left" : "right",
  };
}

export function toQuote(blok: SbBlokData): Quote {
  return {
    text: str(blok.text),
    author: str(blok.author),
    role: str(blok.role) || undefined,
  };
}

/**
 * Wandelt eine Artikel-Story in einen Teaser.
 *
 * Ist resolve_relations nicht gesetzt, liefert Storyblok statt der Story nur
 * deren UUID als String. Dann gibt es hier nichts zu rendern, und der Aufrufer
 * filtert das Ergebnis heraus.
 */
export function toArticleTeaser(story: ISbStoryData | string): ArticleTeaser | null {
  if (typeof story === "string" || !story?.content) return null;
  const c = story.content as SbBlokData;
  return {
    slug: story.full_slug.replace(/^artikel\//, ""),
    title: str(c.title) || story.name,
    teaser: str(c.teaser),
    date: str(c.date) || story.first_published_at || "",
    author: str(c.author) || undefined,
    readingMinutes: Number(c.reading_minutes) || undefined,
    image: toImage(c.image as SbAsset, str(c.title) || story.name),
  };
}

export function toTeaserGrid(blok: SbBlokData): TeaserGrid {
  const raw = Array.isArray(blok.articles) ? blok.articles : [];
  return {
    headline: str(blok.headline) || undefined,
    moreLink: toLink(blok.more_link as SbLink, str(blok.more_label) || undefined),
    articles: raw
      .map((entry) => toArticleTeaser(entry as ISbStoryData | string))
      .filter((a): a is ArticleTeaser => a !== null),
  };
}

export function toArticle(story: ISbStoryData): Article {
  const teaser = toArticleTeaser(story);
  const c = story.content as SbBlokData;
  return {
    ...(teaser ?? {
      slug: story.full_slug,
      title: story.name,
      teaser: "",
      date: story.first_published_at || "",
    }),
    topic: str(c.topic) || undefined,
    imageCaption: str(c.image_caption) || undefined,
    authorBio: str(c.author_bio) || undefined,
    body: c.body as RichTextDocument,
  };
}
