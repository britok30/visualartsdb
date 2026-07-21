import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 180,
  experimental: {
    // Build-time page generation runs against a 0.25 CU (1 GB) Neon compute:
    // parallel workers each firing sitemap/homepage queries can OOM-crash
    // Postgres mid-build. One page at a time in one worker keeps the build
    // reliable; ~19 static pages, so the added wall-clock is small.
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 100,
    staticGenerationRetryCount: 2,
  },
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
  // Legacy ?page=N URLs → path-based pagination. Handling this at the edge
  // keeps the pages themselves free of searchParams (reading searchParams
  // would opt them into dynamic rendering on every request).
  async redirects() {
    const legacyPageQuery = (source: string) => ({
      source,
      has: [{ type: "query" as const, key: "page", value: "(?<p>\\d+)" }],
      destination: `${source}/page/:p`,
      permanent: true,
    });
    return [
      legacyPageQuery("/artist/:slug"),
      legacyPageQuery("/browse/styles/:slug"),
      legacyPageQuery("/browse/genres/:slug"),
      legacyPageQuery("/browse/museums/:slug"),
    ];
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
