import Button from "./Button";
import SbImage from "./SbImage";
import type { Hero } from "@/lib/types";

export default function HeroView({ eyebrow, headline, intro, primaryAction, secondaryAction, image }: Hero) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
      {eyebrow && <p className="mb-6 text-sm text-ink-muted">{eyebrow}</p>}
      <h1 className="max-w-3xl font-serif text-4xl leading-[1.15] tracking-tight sm:text-6xl">
        {headline}
      </h1>
      {intro && (
        <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-muted">{intro}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-9 flex flex-wrap gap-3">
          {primaryAction && <Button link={primaryAction} />}
          {secondaryAction && <Button link={secondaryAction} variant="secondary" />}
        </div>
      )}
      {image && (
        <div className="mt-14 overflow-hidden border border-line">
          <SbImage
            image={image}
            width={1200}
            height={600}
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="h-auto w-full object-cover"
          />
        </div>
      )}
    </section>
  );
}
