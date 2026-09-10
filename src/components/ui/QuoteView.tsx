import type { Quote } from "@/lib/types";

export default function QuoteView({ text, author, role }: Quote) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <figure className="mx-auto max-w-3xl border-t border-line pt-12">
        <blockquote className="font-serif text-2xl leading-snug tracking-tight sm:text-3xl">
          «{text}»
        </blockquote>
        <figcaption className="mt-6 text-sm text-ink-muted">
          {author}
          {role && <span> · {role}</span>}
        </figcaption>
      </figure>
    </section>
  );
}
