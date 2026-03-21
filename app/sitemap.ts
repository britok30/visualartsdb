import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artworks, artists, styles, genres, museums } from "@/lib/db/schema";
import { count } from "drizzle-orm";

const BASE_URL = "https://visualartsdb.com";
const BATCH_SIZE = 50000;

export async function generateSitemaps() {
  const [artworkCount] = await db
    .select({ value: count() })
    .from(artworks);

  const total = artworkCount.value;
  const sitemaps = [];

  // Sitemap 0: static + artists + styles + genres + museums
  sitemaps.push({ id: 0 });

  // Remaining sitemaps: artwork pages in batches of 50k
  const artworkSitemaps = Math.ceil(total / BATCH_SIZE);
  for (let i = 0; i < artworkSitemaps; i++) {
    sitemaps.push({ id: i + 1 });
  }

  return sitemaps;
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  if (id === 0) {
    // Static pages + browse entities
    const [allArtists, allStyles, allGenres, allMuseums] = await Promise.all([
      db.select({ slug: artists.slug }).from(artists),
      db.select({ slug: styles.slug }).from(styles),
      db.select({ slug: genres.slug }).from(genres),
      db.select({ slug: museums.slug }).from(museums),
    ]);

    return [
      { url: BASE_URL, changeFrequency: "daily", priority: 1 },
      { url: `${BASE_URL}/browse/styles`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/genres`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/museums`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/artists`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/favorites`, changeFrequency: "monthly", priority: 0.4 },
      { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
      { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
      ...allArtists.map((a) => ({
        url: `${BASE_URL}/artist/${a.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...allStyles.map((s) => ({
        url: `${BASE_URL}/browse/styles/${s.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...allGenres.map((g) => ({
        url: `${BASE_URL}/browse/genres/${g.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...allMuseums.map((m) => ({
        url: `${BASE_URL}/browse/museums/${m.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  }

  // Artwork pages in batches
  const offset = (id - 1) * BATCH_SIZE;
  const artworkSlugs = await db
    .select({ slug: artworks.slug })
    .from(artworks)
    .orderBy(artworks.slug)
    .limit(BATCH_SIZE)
    .offset(offset);

  return artworkSlugs.map((a) => ({
    url: `${BASE_URL}/artwork/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}
