import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import {
  artworks,
  artists,
  styles,
  genres,
  museums,
  artworkStyles,
  artworkArtists,
} from "@/lib/db/schema";
import { count, eq, sql, isNotNull } from "drizzle-orm";

const BASE_URL = "https://visualartsdb.com";
const BATCH_SIZE = 50000;

export async function generateSitemaps() {
  // Only count artworks with images — those are the quality pages
  const [artworkCount] = await db
    .select({ value: count() })
    .from(artworks)
    .where(isNotNull(artworks.imageUrl));

  const total = artworkCount.value;
  const sitemaps = [{ id: 0 }];

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
    const [allArtists, allStyles, allGenres, allMuseums] = await Promise.all([
      // Only artists with at least one artwork
      db
        .selectDistinctOn([artists.id], {
          slug: artists.slug,
        })
        .from(artists)
        .innerJoin(artworkArtists, eq(artists.id, artworkArtists.artistId))
        .orderBy(artists.id),

      // Only styles with 5+ artworks
      db
        .select({ slug: styles.slug })
        .from(styles)
        .innerJoin(artworkStyles, eq(styles.id, artworkStyles.styleId))
        .groupBy(styles.id, styles.slug)
        .having(sql`count(*) >= 5`),

      // Only genres with 5+ artworks
      db
        .select({ slug: genres.slug })
        .from(genres)
        .innerJoin(artworks, eq(genres.id, artworks.genreId))
        .groupBy(genres.id, genres.slug)
        .having(sql`count(*) >= 5`),

      // Only museums with artworks
      db
        .selectDistinctOn([museums.id], {
          slug: museums.slug,
        })
        .from(museums)
        .innerJoin(artworks, eq(museums.id, artworks.museumId))
        .orderBy(museums.id),
    ]);

    return [
      { url: BASE_URL, changeFrequency: "daily", priority: 1 },
      {
        url: `${BASE_URL}/browse/styles`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/browse/genres`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/browse/museums`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/browse/artists`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/search`,
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/terms`,
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${BASE_URL}/privacy`,
        changeFrequency: "yearly",
        priority: 0.3,
      },
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

  // Only artworks with images — quality pages worth indexing
  const offset = (id - 1) * BATCH_SIZE;
  const artworkSlugs = await db
    .select({ slug: artworks.slug })
    .from(artworks)
    .where(isNotNull(artworks.imageUrl))
    .orderBy(artworks.slug)
    .limit(BATCH_SIZE)
    .offset(offset);

  return artworkSlugs.map((a) => ({
    url: `${BASE_URL}/artwork/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}
