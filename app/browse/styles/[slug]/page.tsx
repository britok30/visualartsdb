import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { Pagination } from "@/components/pagination";
import { getArtworksByStyle } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArtworksByStyle(slug);
  if (!result) return { title: "Not Found" };
  return {
    alternates: { canonical: `/browse/styles/${slug}` },
    title: result.style.name,
    description: result.style.description
      ? result.style.description.slice(0, 160)
      : `Browse ${result.total.toLocaleString()} artworks in the ${result.style.name} style on VisualArtsDB.`,
  };
}

export default async function StyleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const result = await getArtworksByStyle(slug, page, 24);
  if (!result) notFound();

  const { style, rows, total } = result;
  const totalPages = Math.ceil(total / 24);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/browse/styles"
        className="text-xs text-neutral-300 transition-colors hover:text-neutral-600"
      >
        &larr; All styles
      </Link>
      <h1 className="mt-4 text-4xl italic tracking-tight">{style.name}</h1>
      {style.description && (
        <p className="mt-2 max-w-xl text-sm text-neutral-400">
          {style.description}
        </p>
      )}
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
        href={(p) => `/browse/styles/${slug}?page=${p}`}
      />
    </div>
  );
}
