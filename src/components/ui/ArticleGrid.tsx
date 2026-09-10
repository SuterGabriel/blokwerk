import ArticleCard from "./ArticleCard";
import type { ArticleTeaser } from "@/lib/types";

/**
 * Das Raster, in dem Artikelkarten stehen — im Teaser-Grid, unter einem Artikel
 * und auf der Journal-Uebersicht.
 *
 * Vorher stand dieselbe Rasterdefinition an drei Stellen. Das faellt nicht auf,
 * bis jemand den Abstand an zweien davon aendert.
 */
export default function ArticleGrid({
  articles,
  columns = 3,
}: {
  articles: ArticleTeaser[];
  columns?: 2 | 3;
}) {
  return (
    <div
      className={`grid gap-6 sm:grid-cols-2${columns === 3 ? " lg:grid-cols-3" : ""}`}
    >
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
