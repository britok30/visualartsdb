import { ImageResponse } from "next/og";
import { getArtworkBySlug } from "@/lib/db/queries";

export const alt = "Artwork on VisualArtsDB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#fafafa",
            fontSize: 32,
            color: "#a3a3a3",
          }}
        >
          VisualArtsDB
        </div>
      ),
      size,
    );
  }

  const artistNames = artwork.artists.map((a) => a.name).join(", ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#fafafa",
        }}
      >
        {artwork.imageUrl && (
          <div
            style={{
              display: "flex",
              width: "50%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 48,
            width: artwork.imageUrl ? "50%" : "100%",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontStyle: "italic",
              color: "#171717",
              lineClamp: 3,
            }}
          >
            {artwork.title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#737373",
              marginTop: 16,
            }}
          >
            {artistNames}
          </div>
          {artwork.year && (
            <div
              style={{
                fontSize: 18,
                color: "#a3a3a3",
                marginTop: 8,
              }}
            >
              {artwork.year}
            </div>
          )}
          <div
            style={{
              fontSize: 16,
              color: "#d4d4d4",
              marginTop: 32,
            }}
          >
            VisualArtsDB
          </div>
        </div>
      </div>
    ),
    size,
  );
}
