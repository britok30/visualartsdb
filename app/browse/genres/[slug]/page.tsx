import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { Pagination } from "@/components/pagination";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getArtworksByGenre } from "@/lib/db/queries";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArtworksByGenre(slug);
  if (!result) return { title: "Not Found" };
  return {
    alternates: { canonical: `/browse/genres/${slug}` },
    title: result.genre.name,
    description: result.genre.description
      ? result.genre.description.slice(0, 160)
      : `Browse ${result.total.toLocaleString()} ${result.genre.name} artworks on VisualArtsDB.`,
  };
}

export default async function GenreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const result = await getArtworksByGenre(slug, page, 24);
  if (!result) notFound();

  const { genre, rows, total } = result;
  const totalPages = Math.ceil(total / 24);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Genres", href: "/browse/genres" },
          { name: genre.name },
        ]}
      />
      <h1 className="mt-4 text-4xl italic tracking-tight">{genre.name}</h1>
      {genre.description && (
        <p className="mt-2 max-w-xl text-sm text-neutral-400">
          {genre.description}
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
        href={(p) => `/browse/genres/${slug}?page=${p}`}
      />
    </div>
  );
}
