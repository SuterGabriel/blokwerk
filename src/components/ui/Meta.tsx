const dateFormat = new Intl.DateTimeFormat("de-CH", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(value: string): string {
  if (!value) return "";
  const parsed = new Date(value.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? "" : dateFormat.format(parsed);
}

/** Datum, Autor, Thema — die Metazeile aus der Komponentenuebersicht. */
export default function Meta({ items }: { items: (string | undefined)[] }) {
  const parts = items.filter(Boolean) as string[];
  if (parts.length === 0) return null;

  return (
    <p className="text-sm text-ink-muted">
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          {part}
        </span>
      ))}
    </p>
  );
}
