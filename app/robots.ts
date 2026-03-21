import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artworks } from "@/lib/db/schema";
import { count, isNotNull } from "drizzle-orm";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [artworkCount] = await db
    .select({ value: count() })
    .from(artworks)
    .where(isNotNull(artworks.imageUrl));

  const totalSitemaps = Math.ceil(artworkCount.value / 50000) + 1;
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
