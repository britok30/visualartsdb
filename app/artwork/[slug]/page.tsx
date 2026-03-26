import { notFound } from "next/navigation";
import { convert } from "html-to-text";
import Link from "next/link";
import type { Metadata } from "next";
import { ArtworkImage } from "@/components/artwork-image";
import { FavoriteButton } from "@/components/favorite-button";
import { CiteButton } from "@/components/cite-button";
import { DownloadButton } from "@/components/download-button";
import { ScrollRow } from "@/components/scroll-row";
import { getArtworkBySlug, getRelatedArtworks } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) return { title: "Not Found" };

  const artistNames = artwork.artists.map((a) => a.name).join(", ");
  return {
    alternates: { canonical: `/artwork/${slug}` },
    title: `${artwork.title} by ${artistNames}`,
    description: artwork.description
      ? convert(artwork.description, { wordwrap: false }).slice(0, 160)
      : `${artwork.title} by ${artistNames}`,
    openGraph: artwork.imageUrl
      ? {
          images: [{ url: artwork.imageUrl, alt: artwork.title }],
        }
      : undefined,
  };
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const related = await getRelatedArtworks(
    artwork.id,
    artwork.artists.map((a) => a.id),
    12,
  );

  const yearDisplay = artwork.year
    ? artwork.yearTo
      ? `${artwork.year}–${artwork.yearTo}`
      : String(artwork.year)
    : null;

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
          {/* Image */}
          <div className="flex items-start justify-center">
            {artwork.imageUrl ? (
              <ArtworkImage
                src={artwork.imageUrl}
                alt={artwork.title}
                width={900}
                height={1100}
                className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
                priority
              />
            ) : (
              <div className="flex h-96 w-full items-center justify-center bg-neutral-50 text-neutral-300">
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl italic tracking-tight">
                  {artwork.title}
                </h1>
                <div className="flex items-center gap-1">
                  {artwork.imageUrl && (
                    <DownloadButton
                      imageUrl={artwork.imageUrl}
                      filename={artwork.slug}
                    />
                  )}
                  <CiteButton
                    artist={artwork.artists.map((a) => a.name).join(", ")}
                    title={artwork.title}
                    year={artwork.year}
                    medium={artwork.medium}
                    dimensions={artwork.dimensions}
                    museum={artwork.museum?.name ?? null}
                  />
                  <FavoriteButton
                    id={artwork.id}
                    type="artwork"
                    slug={artwork.slug}
                    title={artwork.title}
                    imageUrl={artwork.thumbnailUrl || artwork.imageUrl}
                    subtitle={artwork.artists.map((a) => a.name).join(", ")}
                    size={22}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {artwork.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.slug}`}
                    className="block text-lg text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {artist.name}
                  </Link>
                ))}
                {yearDisplay && (
                  <p className="text-neutral-400">{yearDisplay}</p>
                )}
              </div>
            </div>

            <dl className="space-y-4 text-sm">
              {artwork.medium && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-neutral-300">
                    Medium
                  </dt>
                  <dd className="mt-1 text-neutral-600">{artwork.medium}</dd>
                </div>
              )}
              {artwork.dimensions && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-neutral-300">
                    Dimensions
                  </dt>
                  <dd className="mt-1 text-neutral-600">
                    {artwork.dimensions}
                  </dd>
                </div>
              )}
              {artwork.genre && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-neutral-300">
                    Genre
                  </dt>
                  <dd className="mt-1">
                    <Link
                      href={`/browse/genres/${artwork.genre.slug}`}
                      className="text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      {artwork.genre.name}
                    </Link>
                  </dd>
                </div>
              )}
              {artwork.museum && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-neutral-300">
                    Museum
                  </dt>
                  <dd className="mt-1">
                    <Link
                      href={`/browse/museums/${artwork.museum.slug}`}
                      className="text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      {artwork.museum.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            {artwork.styles.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-300">
                  Styles
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {artwork.styles.map((style) => (
                    <Link
                      key={style.id}
                      href={`/browse/styles/${style.slug}`}
                      className="border-b border-neutral-200 pb-0.5 text-xs text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                    >
                      {style.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {artwork.tags.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-300">
                  Tags
                </span>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {artwork.tags.map((tag) => (
                    <span key={tag.id} className="text-xs text-neutral-400">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {artwork.description && (
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-300">
                  About
                </span>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {convert(artwork.description, { wordwrap: false })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-8">
          <ScrollRow
            title={
              artwork.artists.length === 1
                ? `More by ${artwork.artists[0].name}`
                : "Related works"
            }
            artworks={related}
          />
        </div>
      )}
    </div>
  );
}
