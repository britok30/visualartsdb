import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artists, styles, genres, museums } from "@/lib/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://visualartsdb.com";

  const [allArtists, allStyles, allGenres, allMuseums] = await Promise.all([
    db.select({ slug: artists.slug }).from(artists),
    db.select({ slug: styles.slug }).from(styles),
    db.select({ slug: genres.slug }).from(genres),
    db.select({ slug: museums.slug }).from(museums),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse/styles`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/browse/genres`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/browse/museums`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/browse/artists`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/search`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const artistPages = allArtists.map((a) => ({
    url: `${baseUrl}/artist/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const stylePages = allStyles.map((s) => ({
    url: `${baseUrl}/browse/styles/${s.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const genrePages = allGenres.map((g) => ({
    url: `${baseUrl}/browse/genres/${g.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const museumPages = allMuseums.map((m) => ({
    url: `${baseUrl}/browse/museums/${m.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...artistPages,
    ...stylePages,
    ...genrePages,
    ...museumPages,
  ];
}
