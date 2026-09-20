"use client";
import { useEffect, useRef } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const stages = [
  ["01", "PLAN", "requirements.md\narchitecture.md"],
  ["02", "AGENT", "task queued\ncontext loaded"],
  ["03", "IMPLEMENT", "+ service layer\n+ validation\n+ retry policy"],
  ["04", "REVIEW", "trace input → output\ncheck edge cases\ninspect async paths"],
  ["05", "TEST", "unit       42 passed\nintegration  9 passed\ne2e          6 passed"],
  ["06", "SHIP", "production / healthy\nrelease gate / passed"]
];

export default function AIWorkflow() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".workflow-packet", { xPercent: 0 }, { xPercent: 520, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 65%", end: "bottom 55%", scrub: .5 } });
      gsap.from(".workflow-stage", { opacity: .35, stagger: .08, scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 60%", scrub: .4 } });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);
  return (
    <section className="workflow section" id="process" ref={ref}>
      <div className="shell"><SectionLabel index="03">AI-ASSISTED DEVELOPMENT</SectionLabel>
        <div className="workflow-head"><h2>AI in the loop.<br/><span>Engineering in control.</span></h2><p>I use coding agents to accelerate research, implementation and iteration. Architecture, verification, testing and final technical decisions stay deliberate.</p></div>
      </div>
      <div className="workflow-track-wrap">
        <div className="workflow-track shell">
          <div className="workflow-line"/><div className="workflow-packet" aria-hidden="true"><i/></div>
          {stages.map(([n,t,a]) => <article className="workflow-stage" key={n}><span>{n}</span><h3>{t}</h3><pre>{a}</pre></article>)}
        </div>
      </div>
    </section>
  );
}