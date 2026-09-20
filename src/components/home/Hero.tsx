"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowDownRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useExperience } from "@/scene/ExperienceContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { phase } = useExperience();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.set(".hero-line > span", { yPercent: 112, rotateX: -14, opacity: 0 });
      gsap.set([".hero-intro", ".hero-actions", ".hero-meta", ".hero-scroll-hint", ".scene-status"], { opacity: 0, y: 14 });

      gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.08 })
        .to(".hero-line > span", { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.15, stagger: 0.11 })
        .to(".hero-intro", { opacity: 1, y: 0, duration: 0.72 }, "-=.72")
        .to(".hero-actions", { opacity: 1, y: 0, duration: 0.62 }, "-=.52")
        .to([".hero-meta", ".hero-scroll-hint", ".scene-status"], { opacity: 1, y: 0, duration: 0.55, stagger: 0.05 }, "-=.5");

      gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=145%",
          scrub: 0.65,
          pin: true,
          invalidateOnRefresh: true,
        },
      })
        .to(".hero-copy", { yPercent: -14, opacity: 0.12, scale: 0.975, ease: "none" }, 0.5)
        .to(".hero-meta", { opacity: 0.15, ease: "none" }, 0.48)
        .to(".hero-scroll-hint", { opacity: 0, x: 14, ease: "none" }, 0.24)
        .to(".hero-orbit-label", { yPercent: -35, opacity: 0, ease: "none" }, 0.35);
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="hero shell" ref={ref} id="top">
      <div className="hero-meta">
        <span>SOFTWARE ENGINEER</span><span>AI-ASSISTED DEVELOPMENT</span><span>MANCHESTER / UK</span>
      </div>
      <div className="hero-copy">
        <p className="eyebrow"><i /> BUILD SYSTEM / {phase.toUpperCase()}</p>
        <h1 aria-label="Software that ships.">
          <span className="hero-line"><span>Software</span></span>
          <span className="hero-line"><span><em>that ships.</em></span></span>
        </h1>
        <p className="hero-intro">Products, automation, infrastructure and intelligent workflows — engineered from prototype to production.</p>
        <div className="hero-actions">
          <a className="button button-primary magnetic" href="#work">Explore my work <ArrowDownRight size={16}/></a>
          <Link className="button button-ghost magnetic" href="/contact">Start a project</Link>
        </div>
      </div>
      <div className="hero-orbit-label" aria-hidden="true"><span>BUILD ENGINE</span><b>LIVE</b></div>
      <div className="hero-scroll-hint"><span>SCROLL TO INSPECT</span><span className="scroll-line" /></div>
      <div className="scene-status" aria-hidden="true"><span>CORE / 01</span><span>STATE / {phase.toUpperCase()}</span></div>
    </section>
  );
}