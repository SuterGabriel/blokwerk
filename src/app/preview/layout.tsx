import { draftMode } from "next/headers";
import StoryblokProvider from "@/components/StoryblokProvider";
import DraftToolbar from "@/components/DraftToolbar";

/**
 * Alles unterhalb von /preview laeuft im Draft Mode und mit dem Preview-Token.
 *
 * Die Trennung als eigene Route statt als Bedingung im Fetch ist Absicht:
 * die oeffentlichen Routen benutzen einen Token, der Entwuerfe gar nicht
 * herausgibt. Ein Leck ist damit nicht durch Vergessen moeglich.
 */
export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  const draft = await draftMode();
  draft.enable();

  return (
    <StoryblokProvider>
      <DraftToolbar />
      {children}
    </StoryblokProvider>
  );
}
