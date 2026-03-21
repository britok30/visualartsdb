"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArtworkImage } from "@/components/artwork-image";
import {
  getFavorites,
  removeFavorite,
  type FavoriteItem,
} from "@/lib/favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());

    function sync() {
      setFavorites(getFavorites());
    }
    window.addEventListener("favorites-changed", sync);
    return () => window.removeEventListener("favorites-changed", sync);
  }, []);

  const artworks = favorites.filter((f) => f.type === "artwork");
  const artists = favorites.filter((f) => f.type === "artist");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Favorites</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {favorites.length === 0
          ? "Your favorites are saved locally in this browser."
          : `${favorites.length} saved item${favorites.length !== 1 ? "s" : ""}`}
      </p>

      {favorites.length === 0 && (
        <div className="mt-20 flex flex-col items-center text-center">
          <Heart size={48} strokeWidth={1} className="text-neutral-200" />
          <p className="mt-6 text-neutral-400">No favorites yet.</p>
          <p className="mt-1 text-sm text-neutral-300">
            Hover over any artwork and click the heart to save it here.
          </p>
          <Link
            href="/"
            className="mt-8 border-b border-neutral-200 pb-0.5 text-sm text-neutral-400 transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            Start exploring
          </Link>
        </div>
      )}

      {/* Artists */}
      {artists.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl italic tracking-tight">Artists</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {artists.map((artist) => (
                <motion.div
                  key={artist.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-4 py-3"
                >
                  <Link
                    href={`/artist/${artist.slug}`}
                    className="flex flex-1 items-center gap-4"
                  >
                    {artist.imageUrl ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                        <ArtworkImage
                          src={artist.imageUrl}
                          alt={artist.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-xs text-neutral-300">
                        {artist.title[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-sm text-neutral-800">
                        {artist.title}
                      </span>
                      {artist.subtitle && (
                        <p className="text-xs text-neutral-400">
                          {artist.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(artist.id)}
                    className="text-neutral-300 transition-colors hover:text-neutral-900"
                  >
                    <Heart
                      size={14}
                      strokeWidth={1.5}
                      className="fill-neutral-900 text-neutral-900"
                    />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Artworks */}
      {artworks.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl italic tracking-tight">Artworks</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {artworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <Link href={`/artwork/${artwork.slug}`} className="block">
                    <div className="relative h-[320px] w-full overflow-hidden bg-neutral-50">
                      {artwork.imageUrl ? (
                        <ArtworkImage
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-200">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm leading-snug text-neutral-900 line-clamp-2">
                        {artwork.title}
                      </h3>
                      {artwork.subtitle && (
                        <p className="mt-0.5 text-xs text-neutral-400">
                          {artwork.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(artwork.id)}
                    className="absolute right-2 top-2 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.5}
                      className="fill-neutral-900 text-neutral-900"
                    />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}
