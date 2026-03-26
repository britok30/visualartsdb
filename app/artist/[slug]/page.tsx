import { notFound } from "next/navigation";
import { convert } from "html-to-text";
import Link from "next/link";
import type { Metadata } from "next";
import { ArtworkImage } from "@/components/artwork-image";
import { ArtworkCard } from "@/components/artwork-card";
import { FavoriteButton } from "@/components/favorite-button";
import { Pagination } from "@/components/pagination";
import { ArtistTimeline } from "@/components/artist-timeline";
import { getArtistBySlug, getArtistArtworks, getArtistTimelineArtworks } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Not Found" };
  return {
    alternates: { canonical: `/artist/${slug}` },
    title: artist.name,
    description:
      artist.bio ? convert(artist.bio, { wordwrap: false }).slice(0, 160) :
      `Explore artworks by ${artist.name}.`,
    openGraph: artist.portraitUrl
      ? {
          images: [{ url: artist.portraitUrl, alt: artist.name }],
        }
      : undefined,
  };
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const [{ rows: works, total }, timelineArtworks] = await Promise.all([
    getArtistArtworks(artist.id, page, 24),
    getArtistTimelineArtworks(artist.id),
  ]);
  const totalPages = Math.ceil(total / 24);

  const lifespan = [
    artist.birthYear && `b. ${artist.birthYear}`,
    artist.deathYear && `d. ${artist.deathYear}`,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
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

      {/* Timeline */}
      <ArtistTimeline
        artworks={timelineArtworks}
        birthYear={artist.birthYear}
        deathYear={artist.deathYear}
      />

      {/* Works */}
      <section className="mt-20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl italic tracking-tight">Works</h2>
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
          href={(p) => `/artist/${slug}?page=${p}`}
        />
      </section>
    </div>
  );
}
