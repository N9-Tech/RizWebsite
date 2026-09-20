"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0, y: 24, filter: "blur(6px)" }, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true }
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);
  return <div ref={ref} className={className}>{children}</div>;
}