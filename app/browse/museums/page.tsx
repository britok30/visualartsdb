import Link from "next/link";
import type { Metadata } from "next";
import { SITE_STATS } from "@/lib/constants";
import { getMuseumsWithCounts } from "@/lib/db/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/browse/museums" },
  title: "Browse Museums",
  description: `Explore artworks by museum — Art Institute of Chicago, MoMA, Rijksmuseum, the MET, Cleveland Museum of Art, and ${SITE_STATS.museums} more institutions.`,
};

export default async function MuseumsPage() {
  const museums = await getMuseumsWithCounts(1, 200);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Museums</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Browse artworks by institution
      </p>

      <div className="mt-12 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {museums.map((museum) => (
          <Link
            key={museum.id}
            href={`/browse/museums/${museum.slug}`}
            className="group flex items-baseline justify-between py-2"
          >
            <div>
              <span className="text-sm text-neutral-600 transition-colors group-hover:text-neutral-900">
                {museum.name}
              </span>
              {(museum.city || museum.country) && (
                <span className="ml-2 text-xs text-neutral-300">
                  {[museum.city, museum.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
            <span className="ml-4 shrink-0 text-xs text-neutral-300">
              {museum.count.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
