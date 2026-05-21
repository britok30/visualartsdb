import type { MetadataRoute } from "next";

export const revalidate = 86400;

// Must match sitemap.ts constants
const ARTIST_SITEMAPS = 3;
const ARTWORK_SITEMAPS = 30;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const totalSitemaps = 1 + ARTIST_SITEMAPS + ARTWORK_SITEMAPS;
  const sitemaps = Array.from({ length: totalSitemaps }, (_, i) =>
    `https://www.visualartsdb.com/sitemap/${i}.xml`
  );

  const blockedBots = [
    // AI training / scraping
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "CCBot",
    "Google-Extended",
    "Applebot-Extended",
    "PerplexityBot",
    "Perplexity-User",
    "Bytespider",
    "Amazonbot",
    "Meta-ExternalAgent",
    "Meta-ExternalFetcher",
    "FacebookBot",
    "Diffbot",
    "ImagesiftBot",
    "Timpibot",
    "Omgilibot",
    "Omgili",
    // SEO / monitoring crawlers (high-volume, low value to us)
    "AhrefsBot",
    "SemrushBot",
    "MJ12bot",
    "DataForSeoBot",
    "DotBot",
    "BLEXBot",
    "PetalBot",
    "SeekportBot",
    "TurnitinBot",
    "TrendictionBot",
    "GrapeshotCrawler",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/search"] },
      ...blockedBots.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: sitemaps,
  };
}
