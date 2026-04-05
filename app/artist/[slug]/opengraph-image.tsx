import { ImageResponse } from "next/og";
import { getArtistBySlug } from "@/lib/db/queries";

export const alt = "Artist on VisualArtsDB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
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

  const lifespan = [
    artist.birthYear && `b. ${artist.birthYear}`,
    artist.deathYear && `d. ${artist.deathYear}`,
  ]
    .filter(Boolean)
    .join(" — ");

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
        {artist.portraitUrl && (
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
              src={artist.portraitUrl}
              alt={artist.name}
              style={{
                width: 280,
                height: 280,
                borderRadius: "50%",
                objectFit: "cover",
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
            width: artist.portraitUrl ? "60%" : "100%",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontStyle: "italic",
              color: "#171717",
            }}
          >
            {artist.name}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#737373",
              marginTop: 16,
            }}
          >
            {[artist.nationality, lifespan].filter(Boolean).join(" · ")}
          </div>
          {artist.styles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 20,
              }}
            >
              {artist.styles.slice(0, 4).map((style) => (
                <div
                  key={style.id}
                  style={{
                    fontSize: 14,
                    color: "#a3a3a3",
                    borderBottom: "1px solid #e5e5e5",
                    paddingBottom: 2,
                  }}
                >
                  {style.name}
                </div>
              ))}
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
