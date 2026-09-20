import Link from "next/link";
export default function Footer() {
  return (
    <footer className="site-footer shell">
      <div><strong>THEACE9</strong><span>SOFTWARE ENGINEER</span></div>
      <nav aria-label="Footer navigation"><a href="/#work">Work</a><a href="/#about">About</a><Link href="/contact">Contact</Link></nav>
      <div className="footer-right"><span>© {new Date().getFullYear()}</span><span>Built with code + AI.</span><span className="site-ready"><i /> SITE / READY</span></div>
    </footer>
  );
}