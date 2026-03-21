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
import { count, countDistinct, eq, sql, isNotNull } from "drizzle-orm";

const BASE_URL = "https://www.visualartsdb.com";
const BATCH_SIZE = 50000;

export async function generateSitemaps() {
  const [artworkCount] = await db
    .select({ value: count() })
    .from(artworks)
    .where(isNotNull(artworks.imageUrl));

  const [artistCount] = await db
    .select({ value: countDistinct(artworkArtists.artistId) })
    .from(artworkArtists);

  // id 0 = static + styles + genres + museums (small)
  // id 1..N = artist batches
  // id N+1..M = artwork batches
  const sitemaps = [{ id: 0 }];

  const artistSitemaps = Math.ceil(artistCount.value / BATCH_SIZE);
  for (let i = 0; i < artistSitemaps; i++) {
    sitemaps.push({ id: i + 1 });
  }

  const artworkStart = artistSitemaps + 1;
  const artworkSitemapCount = Math.ceil(artworkCount.value / BATCH_SIZE);
  for (let i = 0; i < artworkSitemapCount; i++) {
    sitemaps.push({ id: artworkStart + i });
  }

  return sitemaps;
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);

  // Compute boundaries
  const [artistCount] = await db
    .select({ value: countDistinct(artworkArtists.artistId) })
    .from(artworkArtists);
  const artistSitemaps = Math.ceil(artistCount.value / BATCH_SIZE);
  const artworkStart = artistSitemaps + 1;

  // Sitemap 0: static + styles + genres + museums
  if (id === 0) {
    const [allStyles, allGenres, allMuseums] = await Promise.all([
      db
        .select({ slug: styles.slug })
        .from(styles)
        .innerJoin(artworkStyles, eq(styles.id, artworkStyles.styleId))
        .groupBy(styles.id, styles.slug)
        .having(sql`count(*) >= 5`),
      db
        .select({ slug: genres.slug })
        .from(genres)
        .innerJoin(artworks, eq(genres.id, artworks.genreId))
        .groupBy(genres.id, genres.slug)
        .having(sql`count(*) >= 5`),
      db
        .selectDistinctOn([museums.id], { slug: museums.slug })
        .from(museums)
        .innerJoin(artworks, eq(museums.id, artworks.museumId))
        .orderBy(museums.id),
    ]);

    return [
      { url: BASE_URL, changeFrequency: "daily", priority: 1 },
      { url: `${BASE_URL}/browse/styles`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/genres`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/museums`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/artists`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
      { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
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

  // Artist sitemaps (id 1..artistSitemaps)
  if (id <= artistSitemaps) {
    const offset = (id - 1) * BATCH_SIZE;
    const rows = await db
      .selectDistinctOn([artists.id], { slug: artists.slug })
      .from(artists)
      .innerJoin(artworkArtists, eq(artists.id, artworkArtists.artistId))
      .orderBy(artists.id)
      .limit(BATCH_SIZE)
      .offset(offset);

    return rows.map((a) => ({
      url: `${BASE_URL}/artist/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  // Artwork sitemaps (id artworkStart+)
  const offset = (id - artworkStart) * BATCH_SIZE;
  const rows = await db
    .select({ slug: artworks.slug })
    .from(artworks)
    .where(isNotNull(artworks.imageUrl))
    .orderBy(artworks.slug)
    .limit(BATCH_SIZE)
    .offset(offset);

  return rows.map((a) => ({
    url: `${BASE_URL}/artwork/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}
