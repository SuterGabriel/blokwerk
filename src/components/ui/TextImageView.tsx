import SbImage from "./SbImage";
import type { TextImage } from "@/lib/types";

export default function TextImageView({
  eyebrow,
  headline,
  paragraphs,
  image,
  imagePosition,
}: TextImage) {
  const imageFirst = imagePosition === "left";

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
        <div className={imageFirst ? "md:order-2" : undefined}>
          {eyebrow && <p className="mb-4 text-sm text-ink-muted">{eyebrow}</p>}
          <h2 className="font-serif text-3xl leading-tight tracking-tight">{headline}</h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-muted">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className={imageFirst ? "md:order-1" : undefined}>
          {image && (
            <div className="overflow-hidden border border-line">
              <SbImage
                image={image}
                width={720}
                height={520}
                sizes="(max-width: 768px) 100vw, 600px"
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
