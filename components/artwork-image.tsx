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
  /** Target rendered width (CSS px × DPR); enables Cloudflare resizing. */
  displayWidth?: number;
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
  displayWidth,
}: ArtworkImageProps) {
  const candidates = imageSrcCandidates(src, displayWidth);
  const [index, setIndex] = useState(0);

  // Above-the-fold images: open the TLS connection to the museum host during
  // SSR (React dedupes and emits <link rel="preconnect"> in <head>). Only
  // for cross-origin absolute URLs; same-origin proxy/CF paths need nothing.
  if (priority && /^https?:\/\//.test(candidates[0])) {
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
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
