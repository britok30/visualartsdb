import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  artworks,
  artists,
  styles,
  genres,
  artworkArtists,
} from "@/lib/db/schema";
import { eq, ilike, sql } from "drizzle-orm";
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

    // Artworks: deduplicated, prioritize prefix matches
    db
      .selectDistinctOn([artworks.id], {
        id: artworks.id,
        title: artworks.title,
        slug: artworks.slug,
        year: artworks.year,
        artistName: sql<string>`${artists.name}`.as("artist_name"),
      })
      .from(artworks)
      .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
      .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
      .where(ilike(artworks.title, containsPattern))
      .orderBy(
        artworks.id,
        sql`CASE WHEN ${artworks.title} ILIKE ${prefixPattern} THEN 0 ELSE 1 END`
      )
      .limit(6),

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
