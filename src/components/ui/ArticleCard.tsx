import Link from "next/link";
import SbImage from "./SbImage";
import Meta, { formatDate } from "./Meta";
import type { ArticleTeaser } from "@/lib/types";

export default function ArticleCard({ article }: { article: ArticleTeaser }) {
  return (
    // relative gehoert an die Karte, nicht an einen Wrapper: Der Link unten
    // spannt sich per absolute ueber die ganze Flaeche und braucht diesen
    // Bezugspunkt. Ohne ihn springt er an den naechsten positionierten Vorfahren.
    <article className="group relative border border-line bg-paper transition-colors hover:border-ink">
      {article.image && (
        <SbImage
          image={article.image}
          width={600}
          height={340}
          sizes="(max-width: 768px) 100vw, 380px"
          className="h-44 w-full object-cover"
        />
      )}
      <div className="p-6">
        <p className="text-sm text-ink-muted">{formatDate(article.date)}</p>
        <h3 className="mt-3 font-serif text-xl leading-snug tracking-tight">
          <Link
            href={`/artikel/${article.slug}`}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {article.title}
          </Link>
        </h3>
        {article.teaser && (
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{article.teaser}</p>
        )}
        <div className="mt-5 border-t border-line pt-4">
          <Meta
            items={[
              article.author,
              article.readingMinutes ? `${article.readingMinutes} Min.` : undefined,
            ]}
          />
        </div>
      </div>
    </article>
  );
}
