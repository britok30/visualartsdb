  "use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  subscribeFavorites,
  type FavoriteItem,
  type FavoriteType,
} from "@/lib/favorites";

const SERVER_SNAPSHOT: FavoriteItem[] = [];
const getServerSnapshot = () => SERVER_SNAPSHOT;

interface FavoriteButtonProps {
  id: string;
  type: FavoriteType;
  slug: string;
  title: string;
  imageUrl: string | null;
  subtitle?: string | null;
  size?: number;
  variant?: "default" | "overlay";
}

export function FavoriteButton({
  id,
  type,
  slug,
  title,
  imageUrl,
  subtitle,
  size = 18,
  variant = "default",
}: FavoriteButtonProps) {
  // useSyncExternalStore hydrates with the (empty) server snapshot, then
  // re-renders with the real localStorage value — no hydration mismatch, and
  // no manual event wiring. Reading localStorage in a useState initializer
  // previously caused mismatch errors for anyone with saved items.
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavorites,
    getServerSnapshot,
  );
  const saved = favorites.some((f) => f.id === id);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFavorite(id);
    } else {
      addFavorite({ id, type, slug, title, imageUrl, subtitle });
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      className={
        variant === "overlay"
          ? "text-white/70 hover:bg-transparent hover:text-white"
          : "text-neutral-300 hover:bg-transparent hover:text-neutral-900"
      }
      aria-label={saved ? "Remove from favorites" : "Add to favorites"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={saved ? "filled" : "outline"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="block"
        >
          <Heart
            size={size}
            strokeWidth={1.5}
            className={
              saved
                ? variant === "overlay"
                  ? "fill-white text-white"
                  : "fill-neutral-900 text-neutral-900"
                : ""
            }
          />
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
