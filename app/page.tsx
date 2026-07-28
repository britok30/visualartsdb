import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { ScrollRow } from "@/components/scroll-row";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";
import { STYLE_SECTIONS, GENRE_SECTIONS } from "@/lib/home-sections";
import type { HomeArtwork } from "@/lib/db/queries";
import snapshot from "@/lib/home-snapshot.json";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: `${SITE_NAME} — The World's Largest Visual Arts Encyclopedia`,
  description: `The world's largest visual arts encyclopedia. Discover ${SITE_STATS.artworks} artworks by ${SITE_STATS.artists} artists across Impressionism, Surrealism, Baroque, Pop Art, and more. Search by style, genre, museum, or artist.`,
};

// Zero database queries: the 43 section pools are precomputed into
// lib/home-snapshot.json by scripts/build-home-snapshot.ts. Querying them live
// cost ~2 minutes of build time, and the only query shape fast enough at 1.6M
// rows always returned the physically-oldest rows — so newly imported works
// never surfaced here. Sampling properly is cheap to do once, offline.
// Refresh with `npx tsx scripts/build-home-snapshot.ts` after a sync.
export const revalidate = false;

const featured = snapshot.featured as unknown as HomeArtwork[];
const styles = snapshot.styles as unknown as Record<string, HomeArtwork[]>;
const genres = snapshot.genres as unknown as Record<string, HomeArtwork[]>;

export default function Home() {
  return (
    <div>
      <Hero
        artworks={SITE_STATS.artworks}
        artists={SITE_STATS.artists}
        styles={SITE_STATS.styles}
      />

      <div className="space-y-16">
        <ScrollRow title="Discover" artworks={featured} shuffleTo={20} priority />

        {STYLE_SECTIONS.map((section) => {
          const artworks = styles[section.slug] ?? [];
          if (artworks.length === 0) return null;
          return (
            <ScrollRow
              key={section.slug}
              title={section.title ?? section.name}
              href={`/browse/styles/${section.slug}`}
              artworks={artworks}
              shuffleTo={20}
            />
          );
        })}

        {GENRE_SECTIONS.map((section) => {
          const artworks = genres[section.slug] ?? [];
          if (artworks.length === 0) return null;
          return (
            <ScrollRow
              key={section.slug}
              title={
                section.title ??
                section.name.charAt(0).toUpperCase() + section.name.slice(1)
              }
              href={`/browse/genres/${section.slug}`}
              artworks={artworks}
              shuffleTo={20}
            />
          );
        })}
      </div>
    </div>
  );
}
