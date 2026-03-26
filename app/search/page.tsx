import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SearchBar } from "@/components/search-bar";
import { ArtworkCard } from "@/components/artwork-card";
import { Pagination } from "@/components/pagination";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";
import { searchArtworks, searchArtists } from "@/lib/db/queries";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    robots: { index: false, follow: true },
    title: q ? `"${q}" — Search` : "Search",
    description: q
      ? `Search results for "${q}" on VisualArtsDB.`
      : `Search ${SITE_STATS.artworks} artworks, ${SITE_STATS.artists} artists, and ${SITE_STATS.styles} styles on ${SITE_NAME}.`,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const query = q?.trim() ?? "";

  let artworksResult = null;
  let artistsResult = null;

  if (query) {
    [artworksResult, artistsResult] = await Promise.all([
      searchArtworks(query, page, 24),
      searchArtists(query, 1, 6),
    ]);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-lg">
        <SearchBar defaultValue={query} large />
      </div>

      {query && artworksResult && artistsResult && (
        <div className="mt-16">
          {/* Artists */}
          {artistsResult.rows.length > 0 && (
            <section className="mb-16">
              <h2 className="text-xl italic tracking-tight">Artists</h2>
              <div className="mt-6 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
                {artistsResult.rows.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.slug}`}
                    className="group flex items-center gap-3 py-2"
                  >
                    {artist.portraitUrl ? (
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                        <Image
                          src={artist.portraitUrl}
                          alt={artist.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-[10px] text-neutral-300">
                        {artist.name[0]}
                      </div>
                    )}
                    <span className="text-sm text-neutral-600 transition-colors group-hover:text-neutral-900">
                      {artist.name}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Artworks */}
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl italic tracking-tight">Artworks</h2>
              <span className="text-xs text-neutral-300">
                {artworksResult.total.toLocaleString()} result
                {artworksResult.total !== 1 && "s"}
              </span>
            </div>

            {artworksResult.rows.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                {artworksResult.rows.map((artwork, i) => (
                  <ArtworkCard
                    key={artwork.id}
                    id={artwork.id}
                    slug={artwork.slug}
                    title={artwork.title}
                    imageUrl={artwork.imageUrl}
                    thumbnailUrl={artwork.thumbnailUrl}
                    artistName={artwork.artistName}
                    year={artwork.year}
                    priority={i < 4}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm text-neutral-400">
                No artworks found for &ldquo;{query}&rdquo;
              </p>
            )}

            <Pagination
              page={page}
              totalPages={Math.ceil(artworksResult.total / 24)}
              href={(p) => `/search?q=${encodeURIComponent(query)}&page=${p}`}
            />
          </section>
        </div>
      )}

      {!query && (
        <p className="mt-16 text-center text-sm text-neutral-300">
          Search for artists, artworks, or styles
        </p>
      )}
    </div>
  );
}
