import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { SITE_STATS } from "@/lib/constants";
import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { asc, count, ilike } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Browse Artists",
  description:
    `Explore ${SITE_STATS.artists} artists from around the world — painters, sculptors, and visual artists across all periods and movements.`,
};

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; letter?: string }>;
}) {
  const { page: pageStr, letter } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const limit = 60;
  const offset = (page - 1) * limit;

  const where = letter ? ilike(artists.name, `${letter}%`) : undefined;

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
    .where(where)
    .orderBy(asc(artists.name))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ value: count() })
    .from(artists)
    .where(where);
  const totalPages = Math.ceil(total.value / limit);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Artists</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {total.value.toLocaleString()} artists
      </p>

      {/* Alphabet */}
      <div className="mt-8 flex flex-wrap gap-1">
        <Link
          href="/browse/artists"
          className={`px-2 py-1 text-xs transition-colors ${
            !letter ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-600"
          }`}
        >
          All
        </Link>
        {alphabet.map((l) => (
          <Link
            key={l}
            href={`/browse/artists?letter=${l}`}
            className={`px-2 py-1 text-xs transition-colors ${
              letter === l
                ? "text-neutral-900"
                : "text-neutral-300 hover:text-neutral-600"
            }`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="mt-12 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {rows.map((artist) => (
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
            <div className="min-w-0">
              <span className="text-sm text-neutral-600 transition-colors group-hover:text-neutral-900">
                {artist.name}
              </span>
              <span className="ml-2 text-xs text-neutral-300">
                {[
                  artist.nationality,
                  artist.birthYear &&
                    `${artist.birthYear}${artist.deathYear ? `–${artist.deathYear}` : ""}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        href={(p) => `/browse/artists?${letter ? `letter=${letter}&` : ""}page=${p}`}
      />
    </div>
  );
}
