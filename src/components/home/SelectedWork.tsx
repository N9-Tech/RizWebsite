"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { projects } from "@/content/projects";
import SectionLabel from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/motion/Reveal";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function SelectedWork() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project-item").forEach((item) => {
        const visual = item.querySelector<HTMLElement>(".project-visual");
        const image = item.querySelector<HTMLElement>("img");
        if (!visual || !image) return;

        gsap.fromTo(visual,
          { clipPath: "inset(8% 0 8% 0 round 3px)" },
          { clipPath: "inset(0% 0 0% 0 round 3px)", ease: "none", scrollTrigger: { trigger: item, start: "top 92%", end: "top 38%", scrub: 0.7 } }
        );
        gsap.fromTo(image,
          { scale: 1.08, yPercent: -2 },
          { scale: 1.015, yPercent: 2, ease: "none", scrollTrigger: { trigger: visual, start: "top bottom", end: "bottom top", scrub: 0.8 } }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="work-section shell section" id="work" ref={ref}>
      <SectionLabel index="02">SELECTED WORK</SectionLabel>
      <Reveal className="work-heading"><h2>Systems I&apos;ve built,<br/><span>automated or taken further.</span></h2></Reveal>
      <div className="project-reel">
        {projects.slice(0,4).map((project, i) => (
          <Link href={`/work/${project.slug}`} className={`project-item project-${i+1}`} key={project.slug}>
            <div className="project-visual"><Image src={project.visual} alt={`${project.title} abstract interface preview`} fill sizes="(max-width: 768px) 100vw, 85vw" /></div>
            <div className="project-meta"><span>0{i+1}</span><div><h3>{project.title}</h3><p>{project.summary}</p></div><div className="project-tags">{project.categories.join(" / ")}<b>↗</b></div></div>
          </Link>
        ))}
      </div>
    </section>
  );
}