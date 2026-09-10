import { StoryblokServerComponent, storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";

/**
 * Der Content-Type `page`. Er hat keine eigene Gestaltung, sondern rendert
 * die Bloks aus dem Feld `body` der Reihe nach. Das ist die Rekursion,
 * die das SDK mitbringt.
 */
export default function Page({ blok }: { blok: SbBlokData }) {
  const body = Array.isArray(blok.body) ? (blok.body as SbBlokData[]) : [];

  return (
    <main {...storyblokEditable(blok)}>
      {body.map((nested) => (
        <StoryblokServerComponent blok={nested} key={String(nested._uid)} />
      ))}
    </main>
  );
}
