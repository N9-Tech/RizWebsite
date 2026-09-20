"use client";
import { capabilities } from "@/content/site";
import SectionLabel from "@/components/ui/SectionLabel";
import { useExperience } from "@/scene/ExperienceContext";
import { Reveal } from "@/components/motion/Reveal";

export default function Capabilities() {
  const { setActiveCapability } = useExperience();
  return (
    <section className="capabilities shell section" id="capabilities">
      <SectionLabel index="01">CAPABILITY MAP</SectionLabel>
      <Reveal className="cap-intro">
        <h2>One engineer.<br/><span>Multiple layers.</span></h2>
        <p>I work across product, backend, automation, infrastructure and AI-assisted development, so fewer ideas get lost between design and delivery.</p>
      </Reveal>
      <div className="cap-list">
        {capabilities.map((item) => (
          <article key={item.id} className="cap-row" tabIndex={0} onMouseEnter={() => setActiveCapability(item.id)} onMouseLeave={() => setActiveCapability(null)} onFocus={() => setActiveCapability(item.id)} onBlur={() => setActiveCapability(null)}>
            <span className="cap-index">{item.index}</span><h3>{item.title}</h3><p>{item.detail}</p><span className="cap-arrow">↗</span>
          </article>
        ))}
      </div>
    </section>
  );
}