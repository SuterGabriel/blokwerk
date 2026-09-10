import NextLink from "next/link";
import type { Link } from "@/lib/types";

export default function Button({
  link,
  variant = "primary",
}: {
  link: Link;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center px-5 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const styles =
    variant === "primary"
      ? "bg-accent text-paper hover:bg-accent-hover"
      : "border border-line text-ink hover:border-ink";

  return (
    <NextLink href={link.href} className={`${base} ${styles}`}>
      {link.label}
    </NextLink>
  );
}
