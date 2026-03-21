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

export async function getFeaturedArtworks(limit = 12) {
  return db
    .selectDistinctOn([artworks.id], {
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
    .where(sql`${artworks.imageUrl} IS NOT NULL`)
    .orderBy(artworks.id, sql`RANDOM()`)
    .limit(limit);
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

export async function getArtworksByStyleName(styleName: string, limit = 20) {
  return db
    .selectDistinctOn([artworks.id], {
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
    .innerJoin(styles, eq(artworkStyles.styleId, styles.id))
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(sql`${styles.name} = ${styleName} AND ${artworks.imageUrl} IS NOT NULL`)
    .orderBy(artworks.id, sql`RANDOM()`)
    .limit(limit);
}

export async function getArtworksByGenreName(genreName: string, limit = 20) {
  return db
    .selectDistinctOn([artworks.id], {
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
    .innerJoin(genres, eq(artworks.genreId, genres.id))
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(sql`${genres.name} = ${genreName} AND ${artworks.imageUrl} IS NOT NULL`)
    .orderBy(artworks.id, sql`RANDOM()`)
    .limit(limit);
}

// ─── Artwork ─────────────────────────────────────────────────────

export async function getArtworkBySlug(slug: string) {
  const [artwork] = await db
    .select()
    .from(artworks)
    .where(eq(artworks.slug, slug))
    .limit(1);

  if (!artwork) return null;

  const artworkArtistRows = await db
    .select({
      id: artists.id,
      name: artists.name,
      slug: artists.slug,
    })
    .from(artworkArtists)
    .innerJoin(artists, eq(artworkArtists.artistId, artists.id))
    .where(eq(artworkArtists.artworkId, artwork.id));

  const artworkStyleRows = await db
    .select({
      id: styles.id,
      name: styles.name,
      slug: styles.slug,
    })
    .from(artworkStyles)
    .innerJoin(styles, eq(artworkStyles.styleId, styles.id))
    .where(eq(artworkStyles.artworkId, artwork.id));

  const artworkTagRows = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(artworkTags)
    .innerJoin(tags, eq(artworkTags.tagId, tags.id))
    .where(eq(artworkTags.artworkId, artwork.id));

  let genre = null;
  if (artwork.genreId) {
    const [g] = await db
      .select()
      .from(genres)
      .where(eq(genres.id, artwork.genreId))
      .limit(1);
    genre = g ?? null;
  }

  let museum = null;
  if (artwork.museumId) {
    const [m] = await db
      .select()
      .from(museums)
      .where(eq(museums.id, artwork.museumId))
      .limit(1);
    museum = m ?? null;
  }

  return {
    ...artwork,
    artists: artworkArtistRows,
    styles: artworkStyleRows,
    tags: artworkTagRows,
    genre,
    museum,
  };
}

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
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

// ─── Artist ──────────────────────────────────────────────────────

export async function getArtistBySlug(slug: string) {
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
}

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

export async function getArtistTimelineArtworks(artistId: string) {
  return db
    .select({
      id: artworks.id,
      slug: artworks.slug,
      title: artworks.title,
      year: artworks.year,
      imageUrl: artworks.imageUrl,
      thumbnailUrl: artworks.thumbnailUrl,
    })
    .from(artworks)
    .innerJoin(artworkArtists, eq(artworks.id, artworkArtists.artworkId))
    .where(sql`${artworkArtists.artistId} = ${artistId} AND ${artworks.year} IS NOT NULL`)
    .orderBy(asc(artworks.year));
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
