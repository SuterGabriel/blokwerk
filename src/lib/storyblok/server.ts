import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import UnknownBlock from "@/components/blocks/UnknownBlock";
import { components } from "./components";

/**
 * Ein Aufruf von storyblokInit tut zwei Dinge: Er baut den API-Client, und er
 * registriert die Komponenten-Map samt Fallback. Das zweite braucht auch der
 * Fixture-Betrieb, in dem es keinen Client gibt — deshalb steht es hier
 * getrennt statt als Nebenwirkung des Abrufs.
 */
function init(accessToken: string) {
  return storyblokInit({
    accessToken,
    // Ohne Token kein apiPlugin: Es meldet sonst bei jedem Aufruf, dass ein
    // Zugriffstoken fehle — richtig, aber im Fixture-Betrieb kein Befund.
    // Fuenfzehn solcher Zeilen in einem gruenen Build gewoehnen einem an,
    // ueber Warnungen hinwegzulesen.
    ...(accessToken ? { use: [apiPlugin], apiOptions: { region: "eu" as const } } : {}),
    components,
    enableFallbackComponent: true,
    customFallbackComponent: UnknownBlock,
  })();
}

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

  return init(accessToken);
};

/**
 * Fixture-Betrieb: kein Token, kein Client, aber die Bloks muessen gerendert
 * werden koennen. Registriert nur die Komponenten-Map.
 */
export const registriereKomponenten = () => {
  init("");
};
