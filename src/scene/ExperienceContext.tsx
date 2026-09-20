"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type ScenePhase = "hero" | "open" | "inspect" | "build" | "stack" | "resolve";
export type QualityTier = "high" | "medium" | "low" | "fallback";

interface ExperienceState {
  progressRef: { current: number };
  setProgress: (value: number) => void;
  phase: ScenePhase;
  activeCapability: string | null;
  setActiveCapability: (value: string | null) => void;
  quality: QualityTier;
  setQuality: (value: QualityTier) => void;
}

const ExperienceContext = createContext<ExperienceState | null>(null);

function progressToPhase(progress: number): ScenePhase {
  if (progress < 0.14) return "hero";
  if (progress < 0.31) return "open";
  if (progress < 0.49) return "inspect";
  if (progress < 0.68) return "build";
  if (progress < 0.86) return "stack";
  return "resolve";
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const progressRef = useRef(0);
  const [phase, setPhase] = useState<ScenePhase>("hero");
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityTier>("medium");

  const setProgress = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value));
    progressRef.current = next;
    const nextPhase = progressToPhase(next);
    setPhase((current) => current === nextPhase ? current : nextPhase);
  }, []);

  const value = useMemo(() => ({
    progressRef,
    setProgress,
    phase,
    activeCapability,
    setActiveCapability,
    quality,
    setQuality,
  }), [setProgress, phase, activeCapability, quality]);

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error("useExperience must be used within ExperienceProvider");
  return value;
}