import { StoryblokServerRichText, storyblokEditable } from "@storyblok/react/rsc";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SbImage from "@/components/ui/SbImage";
import Meta, { formatDate } from "@/components/ui/Meta";
import ArticleCard from "@/components/ui/ArticleCard";
import { getAllSlugs, getArticles, getStory } from "@/lib/storyblok/fetch";
import { toArticle, toArticleTeaser } from "@/lib/storyblok/adapters";
import type { ArticleTeaser } from "@/lib/types";

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllSlugs("article");
  return slugs.map((slug) => ({ slug: slug.replace(/^artikel\//, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(`artikel/${slug}`);
  if (!story) return {};

  const article = toArticle(story);
  return {
    title: article.title,
    description: article.teaser,
    openGraph: {
      title: article.title,
      description: article.teaser,
      type: "article",
      publishedTime: article.date,
      images: article.image ? [{ url: `${article.image.src}/m/1200x630/` }] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStory(`artikel/${slug}`);
  if (!story) notFound();

  const article = toArticle(story);

  const related: ArticleTeaser[] = (await getArticles())
    .map(toArticleTeaser)
    .filter((a): a is ArticleTeaser => a !== null && a.slug !== article.slug)
    .slice(0, 2);

  return (
    <article {...storyblokEditable(story.content)}>
      <header className="mx-auto max-w-3xl px-6 pt-16">
        <Meta items={[formatDate(article.date), article.author, article.topic]} />
        <h1 className="mt-5 font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl">
          {article.title}
        </h1>
        {article.teaser && (
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">{article.teaser}</p>
        )}
      </header>

      {article.image && (
        <figure className="mx-auto mt-12 max-w-4xl px-6">
          <div className="overflow-hidden border border-line">
            <SbImage
              image={article.image}
              width={1280}
              height={720}
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="h-auto w-full object-cover"
            />
          </div>
          {article.imageCaption && (
            <figcaption className="mt-3 text-sm text-ink-muted">{article.imageCaption}</figcaption>
          )}
        </figure>
      )}

      <div className="prose-blokwerk mx-auto mt-14 max-w-2xl px-6 text-base">
        <StoryblokServerRichText document={article.body} />
      </div>

      {article.authorBio && (
        <aside className="mx-auto mt-16 max-w-2xl border-t border-line px-6 pt-6">
          <p className="text-sm leading-relaxed text-ink-muted">{article.authorBio}</p>
        </aside>
      )}

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <h2 className="border-b border-line pb-4 font-serif text-2xl tracking-tight">
            Weiterlesen
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <div key={item.slug} className="relative">
                <ArticleCard article={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
