import type { Metadata } from "next";

// The favorites page is a client component (localStorage-only content), so
// its metadata lives here: own title + noindex — there is nothing for a
// crawler to see.
export const metadata: Metadata = {
  title: "Favorites",
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
