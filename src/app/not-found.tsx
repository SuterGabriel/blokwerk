import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-32">
      <h1 className="font-serif text-4xl tracking-tight">Diese Seite gibt es nicht</h1>
      <p className="mt-4 text-ink-muted">
        Der Link ist veraltet, oder die Seite wurde im CMS depubliziert.
      </p>
      <Link href="/" className="mt-8 inline-block text-accent underline underline-offset-4">
        Zur Startseite
      </Link>
    </main>
  );
}
