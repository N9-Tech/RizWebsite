"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const links = [
  ["Work", "/#work"], ["Capabilities", "/#capabilities"], ["Process", "/#process"], ["About", "/#about"]
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return () => document.body.classList.remove("menu-open");

    const linksInMenu = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a[href]') ?? []);
    linksInMenu[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = [menuButtonRef.current, ...linksInMenu].filter(Boolean) as HTMLElement[];
      if (!focusables.length) return;
      const current = focusables.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? (current <= 0 ? focusables.length - 1 : current - 1)
        : (current === focusables.length - 1 ? 0 : current + 1);
      event.preventDefault();
      focusables[next]?.focus();
    };

    const onResize = () => {
      if (window.innerWidth > 1023) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Link href="/" className="brand" aria-label="theace9 home"><span>the</span>ace9</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <Link href="/contact" className="header-cta">Start a project <span>↗</span></Link>
        <button ref={menuButtonRef} className="menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(v => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div ref={menuRef} id="mobile-navigation" className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu-links">
          {links.map(([label, href], i) => <a style={{ "--i": i } as CSSProperties} key={href} href={href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>{label}<span>0{i+1}</span></a>)}
          <Link href="/contact" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>Contact<span>05</span></Link>
        </div>
        <p>Software engineering / automation / infrastructure / AI-assisted development</p>
      </div>
    </header>
  );
}