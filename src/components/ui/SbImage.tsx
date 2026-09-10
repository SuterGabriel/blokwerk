import NextImage from "next/image";
import type { Image } from "@/lib/types";

/**
 * Duenne Huelle um next/image, die Storybloks Image Service nutzt.
 * Der Pfad /m/<breite>x<hoehe>/ laesst Storyblok skalieren, next/image
 * uebernimmt Layout und Lazy Loading.
 */
export default function SbImage({
  image,
  width,
  height,
  className,
  priority,
  sizes,
}: {
  image: Image;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const src = image.src.includes("a.storyblok.com")
    ? `${image.src}/m/${width}x${height}/filters:format(webp)`
    : image.src;

  return (
    <NextImage
      src={src}
      alt={image.alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
