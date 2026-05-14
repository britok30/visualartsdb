import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      // WikiArt
      new URL("https://uploads*.wikiart.org/**"),
      // Art Institute of Chicago (IIIF)
      new URL("https://www.artic.edu/**"),
      new URL("https://lakeimagesweb.artic.edu/**"),
      // Rijksmuseum
      new URL("https://lh3.googleusercontent.com/**"),
      // MET Museum
      new URL("https://images.metmuseum.org/**"),
    ],
  },
  async headers() {
    const cdnLong = "public, s-maxage=86400, stale-while-revalidate=604800";
    const cdnMedium = "public, s-maxage=3600, stale-while-revalidate=86400";
    return [
      {
        source: "/:path*.(png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/artwork/:path*",
        headers: [{ key: "CDN-Cache-Control", value: cdnLong }],
      },
      {
        source: "/artist/:path*",
        headers: [{ key: "CDN-Cache-Control", value: cdnLong }],
      },
      {
        source: "/browse/:path*",
        headers: [{ key: "CDN-Cache-Control", value: cdnMedium }],
      },
      {
        source: "/sitemap/:id*",
        headers: [{ key: "CDN-Cache-Control", value: cdnLong }],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "CDN-Cache-Control", value: cdnLong }],
      },
    ];
  },
};

export default nextConfig;
