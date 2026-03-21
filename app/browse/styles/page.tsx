import Link from "next/link";
import type { Metadata } from "next";
import { SITE_STATS } from "@/lib/constants";
import { getStylesWithCounts } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Browse Styles",
  description: `Explore artworks by artistic style — Impressionism, Surrealism, Cubism, Baroque, Pop Art, Realism, and ${SITE_STATS.styles} more movements.`,
};

export default async function StylesPage() {
  const styles = await getStylesWithCounts(1, 200);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Styles</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Browse artworks by artistic style
      </p>

      <div className="mt-12 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {styles.map((style) => (
          <Link
            key={style.id}
            href={`/browse/styles/${style.slug}`}
            className="group flex items-baseline justify-between py-2"
          >
            <span className="text-sm text-neutral-600 transition-colors group-hover:text-neutral-900">
              {style.name}
            </span>
            <span className="ml-4 text-xs text-neutral-300">
              {style.count.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
