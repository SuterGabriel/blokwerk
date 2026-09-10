"use client";

import { useEffect } from "react";
import { initStoryblokClient } from "@/lib/storyblok/client";

/**
 * Initialisiert die Storyblok Bridge, aber nur innerhalb des Visual Editors.
 *
 * Die Pruefung laeuft in useEffect, weil window beim Rendern auf dem Server
 * nicht existiert. Storyblok laedt die Seite in einem iframe und haengt den
 * Parameter _storyblok an — beides zusammen ist das Erkennungsmerkmal.
 *
 * Die Komponente haelt bewusst keinen Zustand. Ob die Bridge geladen ist,
 * aendert an der Ausgabe nichts: Gerendert werden immer die Kinder. Ein
 * setState im Effekt loeste nur eine zweite Renderrunde ohne Wirkung aus.
 */
export default function StoryblokProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const inVisualEditor =
      window.self !== window.top && window.location.search.includes("_storyblok");
    if (inVisualEditor) initStoryblokClient();
  }, []);

  return <>{children}</>;
}
