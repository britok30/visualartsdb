"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

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

function stripWikiArtSuffix(url: string): string | null {
  const match = url.match(/^(.+)![^/]+$/);
  return match ? match[1] : null;
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
}: ArtworkImageProps) {
  const fallbackSrc = stripWikiArtSuffix(src);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  function handleError() {
    if (currentSrc === src && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <Placeholder className={fill ? undefined : "aspect-3/4 rounded-lg"} />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      loading={loading}
      priority={priority}
      onError={handleError}
    />
  );
}
