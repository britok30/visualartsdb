"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArtworkCard } from "./artwork-card";

type RowArtwork = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  artistName: string;
  artistSlug: string;
  year: number | null;
};

interface ScrollRowProps {
  title: string;
  href?: string;
  artworks: RowArtwork[];
  priority?: boolean;
  /**
   * When set, `artworks` is treated as a POOL: render a random `shuffleTo`-sized
   * subset, reshuffled on each visit (client-side, after hydration). Lets the
   * homepage stay fully static yet show different picks every time, with zero
   * per-request DB work. Omit it to render `artworks` as-is (e.g. related rows).
   */
  shuffleTo?: number;
}

// Partial Fisher–Yates: a uniformly random `n`-sized sample of `arr`.
function sample<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export function ScrollRow({
  title,
  href,
  artworks,
  priority = false,
  shuffleTo,
}: ScrollRowProps) {
  // SSR / first client render: deterministic first slice so the static HTML and
  // hydration match (no mismatch errors). After mount, swap to a random sample —
  // this runs per visit, so each load shows different artworks.
  const [items, setItems] = useState<RowArtwork[]>(() =>
    shuffleTo ? artworks.slice(0, shuffleTo) : artworks,
  );

  useEffect(() => {
    if (!shuffleTo) return;
    const id = window.setTimeout(() => {
      setItems(sample(artworks, shuffleTo));
    }, 0);
    return () => window.clearTimeout(id);
  }, [artworks, shuffleTo]);

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mb-5 flex items-baseline justify-between px-6">
        <h2 className="text-2xl italic tracking-tight">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-xs tracking-wide text-neutral-400 transition-colors hover:text-neutral-900"
          >
            View all
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-6">
        {items.map((artwork, i) => (
          <ArtworkCard
            key={artwork.id}
            id={artwork.id}
            slug={artwork.slug}
            title={artwork.title}
            imageUrl={artwork.imageUrl}
            thumbnailUrl={artwork.thumbnailUrl}
            artistName={artwork.artistName}
            year={artwork.year}
            priority={priority && i < 5}
            size="tall"
          />
        ))}
      </div>
    </motion.section>
  );
}
