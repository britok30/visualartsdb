"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArtworkImage } from "./artwork-image";

interface TimelineArtwork {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
}

interface ArtistTimelineProps {
  artworks: TimelineArtwork[];
  birthYear?: number | null;
  deathYear?: number | null;
}

export function ArtistTimeline({
  artworks,
  birthYear,
  deathYear,
}: ArtistTimelineProps) {
  const dated = artworks
    .filter((a) => a.year !== null)
    .sort((a, b) => a.year! - b.year!);

  if (dated.length < 3) return null;

  // Group by decade
  const decades = new Map<number, TimelineArtwork[]>();
  for (const artwork of dated) {
    const decade = Math.floor(artwork.year! / 10) * 10;
    if (!decades.has(decade)) decades.set(decade, []);
    decades.get(decade)!.push(artwork);
  }

  const sortedDecades = [...decades.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <section className="mt-20">
      <h2 className="text-xl italic tracking-tight px-6">Timeline</h2>
      {(birthYear || deathYear) && (
        <p className="mt-1 px-6 text-xs text-neutral-300">
          {birthYear && `Born ${birthYear}`}
          {birthYear && deathYear && " — "}
          {deathYear && `Died ${deathYear}`}
        </p>
      )}

      <div className="no-scrollbar mt-8 flex gap-12 overflow-x-auto px-6 pb-4">
        {sortedDecades.map(([decade, works], di) => (
          <motion.div
            key={decade}
            className="shrink-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: di * 0.05, duration: 0.3 }}
          >
            <span className="text-sm font-light text-neutral-400">
              {decade}s
            </span>
            <div className="mt-3 flex gap-3">
              {works.slice(0, 4).map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/artwork/${artwork.slug}`}
                  className="group shrink-0"
                >
                  <div className="relative h-32 w-24 overflow-hidden bg-neutral-50">
                    {(artwork.imageUrl || artwork.thumbnailUrl) ? (
                      <ArtworkImage
                        src={artwork.imageUrl || artwork.thumbnailUrl!}
                        alt={artwork.title}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-200 text-[8px]">
                        {artwork.year}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 max-w-24 text-[10px] leading-tight text-neutral-400 line-clamp-2">
                    {artwork.title}
                  </p>
                </Link>
              ))}
              {works.length > 4 && (
                <div className="flex h-32 w-16 shrink-0 items-center justify-center text-[10px] text-neutral-300">
                  +{works.length - 4}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
