/**
 * Die Typen, in denen das Frontend denkt.
 *
 * Bewusst kein Wert-Import aus @storyblok/react: Was hier steht, beschreibt
 * Blokwerk, nicht Storyblok. Die Uebersetzung passiert einmalig in
 * lib/storyblok/adapters.ts. Ein Wechsel des CMS beruehrt diese Datei nicht.
 *
 * Eine Ausnahme, siehe RichTextDocument.
 */
import type { StoryblokRichTextInput } from "@storyblok/react/rsc";

/**
 * Rich Text ist die Grenze der Entkopplung.
 *
 * Ein Rich-Text-Dokument ist ein verschachtelter Baum im Format des jeweiligen
 * CMS — Storyblok, Sanitys Portable Text und Contentful sind untereinander
 * nicht kompatibel. Eine eigene Zwischendarstellung waere ein zweiter Renderer
 * und stuende in keinem Verhaeltnis zum Nutzen.
 *
 * Der Typ ist deshalb hier benannt statt versteckt: Wer das CMS wechselt,
 * sieht an diesem Alias, was zu ersetzen ist. Es ist ein reiner Typ-Import,
 * der beim Bauen verschwindet.
 */
export type RichTextDocument = StoryblokRichTextInput;

export type Image = {
  src: string;
  alt: string;
};

export type Link = {
  href: string;
  label: string;
};

export type Hero = {
  eyebrow?: string;
  headline: string;
  intro?: string;
  primaryAction?: Link;
  secondaryAction?: Link;
  image?: Image;
};

export type TextImage = {
  eyebrow?: string;
  headline: string;
  paragraphs: string[];
  image?: Image;
  imagePosition: "left" | "right";
};

export type Quote = {
  text: string;
  author: string;
  role?: string;
};

export type ArticleTeaser = {
  slug: string;
  title: string;
  teaser: string;
  date: string;
  author?: string;
  readingMinutes?: number;
  image?: Image;
};

export type TeaserGrid = {
  headline?: string;
  moreLink?: Link;
  articles: ArticleTeaser[];
};

export type Article = ArticleTeaser & {
  topic?: string;
  imageCaption?: string;
  authorBio?: string;
  /** Siehe RichTextDocument: die bewusste Ausnahme von der Entkopplung. */
  body: RichTextDocument;
};
