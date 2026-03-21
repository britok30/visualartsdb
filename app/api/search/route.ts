import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artworks, artists, styles, genres, artworkArtists } from "@/lib/db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ artists: [], artworks: [], styles: [], genres: [] });
  }

  const pattern = `%${q}%`;

  const [artistRows, artworkRows, styleRows, genreRows] = await Promise.all([
    db
      .select({
        id: artists.id,
        name: artists.name,
        slug: artists.slug,
        nationality: artists.nationality,
      })
      .from(artists)
      .where(ilike(artists.name, pattern))
      .orderBy(artists.name)
      .limit(5),

    db
      .select({
        id: artworks.id,
        title: artworks.title,
        slug: artworks.slug,
        year: artworks.year,
        artistName: artists.name,
      })
      .from(artworks)
      .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
      .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
      .where(
        or(
          ilike(artworks.title, pattern),
          ilike(artists.name, pattern)
        )
      )
      .orderBy(artworks.title)
      .limit(6),

    db
      .select({
        id: styles.id,
        name: styles.name,
        slug: styles.slug,
      })
      .from(styles)
      .where(ilike(styles.name, pattern))
      .orderBy(styles.name)
      .limit(4),

    db
      .select({
        id: genres.id,
        name: genres.name,
        slug: genres.slug,
      })
      .from(genres)
      .where(ilike(genres.name, pattern))
      .orderBy(genres.name)
      .limit(4),
  ]);

  return NextResponse.json({
    artists: artistRows,
    artworks: artworkRows,
    styles: styleRows,
    genres: genreRows,
  });
}
