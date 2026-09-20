import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="inner-page">
      <div className="shell" style={{ minHeight: "65vh", display: "grid", alignContent: "center" }}>
        <div className="page-kicker"><span>404 / NOT FOUND</span><span>ROUTE / MISSING</span></div>
        <div style={{ paddingTop: "54px", maxWidth: "850px" }}>
          <h1 style={{ fontSize: "clamp(4rem, 9vw, 8rem)", lineHeight: .88, letterSpacing: "-.07em", margin: 0, fontWeight: 590 }}>That route<br/><span style={{ color: "#747a7d" }}>isn&apos;t here.</span></h1>
          <p style={{ color: "#8d9692", maxWidth: "540px", lineHeight: 1.7, marginTop: "28px" }}>The page may have moved, or the project slug does not exist.</p>
          <Link className="button button-primary" style={{ marginTop: "20px" }} href="/">Return home</Link>
        </div>
      </div>
    </main>
  );
}
