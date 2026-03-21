import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: `Explore ${SITE_STATS.artworks} artworks across ${SITE_STATS.artists} artists, ${SITE_STATS.styles} styles, and ${SITE_STATS.museums} museums. Browse Impressionism, Surrealism, Baroque, and more.`,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: `Explore ${SITE_STATS.artworks} artworks across ${SITE_STATS.artists} artists, ${SITE_STATS.styles} styles, and ${SITE_STATS.museums} museums.`,
  },
  twitter: {
    card: "summary_large_image",
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
      </body>
    </html>
  );
}
