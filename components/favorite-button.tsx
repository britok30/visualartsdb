  "use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  addFavorite,
  removeFavorite,
  isFavorite,
  type FavoriteType,
} from "@/lib/favorites";

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
  const [saved, setSaved] = useState(() => isFavorite(id));

  useEffect(() => {
    function onChanged() {
      setSaved(isFavorite(id));
    }
    window.addEventListener("favorites-changed", onChanged);
    return () => window.removeEventListener("favorites-changed", onChanged);
  }, [id]);

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
