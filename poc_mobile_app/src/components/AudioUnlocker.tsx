"use client";

import { useEffect } from "react";
import { ensureAudioUnlocked } from "@/lib/sound";

// Browsers require a real user gesture before audio can play. This mounts
// once and unlocks the shared AudioContext on the very first tap/click
// anywhere in the app, so every later sound effect (even after a client-side
// route change) just works without hunting down every trigger point.
export function AudioUnlocker() {
  useEffect(() => {
    const unlock = () => {
      ensureAudioUnlocked();
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  return null;
}
