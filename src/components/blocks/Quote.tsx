import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import QuoteView from "@/components/ui/QuoteView";
import { toQuote } from "@/lib/storyblok/adapters";

export default function Quote({ blok }: { blok: SbBlokData }) {
  return (
    <div {...storyblokEditable(blok)}>
      <QuoteView {...toQuote(blok)} />
    </div>
  );
}
