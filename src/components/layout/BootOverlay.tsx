"use client";

import { useEffect, useState } from "react";

export default function BootOverlay() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className={`boot-overlay ${visible ? "visible" : "done"}`} aria-hidden={!visible}>
      <div className="boot-status">
        <span>THEACE9 / BUILD SYSTEM</span>
        <strong>INITIALISING</strong>
        <div className="boot-line"><i /></div>
      </div>
    </div>
  );
}