"use client";
import { useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
const scenarios = {
  "BUILD A PRODUCT": ["> project:init", "analysing requirements...", "architecture selected", "tasks decomposed", "implementation running", "", "✓ validation", "✓ error paths", "✓ async flow", "✓ deployment config", "", "status: ready to ship"],
  "AUTOMATE A WORKFLOW": ["> workflow:map", "observing repeated actions...", "inputs normalised", "failure states mapped", "queue policy applied", "", "✓ retries bounded", "✓ stale state guarded", "✓ status visible", "", "status: automation ready"],
  "DEPLOY A SERVICE": ["> deploy:prepare", "checking revision...", "environment loaded", "health checks armed", "release running", "", "✓ proxy config", "✓ service healthy", "✓ rollback path ready", "", "status: production / healthy"]
};
export default function EngineeringConsole() {
  const [active, setActive] = useState<keyof typeof scenarios>("BUILD A PRODUCT");
  return <section className="console-section shell section"><SectionLabel index="05">LIVE ENGINEERING CONSOLE</SectionLabel><div className="console">
    <aside><div className="console-lights"><i/><i/><i/></div>{Object.keys(scenarios).map((s) => <button key={s} className={active===s ? "active" : ""} onClick={() => setActive(s as keyof typeof scenarios)}>{s.split(" A ")[0]}</button>)}</aside>
    <div className="console-main"><div className="console-top"><span>THEACE9 / BUILD</span><span>LOCAL STORY MODE</span></div><pre>{scenarios[active].map((line,i) => <span key={i} className={line.startsWith("✓") ? "ok" : line.startsWith("status") ? "status" : ""}>{line || " "}</span>)}</pre><div className="console-tabs">{Object.keys(scenarios).map(s => <button key={s} onClick={()=>setActive(s as keyof typeof scenarios)} className={active===s ? "active" : ""}>{s}</button>)}</div></div>
  </div></section>;
}