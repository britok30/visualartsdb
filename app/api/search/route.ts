import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artists, styles, genres } from "@/lib/db/schema";
import { ilike, sql } from "drizzle-orm";
import { escapeLike } from "@/lib/db/queries";

// CDN-cache repeat queries at the edge so they never wake Neon compute.
// Browser revalidates fast to keep the UI feeling live; Vercel edge holds 1h fresh + 24h SWR.
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Vercel-CDN-Cache-Control":
    "public, s-maxage=3600, stale-while-revalidate=86400",
  "CDN-Cache-Control":
    "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  // Min 3 chars — pg_trgm cannot use the GIN index for shorter patterns,
  // so anything below 3 would force a seq scan on every artwork.
  if (!q || q.length < 3) {
    return NextResponse.json(
      { artists: [], artworks: [], styles: [], genres: [] },
      { headers: CACHE_HEADERS },
    );
  }

  const escaped = escapeLike(q);
  const prefixPattern = `${escaped}%`;
  const containsPattern = `%${escaped}%`;

  const [artistRows, artworkRows, styleRows, genreRows] = await Promise.all([
    // Artists: prioritize short clean names and prefix matches
    db
      .select({
        id: artists.id,
        name: artists.name,
        slug: artists.slug,
        nationality: artists.nationality,
      })
      .from(artists)
      .where(ilike(artists.name, containsPattern))
      .orderBy(
        sql`length(${artists.name})`,
        sql`CASE WHEN ${artists.name} ILIKE ${prefixPattern} THEN 0 ELSE 1 END`,
        artists.name
      )
      .limit(5),

    // Artworks: deduplicated, then RANKED. DISTINCT ON requires ORDER BY id,
    // so ranking must happen in an outer query — the previous single-level
    // version returned the 6 matches with the lowest UUIDs (i.e. random).
    // The inner LIMIT bounds the candidate pool so a broad query can't
    // materialize thousands of rows on the 0.25 CU compute.
    db
      .execute(sql`
        SELECT id, title, slug, year, "artistName" FROM (
          SELECT DISTINCT ON (a.id)
            a.id, a.title, a.slug, a.year, ar.name AS "artistName"
          FROM artworks a
          INNER JOIN artwork_artists aa ON aa.artwork_id = a.id
          INNER JOIN artists ar ON ar.id = aa.artist_id
          WHERE a.title ILIKE ${containsPattern}
          ORDER BY a.id
          LIMIT 200
        ) t
        ORDER BY
          CASE WHEN t.title ILIKE ${prefixPattern} THEN 0 ELSE 1 END,
          length(t.title),
          t.title
        LIMIT 6
      `)
      .then(
        (r) =>
          r.rows as unknown as Array<{
            id: string;
            title: string;
            slug: string;
            year: number | null;
            artistName: string;
          }>,
      ),

    // Styles
    db
      .select({
        id: styles.id,
        name: styles.name,
        slug: styles.slug,
      })
      .from(styles)
      .where(ilike(styles.name, containsPattern))
      .orderBy(
        sql`CASE WHEN ${styles.name} ILIKE ${prefixPattern} THEN 0 ELSE 1 END`,
        styles.name
      )
      .limit(4),

    // Genres
    db
      .select({
        id: genres.id,
        name: genres.name,
        slug: genres.slug,
      })
      .from(genres)
      .where(ilike(genres.name, containsPattern))
      .orderBy(
        sql`CASE WHEN ${genres.name} ILIKE ${prefixPattern} THEN 0 ELSE 1 END`,
        genres.name
      )
      .limit(4),
  ]);

  return NextResponse.json(
    {
      artists: artistRows,
      artworks: artworkRows,
      styles: styleRows,
      genres: genreRows,
    },
    { headers: CACHE_HEADERS },
  );
}
