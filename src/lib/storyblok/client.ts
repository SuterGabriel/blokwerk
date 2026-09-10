"use client";

import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";

/**
 * Clientseitige Initialisierung, ausschliesslich fuer die Storyblok Bridge.
 * Komponenten werden hier nicht registriert — das Rendern bleibt auf dem Server.
 */
export const initStoryblokClient = () => {
  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN,
    use: [apiPlugin],
    apiOptions: { region: "eu" },
    enableFallbackComponent: true,
  });
};
