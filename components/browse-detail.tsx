import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { Pagination } from "@/components/pagination";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  getArtworksByStyle,
  getArtworksByGenre,
  getArtworksByMuseum,
} from "@/lib/db/queries";

// Shared engine for the three browse detail routes (styles/genres/museums).
// Pagination is path-based (/browse/<kind>/<slug>/page/<n>) so every page is
// statically rendered with a self-referential canonical — the previous
// ?page= form forced dynamic rendering on every request and canonicalized
// paginated content to page 1, hiding it from crawlers.

export type BrowseKind = "styles" | "genres" | "museums";
export const BROWSE_PER_PAGE = 24;

const KIND_LABEL: Record<BrowseKind, string> = {
  styles: "Styles",
  genres: "Genres",
  museums: "Museums",
};

export function browsePageHref(kind: BrowseKind, slug: string, page: number) {
  return page <= 1
    ? `/browse/${kind}/${slug}`
    : `/browse/${kind}/${slug}/page/${page}`;
}

export function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

interface BrowseDetail {
  name: string;
  subtitle: string | null;
  metaDescription: string;
  rows: Array<{
    id: string;
    title: string;
    slug: string;
    year: number | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    artistName: string | null;
  }>;
  total: number;
}

// cache(): generateMetadata and the page body both need this per request.
const getDetail = cache(
  async (
    kind: BrowseKind,
    slug: string,
    page: number,
  ): Promise<BrowseDetail | null> => {
    if (kind === "styles") {
      const r = await getArtworksByStyle(slug, page, BROWSE_PER_PAGE);
      if (!r) return null;
      return {
        name: r.style.name,
        subtitle: r.style.description,
        metaDescription: r.style.description
          ? r.style.description.slice(0, 160)
          : `Browse ${r.total.toLocaleString()} artworks in the ${r.style.name} style on VisualArtsDB.`,
        rows: r.rows,
        total: r.total,
      };
    }
    if (kind === "genres") {
      const r = await getArtworksByGenre(slug, page, BROWSE_PER_PAGE);
      if (!r) return null;
      return {
        name: r.genre.name,
        subtitle: r.genre.description,
        metaDescription: r.genre.description
          ? r.genre.description.slice(0, 160)
          : `Browse ${r.total.toLocaleString()} ${r.genre.name} artworks on VisualArtsDB.`,
        rows: r.rows,
        total: r.total,
      };
    }
    const r = await getArtworksByMuseum(slug, page, BROWSE_PER_PAGE);
    if (!r) return null;
    const location = [r.museum.city, r.museum.country]
      .filter(Boolean)
      .join(", ");
    return {
      name: r.museum.name,
      subtitle: location || null,
      metaDescription: `Browse ${r.total.toLocaleString()} artworks from ${r.museum.name}${location ? ` in ${location}` : ""} on VisualArtsDB.`,
      rows: r.rows,
      total: r.total,
    };
  },
);

export async function getBrowseMetadata(
  kind: BrowseKind,
  slug: string,
  page: number,
): Promise<Metadata> {
  const detail = await getDetail(kind, slug, page);
  if (!detail) notFound();

  return {
    alternates: { canonical: browsePageHref(kind, slug, page) },
    title: page > 1 ? `${detail.name} — Page ${page}` : detail.name,
    description:
      page > 1
        ? `${detail.name} artworks, page ${page}.`
        : detail.metaDescription,
  };
}

export async function BrowseDetailContent({
  kind,
  slug,
  page,
}: {
  kind: BrowseKind;
  slug: string;
  page: number;
}) {
  const detail = await getDetail(kind, slug, page);
  if (!detail) notFound();

  const { name, subtitle, rows, total } = detail;
  const totalPages = Math.max(1, Math.ceil(total / BROWSE_PER_PAGE));
  if (page > totalPages) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: KIND_LABEL[kind], href: `/browse/${kind}` },
          { name },
        ]}
      />
      <h1 className="mt-4 text-4xl italic tracking-tight">{name}</h1>
      {subtitle && (
        <p className="mt-2 max-w-xl text-sm text-neutral-400">{subtitle}</p>
      )}
      <p className="mt-1 text-xs text-neutral-400">
        {total.toLocaleString()} artwork{total !== 1 && "s"}
        {page > 1 && ` — page ${page} of ${totalPages}`}
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
        href={(p) => browsePageHref(kind, slug, p)}
      />
    </div>
  );
}
