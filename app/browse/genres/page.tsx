import Link from "next/link";
import type { Metadata } from "next";
import { SITE_STATS } from "@/lib/constants";
import { getGenresWithCounts } from "@/lib/db/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/browse/genres" },
  title: "Browse Genres",
  description: `Explore artworks by genre and subject matter — portraits, landscapes, still life, religious art, and ${SITE_STATS.genres} more categories.`,
};

export default async function GenresPage() {
  const genres = await getGenresWithCounts(1, 200);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Genres</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Browse artworks by subject matter
      </p>

      <div className="mt-12 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/browse/genres/${genre.slug}`}
            className="group flex items-baseline justify-between py-2"
          >
            <span className="text-sm text-neutral-600 transition-colors group-hover:text-neutral-900">
              {genre.name}
            </span>
            <span className="ml-4 text-xs text-neutral-300">
              {genre.count.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
