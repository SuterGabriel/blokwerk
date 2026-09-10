import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import TextImageView from "@/components/ui/TextImageView";
import { toTextImage } from "@/lib/storyblok/adapters";

export default function TextImage({ blok }: { blok: SbBlokData }) {
  return (
    <div {...storyblokEditable(blok)}>
      <TextImageView {...toTextImage(blok)} />
    </div>
  );
}
