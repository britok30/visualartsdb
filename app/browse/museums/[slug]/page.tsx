import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { Pagination } from "@/components/pagination";
import { getArtworksByMuseum } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArtworksByMuseum(slug);
  if (!result) return { title: "Not Found" };
  const location = [result.museum.city, result.museum.country].filter(Boolean).join(", ");
  return {
    title: result.museum.name,
    description: `Browse ${result.total.toLocaleString()} artworks from ${result.museum.name}${location ? ` in ${location}` : ""} on VisualArtsDB.`,
  };
}

export default async function MuseumDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const result = await getArtworksByMuseum(slug, page, 24);
  if (!result) notFound();

  const { museum, rows, total } = result;
  const totalPages = Math.ceil(total / 24);
  const location = [museum.city, museum.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/browse/museums"
        className="text-xs text-neutral-300 transition-colors hover:text-neutral-600"
      >
        &larr; All museums
      </Link>
      <h1 className="mt-4 text-4xl italic tracking-tight">{museum.name}</h1>
      {location && <p className="mt-1 text-sm text-neutral-400">{location}</p>}
      <p className="mt-1 text-xs text-neutral-300">
        {total.toLocaleString()} artwork{total !== 1 && "s"}
      </p>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((artwork, i) => (
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

      <Pagination
        page={page}
        totalPages={totalPages}
        href={(p) => `/browse/museums/${slug}?page=${p}`}
      />
    </div>
  );
}
