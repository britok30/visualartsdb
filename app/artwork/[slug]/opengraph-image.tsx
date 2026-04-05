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
    if (buf.byteLength > 4_000_000) return null;
    const base64 = Buffer.from(buf).toString("base64");
    return `data:${ct};base64,${base64}`;
  } catch {
    return null;
  }
}

function sanitize(text: string): string {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "").slice(0, 200);
}

interface OgData {
  title: string;
  artistNames: string;
  year: string;
  imageDataUri: string | null;
}

async function getOgData(slug: string): Promise<OgData | null> {
  try {
    const artwork = await getArtworkBySlug(slug);
    if (!artwork) return null;

    const title = sanitize(artwork.title);
    const artistNames = sanitize(
      artwork.artists.map((a) => a.name).join(", "),
    );
    const year = artwork.year
      ? artwork.yearTo
        ? `${artwork.year}-${artwork.yearTo}`
        : String(artwork.year)
      : "";

    const imageDataUri = artwork.imageUrl
      ? await fetchImageAsDataUri(artwork.imageUrl)
      : null;

    return { title, artistNames, year, imageDataUri };
  } catch {
    return null;
  }
}

function TextOnlyOg({ title, subtitle }: { title: string; subtitle: string }) {
  return (
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
        {title}
      </div>
      <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>
        {subtitle}
      </div>
      <div style={{ fontSize: 16, color: "#d4d4d4", marginTop: 32 }}>
        VisualArtsDB
      </div>
    </div>
  );
}

function ImageOg({ data }: { data: OgData & { imageDataUri: string } }) {
  return (
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
        <img
          src={data.imageDataUri}
          alt={data.title}
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
          {data.title}
        </div>
        <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>
          {data.artistNames}
        </div>
        <div style={{ fontSize: 18, color: "#a3a3a3", marginTop: 8 }}>
          {data.year}
        </div>
        <div style={{ fontSize: 16, color: "#d4d4d4", marginTop: 32 }}>
          VisualArtsDB
        </div>
      </div>
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getOgData(slug);

  if (!data) {
    return new ImageResponse(
      <TextOnlyOg title="VisualArtsDB" subtitle="Explore the World's Art" />,
      size,
    );
  }

  if (data.imageDataUri) {
    return new ImageResponse(
      <ImageOg data={data as OgData & { imageDataUri: string }} />,
      size,
    );
  }

  return new ImageResponse(
    <TextOnlyOg title={data.title} subtitle={data.artistNames} />,
    size,
  );
}
