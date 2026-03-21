import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, SITE_STATS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-neutral-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Image
              src="/logo.png"
              alt="VisualArtsDB"
              width={160}
              height={160}
              className="h-20 w-auto"
            />
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">
              An open visual arts database with {SITE_STATS.artworks} artworks,{" "}
              {SITE_STATS.artists} artists, and {SITE_STATS.styles} styles
              spanning centuries of human creativity.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-neutral-300">
              Browse
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "Styles", href: "/browse/styles" },
                { label: "Genres", href: "/browse/genres" },
                { label: "Museums", href: "/browse/museums" },
                { label: "Artists", href: "/browse/artists" },
                { label: "Favorites", href: "/favorites" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Styles */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-neutral-300">
              Popular Styles
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "Impressionism", href: "/browse/styles/impressionism" },
                { label: "Romanticism", href: "/browse/styles/romanticism" },
                { label: "Surrealism", href: "/browse/styles/surrealism" },
                { label: "Pop Art", href: "/browse/styles/pop-art" },
                { label: "Cubism", href: "/browse/styles/cubism" },
                { label: "Realism", href: "/browse/styles/realism" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Museums */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-neutral-300">
              Museums
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "Art Institute of Chicago", href: "/browse/museums/art-institute-of-chicago" },
                { label: "MoMA", href: "/browse/museums/museum-of-modern-art" },
                { label: "Rijksmuseum", href: "/browse/museums/rijksmuseum" },
                { label: "Cleveland Museum of Art", href: "/browse/museums/cleveland-museum-of-art" },
                { label: "The MET", href: "/browse/museums/metropolitan-museum-of-art-new-york-ny" },
                { label: "Louvre", href: "/browse/museums/louvre-paris-france" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-neutral-100 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-neutral-300">
            &copy; {new Date().getFullYear()} {SITE_NAME}
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-xs text-neutral-300 transition-colors hover:text-neutral-600"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-neutral-300 transition-colors hover:text-neutral-600"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
