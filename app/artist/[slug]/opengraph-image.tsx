import { ImageResponse } from "next/og";
import { getArtistBySlug } from "@/lib/db/queries";

export const alt = "Artist on VisualArtsDB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MAGIC = {
  png: [0x89, 0x50, 0x4e, 0x47],
  jpeg: [0xff, 0xd8, 0xff],
  gif: [0x47, 0x49, 0x46, 0x38],
} as const;

function detectMime(bytes: Uint8Array): string | null {
  if (MAGIC.png.every((b, i) => bytes[i] === b)) return "image/png";
  if (MAGIC.jpeg.every((b, i) => bytes[i] === b)) return "image/jpeg";
  if (MAGIC.gif.every((b, i) => bytes[i] === b)) return "image/gif";
  return null;
}

async function fetchImageAsDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 8 || buf.byteLength > 4_000_000) return null;
    const mime = detectMime(new Uint8Array(buf));
    if (!mime) return null;
    const base64 = Buffer.from(buf).toString("base64");
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

function sanitize(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}\p{S}]/gu, "")
    .slice(0, 200);
}

interface OgData {
  name: string;
  subtitle: string;
  styleNames: string;
  portraitDataUri: string | null;
}

async function getOgData(slug: string): Promise<OgData | null> {
  try {
    const artist = await getArtistBySlug(slug);
    if (!artist) return null;

    const name = sanitize(artist.name);
    const lifespan = [
      artist.birthYear && `b. ${artist.birthYear}`,
      artist.deathYear && `d. ${artist.deathYear}`,
    ]
      .filter(Boolean)
      .join(" - ");

    const subtitle = sanitize(
      [artist.nationality, lifespan].filter(Boolean).join(" · "),
    );
    const styleNames = sanitize(
      artist.styles.slice(0, 4).map((s) => s.name).join(", "),
    );

    const portraitDataUri = artist.portraitUrl
      ? await fetchImageAsDataUri(artist.portraitUrl)
      : null;

    return { name, subtitle, styleNames, portraitDataUri };
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
      <div style={{ fontSize: 42, fontStyle: "italic", color: "#171717" }}>
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

function PortraitOg({ data }: { data: OgData & { portraitDataUri: string } }) {
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
          width: "40%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <img
          src={data.portraitDataUri}
          alt={data.name}
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
          {data.name}
        </div>
        <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>
          {data.subtitle}
        </div>
        <div style={{ fontSize: 14, color: "#a3a3a3", marginTop: 20 }}>
          {data.styleNames}
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

  if (data.portraitDataUri) {
    return new ImageResponse(
      <PortraitOg data={data as OgData & { portraitDataUri: string }} />,
      size,
    );
  }

  return new ImageResponse(
    <TextOnlyOg title={data.name} subtitle={data.subtitle} />,
    size,
  );
}
