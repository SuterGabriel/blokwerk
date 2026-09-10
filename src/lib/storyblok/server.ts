import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import UnknownBlock from "@/components/blocks/UnknownBlock";
import { components } from "./components";

/**
 * Zwei Token, zwei Zustaende.
 *
 * preview === false ist der Normalfall und kann technisch keine Entwuerfe
 * ausliefern, weil der Public Token sie gar nicht erst herausgibt. Das ist
 * belastbarer als eine Bedingung im Code, die man vergessen kann.
 */
export const getStoryblokApi = (preview = false) => {
  const accessToken = preview
    ? process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN
    : process.env.STORYBLOK_PUBLIC_TOKEN;

  if (!accessToken) {
    throw new Error(
      `Kein Storyblok-Token gesetzt (${preview ? "NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN" : "STORYBLOK_PUBLIC_TOKEN"}). Siehe .env.example.`,
    );
  }

  return storyblokInit({
    accessToken,
    use: [apiPlugin],
    apiOptions: { region: "eu" },
    components,
    enableFallbackComponent: true,
    customFallbackComponent: UnknownBlock,
  })();
};
