import type { Metadata } from "next";
import ArticleGrid from "@/components/ui/ArticleGrid";
import { getArticles } from "@/lib/storyblok/fetch";
import { toArticleTeaser } from "@/lib/storyblok/adapters";
import type { ArticleTeaser } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Beiträge aus dem Studio: Inhaltsmodelle, Design-Tokens, Barrierefreiheit und was ein Seitenbudget an Gestaltung übrig lässt.",
};

/**
 * Die Uebersicht aller Artikel.
 *
 * Sie ist bewusst keine Story im CMS: Eine Liste, die alles enthaelt, darf
 * nicht von Hand gepflegt werden — sonst fehlt der naechste Artikel darin.
 * Das teaser_grid auf der Startseite ist der Gegenfall, dort waehlt die
 * Redaktion aus. Begruendung in DECISIONS.md, Punkt 10.
 */
export default async function JournalPage() {
  const articles: ArticleTeaser[] = (await getArticles())
    .map(toArticleTeaser)
    .filter((article): article is ArticleTeaser => article !== null);

  return (
    <main className="mx-auto max-w-6xl px-6 pt-16 pb-8">
      <header className="border-b border-line pb-8">
        <p className="text-sm text-ink-muted">Journal</p>
        <h1 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl">
          Was wir unterwegs aufschreiben
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
          Notizen aus laufenden Projekten. Meist geht es um Inhaltsmodelle, um
          Entscheidungen, die früh fallen, und um das, was danach billiger wird.
        </p>
      </header>

      <div className="mt-10">
        {articles.length === 0 ? (
          <p className="border border-dashed border-line px-6 py-12 text-center text-sm leading-relaxed text-ink-muted">
            Es sind noch keine Beiträge veröffentlicht. Sobald im CMS ein
            Artikel erscheint, steht er hier.
          </p>
        ) : (
          <ArticleGrid articles={articles} />
        )}
      </div>

      {articles.length > 0 && (
        <p className="mt-10 text-sm text-ink-muted">
          {articles.length === 1 ? "Ein Beitrag" : `${articles.length} Beiträge`}
        </p>
      )}
    </main>
  );
}
