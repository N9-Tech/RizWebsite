"use client";
import { useState } from "react";
import { stackLayers } from "@/content/site";
import SectionLabel from "@/components/ui/SectionLabel";
export default function StackLayers() {
  const [active, setActive] = useState(0);
  return (
    <section className="stack-section shell section">
      <SectionLabel index="04">SYSTEM LAYERS</SectionLabel>
      <div className="stack-grid">
        <div><h2>Built across<br/><span>the stack.</span></h2><p>From interface logic to deployment and infrastructure.</p></div>
        <div className="stack-planes" aria-label="Technology layers">
          {stackLayers.map((item, i) => <button key={item.layer} className={`stack-plane ${active===i ? "active" : ""}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}><span>{String(i+1).padStart(2,"0")}</span><strong>{item.layer}</strong><em>{item.tech.join("  ·  ")}</em></button>)}
        </div>
      </div>
    </section>
  );
}