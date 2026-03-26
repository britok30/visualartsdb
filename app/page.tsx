import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { ScrollRow } from "@/components/scroll-row";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";
import {
  getFeaturedArtworks,
  getArtworksByStyleName,
  getArtworksByGenreName,
  getStats,
} from "@/lib/db/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: `${SITE_NAME} — Explore the World's Art`,
  description: `Discover ${SITE_STATS.artworks} artworks by ${SITE_STATS.artists} artists across Impressionism, Surrealism, Baroque, Pop Art, and more. Search by style, genre, museum, or artist.`,
};

export const revalidate = 60;

const STYLE_SECTIONS = [
  { name: "Impressionism", slug: "impressionism" },
  { name: "Romanticism", slug: "romanticism" },
  { name: "Pop Art", slug: "pop-art" },
  { name: "Expressionism", slug: "expressionism" },
  { name: "Art Nouveau (Modern)", slug: "art-nouveau-modern" },
  { name: "Realism", slug: "realism" },
  { name: "Cubism", slug: "cubism" },
  { name: "Surrealism", slug: "surrealism" },
  { name: "Modernism", slug: "modernism" },
  { name: "Post-Impressionism", slug: "post-impressionism" },
  { name: "Abstract Expressionism", slug: "abstract-expressionism" },
  { name: "Naïve Art (Primitivism)", slug: "naive-art-primitivism" },
  { name: "Japanese Art", slug: "japanese-art" },
  { name: "Chinese Art", slug: "chinese-art" },
  { name: "Indian and Southeast Asian Art", slug: "indian-and-southeast-asian-art" },
];

const GENRE_SECTIONS = [
  { name: "painting", slug: "painting" },
  { name: "photograph", slug: "photograph" },
  { name: "sculpture", slug: "sculpture" },
  { name: "drawing", slug: "drawing" },
  { name: "woodblock print", slug: "woodblock-print" },
  { name: "ceramics", slug: "ceramics" },
];

export default async function Home() {
  const [featured, stats, ...rest] = await Promise.all([
    getFeaturedArtworks(20),
    getStats(),
    ...STYLE_SECTIONS.map((s) => getArtworksByStyleName(s.name, 20)),
    ...GENRE_SECTIONS.map((g) => getArtworksByGenreName(g.name, 20)),
  ]);

  const styleSections = rest.slice(0, STYLE_SECTIONS.length);
  const genreSections = rest.slice(STYLE_SECTIONS.length);

  return (
    <div>
      <Hero
        artworks={stats.artworks}
        artists={stats.artists}
        styles={stats.styles}
      />

      <div className="space-y-16">
        <ScrollRow title="Discover" artworks={featured} priority />

        {STYLE_SECTIONS.map((section, i) => (
          <ScrollRow
            key={section.slug}
            title={section.name}
            href={`/browse/styles/${section.slug}`}
            artworks={styleSections[i]}
          />
        ))}

        {GENRE_SECTIONS.map((section, i) => (
          <ScrollRow
            key={section.slug}
            title={section.name.charAt(0).toUpperCase() + section.name.slice(1)}
            href={`/browse/genres/${section.slug}`}
            artworks={genreSections[i]}
          />
        ))}
      </div>
    </div>
  );
}
