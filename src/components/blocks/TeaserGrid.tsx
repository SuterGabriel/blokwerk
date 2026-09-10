import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import TeaserGridView from "@/components/ui/TeaserGridView";
import { toTeaserGrid } from "@/lib/storyblok/adapters";

export default function TeaserGrid({ blok }: { blok: SbBlokData }) {
  return (
    <div {...storyblokEditable(blok)}>
      <TeaserGridView {...toTeaserGrid(blok)} />
    </div>
  );
}
