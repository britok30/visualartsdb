import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.visualartsdb.com"),
  title: {
    default: `${SITE_NAME} — Explore the World's Art`,
    template: `%s — ${SITE_NAME}`,
  },
  description: `Explore ${SITE_STATS.artworks} artworks across ${SITE_STATS.artists} artists, ${SITE_STATS.styles} styles, and ${SITE_STATS.museums} museums. Browse Impressionism, Surrealism, Baroque, and more.`,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: `Explore ${SITE_STATS.artworks} artworks across ${SITE_STATS.artists} artists, ${SITE_STATS.styles} styles, and ${SITE_STATS.museums} museums.`,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300">
      <body className="min-h-screen bg-white antialiased">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: "https://www.visualartsdb.com",
            description: `Explore ${SITE_STATS.artworks} artworks across ${SITE_STATS.artists} artists, ${SITE_STATS.styles} styles, and ${SITE_STATS.museums} museums.`,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://www.visualartsdb.com/search?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <CommandPalette>
          <Header />
          <main>{children}</main>
          <Footer />
        </CommandPalette>
        <Analytics />
        <GoogleAnalytics gaId="G-3BLJWV48BK" />
      </body>
    </html>
  );
}
