import { ImageResponse } from "next/og";
import { getArtworkBySlug } from "@/lib/db/queries";

export const alt = "Artwork on VisualArtsDB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SUPPORTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/svg+xml",
]);

async function fetchImageAsDataUri(
  url: string,
): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type")?.split(";")[0].trim();
    if (!ct || !SUPPORTED_TYPES.has(ct)) return null;
    const buf = await res.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    return `data:${ct};base64,${base64}`;
  } catch {
    return null;
  }
}

function Fallback() {
  return (
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
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return new ImageResponse(<Fallback />, size);
  }

  const artistNames = artwork.artists.map((a) => a.name).join(", ");
  const imageDataUri = artwork.imageUrl
    ? await fetchImageAsDataUri(artwork.imageUrl)
    : null;

  const year = artwork.year
    ? artwork.yearTo
      ? `${artwork.year}–${artwork.yearTo}`
      : String(artwork.year)
    : "";

  if (imageDataUri) {
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
              src={imageDataUri}
              alt={artwork.title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 48,
              width: "50%",
            }}
          >
            <div style={{ fontSize: 36, fontStyle: "italic", color: "#171717" }}>
              {artwork.title}
            </div>
            <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>
              {artistNames}
            </div>
            <div style={{ fontSize: 18, color: "#a3a3a3", marginTop: 8 }}>
              {year}
            </div>
            <div style={{ fontSize: 16, color: "#d4d4d4", marginTop: 32 }}>
              VisualArtsDB
            </div>
          </div>
        </div>
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#fafafa",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 36, fontStyle: "italic", color: "#171717" }}>
          {artwork.title}
        </div>
        <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>
          {artistNames}
        </div>
        <div style={{ fontSize: 18, color: "#a3a3a3", marginTop: 8 }}>
          {year}
        </div>
        <div style={{ fontSize: 16, color: "#d4d4d4", marginTop: 32 }}>
          VisualArtsDB
        </div>
      </div>
    ),
    size,
  );
}
