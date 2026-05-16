import { notFound } from "next/navigation";
import { convert } from "html-to-text";
import Link from "next/link";
import { ArtworkImage } from "@/components/artwork-image";
import { ArtworkCard } from "@/components/artwork-card";
import { FavoriteButton } from "@/components/favorite-button";
import { Pagination } from "@/components/pagination";
import { ArtistTimeline } from "@/components/artist-timeline";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  getArtistBySlug,
  getArtistArtworks,
  getArtistTimelineArtworks,
} from "@/lib/db/queries";

export const PAGE_SIZE = 24;

export function artistPageHref(slug: string, page: number) {
  return page <= 1 ? `/artist/${slug}` : `/artist/${slug}/page/${page}`;
}

export async function ArtistContent({
  slug,
  page,
}: {
  slug: string;
  page: number;
}) {
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const [{ rows: works, total }, timelineArtworks] = await Promise.all([
    getArtistArtworks(artist.id, page, PAGE_SIZE),
    getArtistTimelineArtworks(artist.id),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (page > totalPages) notFound();

  const lifespan = [
    artist.birthYear && `b. ${artist.birthYear}`,
    artist.deathYear && `d. ${artist.deathYear}`,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: artist.name,
          image: artist.portraitUrl || undefined,
          nationality: artist.nationality || undefined,
          birthDate: artist.birthYear ? String(artist.birthYear) : undefined,
          deathDate: artist.deathYear ? String(artist.deathYear) : undefined,
          url: `https://www.visualartsdb.com/artist/${slug}`,
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Artists", href: "/browse/artists" },
          { name: artist.name, href: `/artist/${slug}` },
          ...(page > 1 ? [{ name: `Page ${page}` }] : []),
        ]}
      />

      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
        {artist.portraitUrl && (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-neutral-100">
            <ArtworkImage
              src={artist.portraitUrl}
              alt={artist.name}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
        )}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl italic tracking-tight">{artist.name}</h1>
            <FavoriteButton
              id={artist.id}
              type="artist"
              slug={artist.slug}
              title={artist.name}
              imageUrl={artist.portraitUrl}
              subtitle={artist.nationality}
              size={22}
            />
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            {[artist.nationality, lifespan].filter(Boolean).join(" · ")}
          </p>

          {artist.styles.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {artist.styles.map((style) => (
                <Link
                  key={style.id}
                  href={`/browse/styles/${style.slug}`}
                  className="border-b border-neutral-200 pb-0.5 text-xs text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  {style.name}
                </Link>
              ))}
            </div>
          )}

          {artist.bio && (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-500">
              {convert(artist.bio, { wordwrap: false })}
            </p>
          )}
        </div>
      </div>

      <ArtistTimeline
        artworks={timelineArtworks}
        birthYear={artist.birthYear}
        deathYear={artist.deathYear}
      />

      <section className="mt-20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl italic tracking-tight">
            Works{page > 1 && ` — Page ${page}`}
          </h2>
          <span className="text-xs text-neutral-400">
            {total.toLocaleString()} artwork{total !== 1 && "s"}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {works.map((artwork, i) => (
            <ArtworkCard
              key={artwork.id}
              id={artwork.id}
              slug={artwork.slug}
              title={artwork.title}
              imageUrl={artwork.imageUrl}
              thumbnailUrl={artwork.thumbnailUrl}
              year={artwork.year}
              priority={i < 4}
            />
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          href={(p) => artistPageHref(slug, p)}
        />
      </section>
    </div>
  );
}

export async function getArtistMetadata(slug: string, page: number) {
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Not Found" } as const;

  const baseDescription = artist.bio
    ? convert(artist.bio, { wordwrap: false }).slice(0, 160)
    : `Explore artworks by ${artist.name}.`;

  const canonical = artistPageHref(slug, page);
  const title = page > 1 ? `${artist.name} — Page ${page}` : artist.name;
  const description =
    page > 1 ? `${artist.name} artworks, page ${page}.` : baseDescription;

  return {
    alternates: { canonical },
    title,
    description,
    robots: page > 1 ? { index: true, follow: true } : undefined,
  } as const;
}
