import { cache } from "react";
import { db } from ".";
import { eq, sql, desc, asc, ilike, or, count } from "drizzle-orm";
import {
  artworks,
  artists,
  styles,
  genres,
  tags,
  museums,
  artworkArtists,
  artworkStyles,
  artworkTags,
  artistStyles,
} from "./schema";

// ─── Home ────────────────────────────────────────────────────────

export interface HomeArtwork {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  artistName: string;
  artistSlug: string;
}

// Hour-based offset for cheap variety on cached homepage queries.
// Returns a stable value within each hour, rotating across `range` windows.
function hourlyOffset(range: number): number {
  const hour = Math.floor(Date.now() / 3_600_000);
  return ((hour * 7919) % range + range) % range;
}

export async function getFeaturedArtworks(limit = 12): Promise<HomeArtwork[]> {
  const offset = hourlyOffset(500);
  const result = await db.execute(sql`
    SELECT
      a.id, a.title, a.slug, a.year,
      a.image_url AS "imageUrl",
      a.thumbnail_url AS "thumbnailUrl",
      (SELECT ar.name FROM artists ar
        INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
        WHERE aa.artwork_id = a.id LIMIT 1) AS "artistName",
      (SELECT ar.slug FROM artists ar
        INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
        WHERE aa.artwork_id = a.id LIMIT 1) AS "artistSlug"
    FROM artworks a
    WHERE a.image_url IS NOT NULL
    ORDER BY a.id
    LIMIT ${limit} OFFSET ${offset}
  `);
  return result.rows as unknown as HomeArtwork[];
}

export async function getStats() {
  const [artworkCount] = await db
    .select({ value: count() })
    .from(artworks);
  const [artistCount] = await db
    .select({ value: count() })
    .from(artists);
  const [styleCount] = await db
    .select({ value: count() })
    .from(styles);
  const [genreCount] = await db
    .select({ value: count() })
    .from(genres);
  const [museumCount] = await db
    .select({ value: count() })
    .from(museums);

  return {
    artworks: artworkCount.value,
    artists: artistCount.value,
    styles: styleCount.value,
    genres: genreCount.value,
    museums: museumCount.value,
  };
}

export async function getArtworksByStyleName(
  styleName: string,
  limit = 20,
): Promise<HomeArtwork[]> {
  const offset = hourlyOffset(100);
  const result = await db.execute(sql`
    SELECT
      a.id, a.title, a.slug, a.year,
      a.image_url AS "imageUrl",
      a.thumbnail_url AS "thumbnailUrl",
      (SELECT ar.name FROM artists ar
        INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
        WHERE aa.artwork_id = a.id LIMIT 1) AS "artistName",
      (SELECT ar.slug FROM artists ar
        INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
        WHERE aa.artwork_id = a.id LIMIT 1) AS "artistSlug"
    FROM artworks a
    INNER JOIN artwork_styles ast ON ast.artwork_id = a.id
    INNER JOIN styles s ON s.id = ast.style_id
    WHERE s.name = ${styleName} AND a.image_url IS NOT NULL
    ORDER BY a.id
    LIMIT ${limit} OFFSET ${offset}
  `);
  return result.rows as unknown as HomeArtwork[];
}

export async function getArtworksByGenreName(
  genreName: string,
  limit = 20,
): Promise<HomeArtwork[]> {
  const offset = hourlyOffset(100);
  const result = await db.execute(sql`
    SELECT
      a.id, a.title, a.slug, a.year,
      a.image_url AS "imageUrl",
      a.thumbnail_url AS "thumbnailUrl",
      (SELECT ar.name FROM artists ar
        INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
        WHERE aa.artwork_id = a.id LIMIT 1) AS "artistName",
      (SELECT ar.slug FROM artists ar
        INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
        WHERE aa.artwork_id = a.id LIMIT 1) AS "artistSlug"
    FROM artworks a
    INNER JOIN genres g ON g.id = a.genre_id
    WHERE g.name = ${genreName} AND a.image_url IS NOT NULL
    ORDER BY a.id
    LIMIT ${limit} OFFSET ${offset}
  `);
  return result.rows as unknown as HomeArtwork[];
}

// ─── Artwork ─────────────────────────────────────────────────────

// Wrapped in React cache(): generateMetadata + the page body both call this
// per request, and raw Drizzle calls are not auto-memoized like fetch(). cache()
// dedupes them to a single execution within one request (request-scoped, no
// cross-request leakage). See node_modules/next/dist/docs/.../14-metadata-and-og-images.md
export const getArtworkBySlug = cache(async (slug: string) => {
  // Single relational query (one DB round-trip) replacing the prior 6 sequential
  // queries. Drizzle's relational query builder emits one SQL statement with the
  // related rows json-aggregated. `columns: {}` on the join tables drops their
  // own columns so only the nested entity is fetched. Public return shape is
  // identical to the old version, so callers (page + OG image) are unchanged.
  const row = await db.query.artworks.findFirst({
    where: eq(artworks.slug, slug),
    with: {
      artworkArtists: {
        columns: {},
        with: { artist: { columns: { id: true, name: true, slug: true } } },
      },
      artworkStyles: {
        columns: {},
        with: { style: { columns: { id: true, name: true, slug: true } } },
      },
      artworkTags: {
        columns: {},
        with: { tag: { columns: { id: true, name: true, slug: true } } },
      },
      genre: true,
      museum: true,
    },
  });

  if (!row) return null;

  const { artworkArtists: aa, artworkStyles: ast, artworkTags: atg, genre, museum, ...artwork } =
    row;

  return {
    ...artwork,
    artists: aa.map((r) => r.artist),
    styles: ast.map((r) => r.style),
    tags: atg.map((r) => r.tag),
    genre: genre ?? null,
    museum: museum ?? null,
  };
});

export async function getRelatedArtworks(
  artworkId: string,
  artistIds: string[],
  limit = 8
) {
  if (artistIds.length === 0) return [];

  return db
    .select({
      id: artworks.id,
      title: artworks.title,
      slug: artworks.slug,
      year: artworks.year,
      imageUrl: artworks.imageUrl,
      thumbnailUrl: artworks.thumbnailUrl,
      artistName: artists.name,
      artistSlug: artists.slug,
    })
    .from(artworks)
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(
      sql`${artworkArtists.artistId} IN ${artistIds} AND ${artworks.id} != ${artworkId} AND ${artworks.imageUrl} IS NOT NULL`
    )
    // Was ORDER BY RANDOM() — a full materialize+sort of the artist's entire
    // body of work on every artwork render. Chronological order is cache-stable
    // and lets the planner use the year index, at no compute cost per render.
    .orderBy(asc(artworks.year))
    .limit(limit);
}

// ─── Artist ──────────────────────────────────────────────────────

// Wrapped in React cache() for the same reason as getArtworkBySlug: the artist
// route calls this in both generateMetadata (via getArtistMetadata) and the page
// body (via ArtistContent). cache() collapses those to one query per request.
export const getArtistBySlug = cache(async (slug: string) => {
  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.slug, slug))
    .limit(1);

  if (!artist) return null;

  const artistStyleRows = await db
    .select({
      id: styles.id,
      name: styles.name,
      slug: styles.slug,
    })
    .from(artistStyles)
    .innerJoin(styles, eq(artistStyles.styleId, styles.id))
    .where(eq(artistStyles.artistId, artist.id));

  return { ...artist, styles: artistStyleRows };
});

export async function getArtistArtworks(
  artistId: string,
  page = 1,
  limit = 24
) {
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      slug: artworks.slug,
      year: artworks.year,
      imageUrl: artworks.imageUrl,
      thumbnailUrl: artworks.thumbnailUrl,
    })
    .from(artworks)
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .where(eq(artworkArtists.artistId, artistId))
    .orderBy(asc(artworks.year))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ value: count() })
    .from(artworkArtists)
    .where(eq(artworkArtists.artistId, artistId));

  return { rows, total: total.value };
}

export interface TimelineArtwork {
  id: string;
  slug: string;
  title: string;
  year: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  decade: number;
  decadeCount: number;
}

export async function getArtistTimelineArtworks(
  artistId: string,
): Promise<TimelineArtwork[]> {
  const result = await db.execute(sql`
    WITH ranked AS (
      SELECT
        a.id,
        a.slug,
        a.title,
        a.year,
        a.image_url,
        a.thumbnail_url,
        (a.year / 10) * 10 AS decade,
        ROW_NUMBER() OVER (
          PARTITION BY (a.year / 10) * 10
          ORDER BY a.year, a.id
        ) AS rn,
        COUNT(*) OVER (PARTITION BY (a.year / 10) * 10) AS decade_count
      FROM artworks a
      INNER JOIN artwork_artists aa ON aa.artwork_id = a.id
      WHERE aa.artist_id = ${artistId}
        AND a.year IS NOT NULL
    )
    SELECT id, slug, title, year, image_url, thumbnail_url, decade, decade_count
    FROM ranked
    WHERE rn <= 4
    ORDER BY year ASC
  `);

  return (result.rows as Array<{
    id: string;
    slug: string;
    title: string;
    year: number;
    image_url: string | null;
    thumbnail_url: string | null;
    decade: number;
    decade_count: number | string;
  }>).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    year: r.year,
    imageUrl: r.image_url,
    thumbnailUrl: r.thumbnail_url,
    decade: Number(r.decade),
    decadeCount: Number(r.decade_count),
  }));
}

// ─── Browse ──────────────────────────────────────────────────────

export async function getStylesWithCounts(page = 1, limit = 48) {
  const offset = (page - 1) * limit;

  return db
    .select({
      id: styles.id,
      name: styles.name,
      slug: styles.slug,
      description: styles.description,
      count: count(artworkStyles.artworkId),
    })
    .from(styles)
    .leftJoin(artworkStyles, eq(styles.id, artworkStyles.styleId))
    .groupBy(styles.id)
    .orderBy(desc(count(artworkStyles.artworkId)))
    .limit(limit)
    .offset(offset);
}

export async function getGenresWithCounts(page = 1, limit = 48) {
  const offset = (page - 1) * limit;

  return db
    .select({
      id: genres.id,
      name: genres.name,
      slug: genres.slug,
      description: genres.description,
      count: count(artworks.id),
    })
    .from(genres)
    .leftJoin(artworks, eq(genres.id, artworks.genreId))
    .groupBy(genres.id)
    .orderBy(desc(count(artworks.id)))
    .limit(limit)
    .offset(offset);
}

export async function getMuseumsWithCounts(page = 1, limit = 48) {
  const offset = (page - 1) * limit;

  return db
    .select({
      id: museums.id,
      name: museums.name,
      slug: museums.slug,
      city: museums.city,
      country: museums.country,
      count: count(artworks.id),
    })
    .from(museums)
    .leftJoin(artworks, eq(museums.id, artworks.museumId))
    .groupBy(museums.id)
    .orderBy(desc(count(artworks.id)))
    .limit(limit)
    .offset(offset);
}

export async function getArtworksByStyle(
  styleSlug: string,
  page = 1,
  limit = 24
) {
  const offset = (page - 1) * limit;

  const [style] = await db
    .select()
    .from(styles)
    .where(eq(styles.slug, styleSlug))
    .limit(1);

  if (!style) return null;

  const rows = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      slug: artworks.slug,
      year: artworks.year,
      imageUrl: artworks.imageUrl,
      thumbnailUrl: artworks.thumbnailUrl,
      artistName: artists.name,
      artistSlug: artists.slug,
    })
    .from(artworks)
    .innerJoin(artworkStyles, eq(artworks.id, artworkStyles.artworkId))
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(eq(artworkStyles.styleId, style.id))
    .orderBy(asc(artworks.year))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ value: count() })
    .from(artworkStyles)
    .where(eq(artworkStyles.styleId, style.id));

  return { style, rows, total: total.value };
}

export async function getArtworksByGenre(
  genreSlug: string,
  page = 1,
  limit = 24
) {
  const offset = (page - 1) * limit;

  const [genre] = await db
    .select()
    .from(genres)
    .where(eq(genres.slug, genreSlug))
    .limit(1);

  if (!genre) return null;

  const rows = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      slug: artworks.slug,
      year: artworks.year,
      imageUrl: artworks.imageUrl,
      thumbnailUrl: artworks.thumbnailUrl,
      artistName: artists.name,
      artistSlug: artists.slug,
    })
    .from(artworks)
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(eq(artworks.genreId, genre.id))
    .orderBy(asc(artworks.year))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ value: count() })
    .from(artworks)
    .where(eq(artworks.genreId, genre.id));

  return { genre, rows, total: total.value };
}

export async function getArtworksByMuseum(
  museumSlug: string,
  page = 1,
  limit = 24
) {
  const offset = (page - 1) * limit;

  const [museum] = await db
    .select()
    .from(museums)
    .where(eq(museums.slug, museumSlug))
    .limit(1);

  if (!museum) return null;

  const rows = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      slug: artworks.slug,
      year: artworks.year,
      imageUrl: artworks.imageUrl,
      thumbnailUrl: artworks.thumbnailUrl,
      artistName: artists.name,
      artistSlug: artists.slug,
    })
    .from(artworks)
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(eq(artworks.museumId, museum.id))
    .orderBy(asc(artworks.year))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ value: count() })
    .from(artworks)
    .where(eq(artworks.museumId, museum.id));

  return { museum, rows, total: total.value };
}

// ─── Search ──────────────────────────────────────────────────────

export async function searchArtworks(query: string, page = 1, limit = 24) {
  const offset = (page - 1) * limit;
  const pattern = `%${query}%`;

  const rows = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      slug: artworks.slug,
      year: artworks.year,
      imageUrl: artworks.imageUrl,
      thumbnailUrl: artworks.thumbnailUrl,
      artistName: artists.name,
      artistSlug: artists.slug,
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
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ value: count() })
    .from(artworks)
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(
      or(
        ilike(artworks.title, pattern),
        ilike(artists.name, pattern)
      )
    );

  return { rows, total: total.value };
}

export async function searchArtists(query: string, page = 1, limit = 24) {
  const offset = (page - 1) * limit;
  const pattern = `%${query}%`;

  const rows = await db
    .select({
      id: artists.id,
      name: artists.name,
      slug: artists.slug,
      nationality: artists.nationality,
      birthYear: artists.birthYear,
      deathYear: artists.deathYear,
      portraitUrl: artists.portraitUrl,
    })
    .from(artists)
    .where(
      or(
        ilike(artists.name, pattern),
        ilike(artists.nationality, pattern)
      )
    )
    .orderBy(artists.name)
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ value: count() })
    .from(artists)
    .where(
      or(
        ilike(artists.name, pattern),
        ilike(artists.nationality, pattern)
      )
    );

  return { rows, total: total.value };
}
