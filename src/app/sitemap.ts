import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: .7 },
    ...projects.map((project) => ({ url: `${base}/work/${project.slug}`, changeFrequency: "monthly" as const, priority: .8 })),
  ];
}
