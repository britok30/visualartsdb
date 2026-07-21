import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { SITE_STATS } from "@/lib/constants";
import {
  getStylesWithCounts,
  getGenresWithCounts,
  getMuseumsWithCounts,
  countStyles,
  countGenres,
  countMuseums,
} from "@/lib/db/queries";

// Shared engine for the three browse index routes. Previously each page
// showed a fixed 200 entries with no pagination, leaving ~90% of styles and
// genres unreachable by browsing (while the sitemap advertised them all).
// Path-based pagination (/browse/<kind>/page/<n>) keeps every page static.

export type BrowseKind = "styles" | "genres" | "museums";
export const INDEX_PER_PAGE = 200;

interface IndexRow {
  id: string;
  name: string;
  slug: string;
  count: number;
  location?: string | null;
}

const CONFIG: Record<
  BrowseKind,
  {
    title: string;
    tagline: string;
    metaDescription: string;
    fetch: (page: number) => Promise<IndexRow[]>;
    total: () => Promise<number>;
  }
> = {
  styles: {
    title: "Styles",
    tagline: "Browse artworks by artistic style",
    metaDescription: `Explore artworks by artistic style — Impressionism, Surrealism, Cubism, Baroque, Pop Art, Realism, and ${SITE_STATS.styles} more movements.`,
    fetch: async (page) => getStylesWithCounts(page, INDEX_PER_PAGE),
    total: countStyles,
  },
  genres: {
    title: "Genres",
    tagline: "Browse artworks by genre",
    metaDescription: `Explore artworks by genre — paintings, sculpture, photography, drawings, prints, and ${SITE_STATS.genres} more categories.`,
    fetch: async (page) => getGenresWithCounts(page, INDEX_PER_PAGE),
    total: countGenres,
  },
  museums: {
    title: "Museums",
    tagline: "Browse artworks by institution",
    metaDescription: `Explore artworks by museum — Art Institute of Chicago, MoMA, Rijksmuseum, the MET, Cleveland Museum of Art, and ${SITE_STATS.museums} more institutions.`,
    fetch: async (page) =>
      (await getMuseumsWithCounts(page, INDEX_PER_PAGE)).map((m) => ({
        ...m,
        location: [m.city, m.country].filter(Boolean).join(", ") || null,
      })),
    total: countMuseums,
  },
};

export function browseIndexHref(kind: BrowseKind, page: number) {
  return page <= 1 ? `/browse/${kind}` : `/browse/${kind}/page/${page}`;
}

export function getBrowseIndexMetadata(
  kind: BrowseKind,
  page: number,
): Metadata {
  const cfg = CONFIG[kind];
  return {
    alternates: { canonical: browseIndexHref(kind, page) },
    title:
      page > 1 ? `Browse ${cfg.title} — Page ${page}` : `Browse ${cfg.title}`,
    description:
      page > 1
        ? `${cfg.title} on VisualArtsDB, page ${page}.`
        : cfg.metaDescription,
  };
}

export async function BrowseIndexContent({
  kind,
  page,
}: {
  kind: BrowseKind;
  page: number;
}) {
  const cfg = CONFIG[kind];
  const [rows, total] = await Promise.all([cfg.fetch(page), cfg.total()]);
  const totalPages = Math.max(1, Math.ceil(total / INDEX_PER_PAGE));
  if (page > totalPages || (page > 1 && rows.length === 0)) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">{cfg.title}</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {cfg.tagline}
        {page > 1 && ` — page ${page} of ${totalPages}`}
      </p>

      <div className="mt-12 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={`/browse/${kind}/${row.slug}`}
            className="group flex items-baseline justify-between py-2"
          >
            <div>
              <span className="text-sm text-neutral-600 transition-colors group-hover:text-neutral-900">
                {row.name}
              </span>
              {row.location && (
                <span className="ml-2 text-xs text-neutral-400">
                  {row.location}
                </span>
              )}
            </div>
            <span className="ml-4 shrink-0 text-xs text-neutral-400">
              {row.count.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        href={(p) => browseIndexHref(kind, p)}
      />
    </div>
  );
}
