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
};

export default nextConfig;
