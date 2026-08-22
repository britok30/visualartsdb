"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { preconnect } from "react-dom";
import { useState } from "react";
import { imageSrcCandidates } from "@/lib/artwork-image-url";

interface ArtworkImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: "eager" | "lazy";
  priority?: boolean;
  /**
   * Route through Vercel Image Optimization (resized WebP, 1600px bucket).
   * Reserved for the artwork-page hero — every optimized image is a billed
   * unique transform, and cards already get museum thumbnails.
   */
  optimize?: boolean;
}

function Placeholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-300 ${className ?? ""}`}
    >
      <ImageOff size={48} strokeWidth={1} />
    </div>
  );
}

export function ArtworkImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  loading,
  priority,
  optimize = false,
}: ArtworkImageProps) {
  const candidates = imageSrcCandidates(src);
  const [index, setIndex] = useState(0);
  // First failure of an optimized hero (402 over quota, 400 unknown host,
  // upstream timeout) retries the same URL straight from the museum.
  const [optimizeFailed, setOptimizeFailed] = useState(false);
  const optimized = optimize && !optimizeFailed;

  // Above-the-fold images: open the TLS connection to the museum host during
  // SSR (React dedupes and emits <link rel="preconnect"> in <head>). Only
  // for direct cross-origin loads; optimized heroes and the /img/aic proxy
  // are served from our own origin.
  if (priority && !optimized && /^https?:\/\//.test(candidates[0])) {
    preconnect(new URL(candidates[0]).origin);
  }

  if (index >= candidates.length) {
    return (
      <Placeholder className={fill ? undefined : "aspect-3/4 rounded-lg"} />
    );
  }

  return (
    <Image
      src={candidates[index]}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      // `priority` already implies eager + fetchPriority="high"; passing
      // loading alongside it triggers a Next warning.
      loading={priority ? undefined : loading}
      priority={priority}
      unoptimized={!optimized}
      onError={() => {
        if (optimized) setOptimizeFailed(true);
        else setIndex((i) => i + 1);
      }}
    />
  );
}
