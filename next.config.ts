import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // The homepage runs 43 section queries against a 1.6M-row table on a
  // 0.25 CU compute (~90-140s total). 180s left no margin; builds have
  // minutes to spare, so give it room rather than failing the deploy.
  staticPageGenerationTimeout: 420,
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
    // Vercel Image Optimization is used ONLY for the artwork-page hero
    // (components/artwork-image.tsx passes `unoptimized` everywhere else).
    // Museum heroes run 1–7 MB; cards already get museum thumbnails. Every
    // optimized hero is one unique transform (~$0.05/1k on Pro), so:
    // - a single device size keeps 1x/2x srcset entries on the same URL
    // - a 31-day TTL avoids re-transforming on revalidation
    // - `remotePatterns` lists every museum host we hotlink; unknown hosts
    //   400 and the component falls back to the direct URL.
    deviceSizes: [1600],
    imageSizes: [256],
    qualities: [75],
    formats: ["image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      new URL("https://**.wikiart.org/**"),
      new URL("https://www.artic.edu/**"),
      new URL("https://lakeimagesweb.artic.edu/**"),
      new URL("https://openaccess-cdn.clevelandart.org/**"),
      new URL("https://framemark.vam.ac.uk/**"),
      new URL("https://kokoelma.kansallisgalleria.fi/**"),
      new URL("https://nrs.harvard.edu/**"),
      new URL("https://ids.lib.harvard.edu/**"),
      new URL("https://images.metmuseum.org/**"),
      new URL("https://api.nga.gov/**"),
      new URL("https://**.artsmia.org/**"),
      new URL("https://whitneymedia.org/**"),
      new URL("https://www.parismuseescollections.paris.fr/**"),
      new URL("https://apicollections.parismusees.paris.fr/**"),
      new URL("https://**.smk.dk/**"),
      new URL("https://media.getty.edu/**"),
      new URL("https://media.tate.org.uk/**"),
      new URL("https://lh3.googleusercontent.com/**"),
      // Smithsonian addresses images by query string (?id=…)
      { protocol: "https", hostname: "ids.si.edu", pathname: "/ids/deliveryService" },
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

export default withBotId(nextConfig);
