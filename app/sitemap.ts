import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artworks } from "@/lib/db/schema";
import { sql, isNotNull } from "drizzle-orm";

const BASE_URL = "https://www.visualartsdb.com";
const BATCH_SIZE = 50000;
// Artwork sitemaps advertise ~1.5M thin URLs. Crawlers chewing through that
// corpus force on-demand renders around the clock and keep Neon compute from
// ever suspending — so they're opt-in. Artists + browse pages (~150k URLs)
// are the SEO surface worth indexing and stay on by default.
const INCLUDE_ARTWORK_SITEMAPS = process.env.INCLUDE_ARTWORK_SITEMAPS === "1";

// Hardcoded shard counts (avoid expensive count queries during build).
// Bump these if data grows past the implied caps.
const ARTIST_SITEMAPS = 3;   // up to 150k artists
const ARTWORK_SITEMAPS = 30; // up to 1.5M artworks with images

export const revalidate = 86400;

export async function generateSitemaps() {
  // id 0 = static + styles + genres + museums
  // id 1..ARTIST_SITEMAPS = artist batches
  // id (ARTIST_SITEMAPS+1)..(ARTIST_SITEMAPS+ARTWORK_SITEMAPS) = artwork batches
  const total =
    1 + ARTIST_SITEMAPS + (INCLUDE_ARTWORK_SITEMAPS ? ARTWORK_SITEMAPS : 0);
  return Array.from({ length: total }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);

  if (id === 0) {
    const [stylesResult, genresResult, museumsResult] = await Promise.all([
      db.execute(sql`
        WITH counts AS (
          SELECT style_id, count(*) AS n
          FROM artwork_styles GROUP BY style_id
        )
        SELECT s.slug FROM styles s
        INNER JOIN counts c ON c.style_id = s.id
        WHERE c.n >= 5
      `),
      db.execute(sql`
        WITH counts AS (
          SELECT genre_id, count(*) AS n
          FROM artworks WHERE genre_id IS NOT NULL GROUP BY genre_id
        )
        SELECT g.slug FROM genres g
        INNER JOIN counts c ON c.genre_id = g.id
        WHERE c.n >= 5
      `),
      db.execute(sql`
        SELECT DISTINCT m.slug FROM museums m
        INNER JOIN artworks a ON a.museum_id = m.id
      `),
    ]);
    const allStyles = stylesResult.rows as unknown as Array<{ slug: string }>;
    const allGenres = genresResult.rows as unknown as Array<{ slug: string }>;
    const allMuseums = museumsResult.rows as unknown as Array<{ slug: string }>;

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

  if (id <= ARTIST_SITEMAPS) {
    const offset = (id - 1) * BATCH_SIZE;
    // EXISTS semi-join instead of DISTINCT ON + INNER JOIN: the join build
    // over 1.2M artwork_artists rows OOM-crashed the 0.25 CU compute during
    // builds; the semi-join streams off the artist_id index.
    const result = await db.execute(sql`
      SELECT ar.slug, ar.updated_at FROM artists ar
      WHERE EXISTS (
        SELECT 1 FROM artwork_artists aa WHERE aa.artist_id = ar.id
      )
      ORDER BY ar.id
      LIMIT ${BATCH_SIZE} OFFSET ${offset}
    `);
    const rows = result.rows as unknown as Array<{
      slug: string;
      updated_at: string | Date;
    }>;

    // lastModified is the one sitemap field Google actually uses (it ignores
    // changefreq/priority) — it schedules recrawls off it when accurate.
    return rows.map((a) => ({
      url: `${BASE_URL}/artist/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  const artworkStart = ARTIST_SITEMAPS + 1;
  const offset = (id - artworkStart) * BATCH_SIZE;
  const rows = await db
    .select({ slug: artworks.slug, updatedAt: artworks.updatedAt })
    .from(artworks)
    .where(isNotNull(artworks.imageUrl))
    .orderBy(artworks.id)
    .limit(BATCH_SIZE)
    .offset(offset);

  return rows.map((a) => ({
    url: `${BASE_URL}/artwork/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}
