import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artworks, artworkArtists } from "@/lib/db/schema";
import { count, countDistinct, isNotNull } from "drizzle-orm";

export const revalidate = 86400;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [[artworkCount], [artistCount]] = await Promise.all([
    db
      .select({ value: count() })
      .from(artworks)
      .where(isNotNull(artworks.imageUrl)),
    db
      .select({ value: countDistinct(artworkArtists.artistId) })
      .from(artworkArtists),
  ]);

  // Must match sitemap.ts: 1 static + artist batches + artwork batches
  const artistSitemaps = Math.ceil(artistCount.value / 50000);
  const artworkSitemaps = Math.ceil(artworkCount.value / 50000);
  const totalSitemaps = 1 + artistSitemaps + artworkSitemaps;

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
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      ...blockedBots.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: sitemaps,
  };
}
