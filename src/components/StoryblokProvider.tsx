"use client";

import { useEffect, useState } from "react";
import { initStoryblokClient } from "@/lib/storyblok/client";

/**
 * Initialisiert die Storyblok Bridge, aber nur innerhalb des Visual Editors.
 *
 * Die Pruefung laeuft in useEffect, weil window beim Rendern auf dem Server
 * nicht existiert. Storyblok laedt die Seite in einem iframe und haengt den
 * Parameter _storyblok an — beides zusammen ist das Erkennungsmerkmal.
 */
export default function StoryblokProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const inVisualEditor =
      window.self !== window.top && window.location.search.includes("_storyblok");
    if (inVisualEditor) initStoryblokClient();
    setReady(true);
  }, []);

  void ready;
  return <>{children}</>;
}
