import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BootOverlay from "@/components/layout/BootOverlay";
import { ExperienceProvider } from "@/scene/ExperienceContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: { default: "theace9 — Software Engineer & AI-Assisted Developer", template: "%s — theace9" },
  description: "Software engineering, automation, web systems, infrastructure and AI-assisted development.",
  openGraph: { title: "theace9 — Software that ships.", description: "Software engineering, automation, infrastructure and AI-assisted development.", type: "website", images: [{ url: "/social/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "theace9 — Software that ships.", images: ["/social/og.png"] }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geist.variable} ${mono.variable}`}><body><a className="skip-link" href="#main">Skip to content</a><BootOverlay/><ExperienceProvider><Header/>{children}<Footer/></ExperienceProvider></body></html>;
}
