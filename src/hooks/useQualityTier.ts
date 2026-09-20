"use client";

import { useEffect } from "react";
import { useExperience, type QualityTier } from "@/scene/ExperienceContext";
import { useReducedMotion } from "./useReducedMotion";

export function useQualityTier() {
  const { quality, setQuality } = useExperience();
  const reduced = useReducedMotion();

  useEffect(() => {
    const sync = () => {
      if (reduced) { setQuality("low"); return; }
      const width = window.innerWidth;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const cores = navigator.hardwareConcurrency ?? 8;
      let tier: QualityTier = "high";
      if (width < 768 || memory <= 4 || cores <= 4) tier = "low";
      else if (width < 1280 || memory <= 8 || cores <= 6) tier = "medium";
      setQuality(tier);
    };
    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => window.removeEventListener("resize", sync);
  }, [reduced, setQuality]);

  return quality;
}