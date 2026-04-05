import { ImageResponse } from "next/og";
import { getArtistBySlug } from "@/lib/db/queries";

export const alt = "Artist on VisualArtsDB";
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
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    return new ImageResponse(<Fallback />, size);
  }

  const lifespan = [
    artist.birthYear && `b. ${artist.birthYear}`,
    artist.deathYear && `d. ${artist.deathYear}`,
  ]
    .filter(Boolean)
    .join(" — ");

  const subtitle = [artist.nationality, lifespan].filter(Boolean).join(" · ");
  const styleNames = artist.styles.slice(0, 4).map((s) => s.name).join(", ");

  const portraitDataUri = artist.portraitUrl
    ? await fetchImageAsDataUri(artist.portraitUrl)
    : null;

  if (portraitDataUri) {
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
              width: "40%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              padding: 48,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portraitDataUri}
              alt={artist.name}
              style={{
                width: 280,
                height: 280,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 48,
              width: "60%",
            }}
          >
            <div style={{ fontSize: 42, fontStyle: "italic", color: "#171717" }}>
              {artist.name}
            </div>
            <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>
              {subtitle}
            </div>
            <div style={{ fontSize: 14, color: "#a3a3a3", marginTop: 20 }}>
              {styleNames}
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
        <div style={{ fontSize: 42, fontStyle: "italic", color: "#171717" }}>
          {artist.name}
        </div>
        <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 14, color: "#a3a3a3", marginTop: 20 }}>
          {styleNames}
        </div>
        <div style={{ fontSize: 16, color: "#d4d4d4", marginTop: 32 }}>
          VisualArtsDB
        </div>
      </div>
    ),
    size,
  );
}
