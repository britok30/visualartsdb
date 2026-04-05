import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artworks, artworkArtists } from "@/lib/db/schema";
import { count, countDistinct, isNotNull } from "drizzle-orm";

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

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: sitemaps,
  };
}
