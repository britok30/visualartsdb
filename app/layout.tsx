import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
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
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        <CommandPalette>
          <Header />
          <main>{children}</main>
          <Footer />
        </CommandPalette>
        <Analytics />
      </body>
    </html>
  );
}
