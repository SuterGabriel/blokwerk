import Link from "next/link";
import ArticleGrid from "./ArticleGrid";
import type { TeaserGrid } from "@/lib/types";

/**
 * Der leere Zustand ist kein Sonderfall: Ein Referenzfeld kann jederzeit leer
 * sein, etwa wenn ein Artikel depubliziert wird. Statt einer Luecke im Layout
 * bekommt die Redaktion einen Hinweis, was zu tun ist.
 */
function EmptyState() {
  return (
    <div className="border border-dashed border-line px-6 py-12 text-center">
      <p className="font-serif text-lg">Noch keine Beiträge ausgewählt</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Sobald im CMS Artikel referenziert sind, erscheinen sie an dieser Stelle.
      </p>
      <Link href="/journal" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
        Zum Journal
      </Link>
    </div>
  );
}

export default function TeaserGridView({ headline, moreLink, articles }: TeaserGrid) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {(headline || moreLink) && (
        <div className="mb-8 flex items-baseline justify-between border-b border-line pb-4">
          {headline && <h2 className="font-serif text-2xl tracking-tight">{headline}</h2>}
          {moreLink && (
            <Link href={moreLink.href} className="text-sm text-accent underline underline-offset-4">
              {moreLink.label}
            </Link>
          )}
        </div>
      )}
      {articles.length === 0 ? (
        <EmptyState />
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </section>
  );
}
