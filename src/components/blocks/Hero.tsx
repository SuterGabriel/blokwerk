import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import HeroView from "@/components/ui/HeroView";
import { toHero } from "@/lib/storyblok/adapters";

/**
 * Block-Komponenten sind absichtlich duenn: uebersetzen, markieren, weitergeben.
 * Die Gestaltung liegt in HeroView und kennt Storyblok nicht.
 */
export default function Hero({ blok }: { blok: SbBlokData }) {
  return (
    <div {...storyblokEditable(blok)}>
      <HeroView {...toHero(blok)} />
    </div>
  );
}
