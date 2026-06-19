import type { MetadataRoute } from "next";
import { CALCULATORS } from "@/components/calculators/registry";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://lintel-green.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const top: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/calculators`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
  const calcs: MetadataRoute.Sitemap = CALCULATORS.map((c) => ({
    url: `${base}/calculators/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...top, ...calcs];
}
