import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { ScrollRow } from "@/components/scroll-row";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";
import {
  getFeaturedArtworks,
  getArtworksByStyleName,
  getArtworksByGenreName,
} from "@/lib/db/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: `${SITE_NAME} — The World's Largest Visual Arts Encyclopedia`,
  description: `The world's largest visual arts encyclopedia. Discover ${SITE_STATS.artworks} artworks by ${SITE_STATS.artists} artists across Impressionism, Surrealism, Baroque, Pop Art, and more. Search by style, genre, museum, or artist.`,
};

export const revalidate = 86400; // daily — rotates the featured pool and picks up synced art for ~1 query/day

type Section = { name: string; slug: string; title?: string };

const STYLE_SECTIONS: Section[] = [
  // Flagship
  { name: "Impressionism", slug: "impressionism" },

  // Renaissance era
  { name: "Early Renaissance", slug: "early-renaissance" },
  { name: "Northern Renaissance", slug: "northern-renaissance" },
  { name: "Mannerism (Late Renaissance)", slug: "mannerism-late-renaissance" },

  // Baroque through Romanticism
  { name: "Baroque", slug: "baroque" },
  { name: "Rococo", slug: "rococo" },
  { name: "Neoclassicism", slug: "neoclassicism" },
  { name: "Romanticism", slug: "romanticism" },
  { name: "Realism", slug: "realism" },
  { name: "Academicism", slug: "academicism" },

  // Late 19th century
  { name: "Symbolism", slug: "symbolism" },
  { name: "Post-Impressionism", slug: "post-impressionism" },
  { name: "Art Nouveau (Modern)", slug: "art-nouveau-modern" },

  // Early 20th century
  { name: "Fauvism", slug: "fauvism" },
  { name: "Expressionism", slug: "expressionism" },
  { name: "Cubism", slug: "cubism" },
  { name: "Constructivism", slug: "constructivism" },
  { name: "bauhaus", slug: "bauhaus", title: "Bauhaus" },
  { name: "Art Deco", slug: "art-deco" },
  { name: "Surrealism", slug: "surrealism" },

  // Mid–late 20th century
  { name: "Abstract Expressionism", slug: "abstract-expressionism" },
  { name: "Abstract Art", slug: "abstract-art" },
  { name: "Modernism", slug: "modernism" },
  { name: "Pop Art", slug: "pop-art" },
  { name: "Minimalism", slug: "minimalism" },
  { name: "Conceptual Art", slug: "conceptual-art" },
  { name: "Street art", slug: "street-art", title: "Street Art" },

  // Outsider / folk
  { name: "Naïve Art (Primitivism)", slug: "naive-art-primitivism" },

  // Cultural traditions
  { name: "Japanese Art", slug: "japanese-art" },
  { name: "Chinese Art", slug: "chinese-art" },
  { name: "Korean Art", slug: "korean-art" },
  { name: "Indian and Southeast Asian Art", slug: "indian-and-southeast-asian-art" },
  { name: "Arts of the Islamic World", slug: "arts-of-the-islamic-world", title: "Islamic Art" },
  { name: "African Art", slug: "african-art" },
];

// NOTE: `name` must match genres.name EXACTLY (the section query and the
// /browse/genres/[slug] link both look up by these). The DB stores capitalized,
// pluralized names — the previous lowercase-singular values matched nothing, so
// every genre row rendered blank. Values below verified against the DB.
const GENRE_SECTIONS: Section[] = [
  { name: "Paintings", slug: "paintings" },
  { name: "Photographs", slug: "photographs" },
  { name: "Sculpture", slug: "sculpture" },
  { name: "Drawings", slug: "drawings" },
  { name: "Print", slug: "print", title: "Prints" },
  { name: "Ceramics", slug: "ceramics" },
  { name: "Textiles", slug: "textiles" },
  { name: "Illustrated books", slug: "illustrated-books" },
];

export default async function Home() {
  // Stats come from the SITE_STATS constant (also used in metadata) instead of
  // 5 live COUNT(*) full-table scans per homepage regeneration.
  // Fetch a larger POOL per row (built once per deploy); ScrollRow shuffles each
  // pool down to 20 per visit on the client for variety with no per-request DB.
  const [featured, ...rest] = await Promise.all([
    getFeaturedArtworks(60),
    ...STYLE_SECTIONS.map((s) => getArtworksByStyleName(s.name, 40)),
    ...GENRE_SECTIONS.map((g) => getArtworksByGenreName(g.name, 40)),
  ]);

  const styleSections = rest.slice(0, STYLE_SECTIONS.length);
  const genreSections = rest.slice(STYLE_SECTIONS.length);

  return (
    <div>
      <Hero
        artworks={SITE_STATS.artworks}
        artists={SITE_STATS.artists}
        styles={SITE_STATS.styles}
      />

      <div className="space-y-16">
        <ScrollRow title="Discover" artworks={featured} shuffleTo={20} priority />

        {STYLE_SECTIONS.map((section, i) => (
          <ScrollRow
            key={section.slug}
            title={section.title ?? section.name}
            href={`/browse/styles/${section.slug}`}
            artworks={styleSections[i]}
            shuffleTo={20}
          />
        ))}

        {GENRE_SECTIONS.map((section, i) => (
          <ScrollRow
            key={section.slug}
            title={
              section.title ??
              section.name.charAt(0).toUpperCase() + section.name.slice(1)
            }
            href={`/browse/genres/${section.slug}`}
            artworks={genreSections[i]}
            shuffleTo={20}
          />
        ))}
      </div>
    </div>
  );
}
