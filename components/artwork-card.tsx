import Link from "next/link";
import { ImageOff } from "lucide-react";
import { ArtworkImage } from "./artwork-image";
import { FavoriteButton } from "./favorite-button";

interface ArtworkCardProps {
  id?: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  artistName?: string | null;
  artistSlug?: string | null;
  year?: number | null;
  priority?: boolean;
  size?: "default" | "tall";
}

export function ArtworkCard({
  id,
  slug,
  title,
  imageUrl,
  thumbnailUrl,
  artistName,
  year,
  priority = false,
  size = "default",
}: ArtworkCardProps) {
  const src = imageUrl || thumbnailUrl;
  const sizeClass =
    size === "tall" ? "h-[320px] w-[220px] sm:h-[420px] sm:w-[280px]" : "h-[320px] w-full";

  return (
    <div className="group relative shrink-0">
      <Link href={`/artwork/${slug}`} className="block">
        <div
          className={`relative ${sizeClass} overflow-hidden bg-neutral-50`}
        >
          {src ? (
            <ArtworkImage
              src={src}
              alt={title}
              fill
              sizes="300px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-200">
              <ImageOff size={32} strokeWidth={1} />
            </div>
          )}
        </div>
        <div className="mt-3 max-w-55 sm:max-w-70">
          <h3 className="text-sm leading-snug text-neutral-900 line-clamp-2 wrap-break-word">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-400">
            {artistName}
            {year ? `, ${year}` : ""}
          </p>
        </div>
      </Link>
      {id && (
        <div className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <FavoriteButton
            id={id}
            type="artwork"
            slug={slug}
            title={title}
            imageUrl={src ?? null}
            subtitle={artistName}
            size={16}
            variant="overlay"
          />
        </div>
      )}
    </div>
  );
}
