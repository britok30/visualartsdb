import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { SITE_STATS } from "@/lib/constants";
import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { asc, count, ilike } from "drizzle-orm";
import { notFound } from "next/navigation";
import { isValidPage } from "@/lib/pagination";

export function artistsHref(page = 1, letter?: string) {
  const base = `/browse/artists${letter ? `/letter/${letter}` : ""}`;
  return page === 1 ? base : `${base}/page/${page}`;
}

export function artistsMetadata(page = 1, letter?: string): Metadata {
  return {
    alternates: { canonical: artistsHref(page, letter) },
    title: `Browse Artists${letter ? ` — ${letter}` : ""}${page > 1 ? ` — Page ${page}` : ""}`,
    description: `Explore ${SITE_STATS.artists} artists from around the world — painters, sculptors, and visual artists across all periods and movements.`,
  };
}

export async function ArtistsContent({ page = 1, letter }: { page?: number; letter?: string }) {
  const limit = 60;
  if (!isValidPage(page, limit) || (letter !== undefined && !/^[A-Z]$/.test(letter))) notFound();
  const offset = (page - 1) * limit;

  const where = letter ? ilike(artists.name, `${letter}%`) : undefined;

  const [total] = await db
    .select({ value: count() })
    .from(artists)
    .where(where);
  const totalPages = Math.ceil(total.value / limit);

  if (page > Math.max(1, totalPages)) notFound();

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
    .orderBy(asc(artists.name), asc(artists.id))
    .limit(limit)
    .offset(offset);

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
            prefetch={false}
          href="/browse/artists"
          className={`px-2 py-1 text-xs transition-colors ${
            !letter ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          All
        </Link>
        {alphabet.map((l) => (
          <Link
            prefetch={false}
            key={l}
            href={artistsHref(1, l)}
            className={`px-2 py-1 text-xs transition-colors ${
              letter === l
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="mt-12 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {rows.map((artist) => (
          <Link
            prefetch={false}
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
                  unoptimized
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
              <span className="ml-2 text-xs text-neutral-500">
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
        href={(p) => artistsHref(p, letter)}
      />
    </div>
  );
}
