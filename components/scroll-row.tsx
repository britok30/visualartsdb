"use client";

import Link from "next/link";
import { v4 as uuid } from "uuid";
import { motion } from "framer-motion";
import { ArtworkCard } from "./artwork-card";

interface ScrollRowProps {
  title: string;
  href?: string;
  artworks: {
    id: string;
    slug: string;
    title: string;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    artistName: string;
    artistSlug: string;
    year: number | null;
  }[];
  priority?: boolean;
}

export function ScrollRow({
  title,
  href,
  artworks,
  priority = false,
}: ScrollRowProps) {
  if (artworks.length === 0) return null;

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
        {artworks.map((artwork, i) => (
          <ArtworkCard
            key={uuid()}
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
