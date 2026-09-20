"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useExperience } from "./ExperienceContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ExperienceController() {
  const { setProgress } = useExperience();
  const reduced = useReducedMotion();

  useEffect(() => {
    const main = document.querySelector<HTMLElement>("#main");
    if (!main) return;
    if (reduced) {
      setProgress(0);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: main,
      start: "top top",
      endTrigger: ".stack-section",
      end: "bottom 65%",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        document.documentElement.style.setProperty("--page-progress", String(self.progress));
      },
    });

    const glow = document.querySelector<HTMLElement>(".pointer-glow");
    const onPointer = (event: PointerEvent) => {
      if (!glow || event.pointerType === "touch") return;
      gsap.to(glow, { x: event.clientX, y: event.clientY, duration: 0.7, ease: "power3.out", overwrite: true });
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const magnets = Array.from(document.querySelectorAll<HTMLElement>(".magnetic"));
    const magnetCleanups = magnets.map((item) => {
      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.12;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.12;
        gsap.to(item, { x, y, duration: .35, ease: "power3.out", overwrite: true });
      };
      const onLeave = () => gsap.to(item, { x: 0, y: 0, duration: .55, ease: "elastic.out(1,.45)", overwrite: true });
      item.addEventListener("pointermove", onMove);
      item.addEventListener("pointerleave", onLeave);
      return () => { item.removeEventListener("pointermove", onMove); item.removeEventListener("pointerleave", onLeave); };
    });

    return () => {
      trigger.kill();
      window.removeEventListener("pointermove", onPointer);
      if (glow) gsap.killTweensOf(glow);
      magnets.forEach((item) => gsap.killTweensOf(item));
      magnetCleanups.forEach((cleanup) => cleanup());
      document.documentElement.style.removeProperty("--page-progress");
      setProgress(0);
    };
  }, [reduced, setProgress]);

  return <><div className="pointer-glow" aria-hidden="true" /><div className="page-progress" aria-hidden="true"><i /></div></>;
}