"use client";

import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  useRegisterActions,
  useKBar,
  type Action,
} from "kbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function SearchResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-4 pb-1 pt-3 text-[10px] uppercase tracking-widest text-neutral-300">
            {item}
          </div>
        ) : (
          <div
            className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${
              active ? "bg-neutral-50" : ""
            }`}
          >
            {item.icon && (
              <span className="text-neutral-300">{item.icon}</span>
            )}
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm text-neutral-900">
                {item.name}
              </span>
              {item.subtitle && (
                <span className="block truncate text-xs text-neutral-400">
                  {item.subtitle}
                </span>
              )}
            </div>
          </div>
        )
      }
    />
  );
}

function DynamicSearchActions() {
  const { searchQuery } = useKBar((state) => ({
    searchQuery: state.searchQuery,
  }));
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setActions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();

        const dynamicActions: Action[] = [];

        for (const artist of data.artists ?? []) {
          dynamicActions.push({
            id: `artist-${artist.id}`,
            name: artist.name,
            subtitle: artist.nationality ?? "Artist",
            section: "Artists",
            perform: () => router.push(`/artist/${artist.slug}`),
          });
        }

        for (const artwork of data.artworks ?? []) {
          dynamicActions.push({
            id: `artwork-${artwork.id}`,
            name: artwork.title,
            subtitle: `${artwork.artistName}${artwork.year ? `, ${artwork.year}` : ""}`,
            section: "Artworks",
            perform: () => router.push(`/artwork/${artwork.slug}`),
          });
        }

        for (const style of data.styles ?? []) {
          dynamicActions.push({
            id: `style-${style.id}`,
            name: style.name,
            subtitle: "Style",
            section: "Styles",
            perform: () => router.push(`/browse/styles/${style.slug}`),
          });
        }

        for (const genre of data.genres ?? []) {
          dynamicActions.push({
            id: `genre-${genre.id}`,
            name: genre.name,
            subtitle: "Genre",
            section: "Genres",
            perform: () => router.push(`/browse/genres/${genre.slug}`),
          });
        }

        setActions(dynamicActions);
      } catch {
        setActions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, router]);

  useRegisterActions(actions, [actions]);

  return null;
}

export function CommandPalette({ children }: { children: React.ReactNode }) {
  const staticActions: Action[] = [
    {
      id: "home",
      name: "Home",
      section: "Navigation",
      shortcut: [],
      keywords: "home",
    },
    {
      id: "styles",
      name: "Browse Styles",
      section: "Navigation",
      keywords: "styles movements",
    },
    {
      id: "genres",
      name: "Browse Genres",
      section: "Navigation",
      keywords: "genres subjects",
    },
    {
      id: "museums",
      name: "Browse Museums",
      section: "Navigation",
      keywords: "museums institutions",
    },
    {
      id: "artists",
      name: "Browse Artists",
      section: "Navigation",
      keywords: "artists painters",
    },
    {
      id: "search",
      name: "Search",
      section: "Navigation",
      keywords: "search find",
    },
  ];

  return (
    <KBarProvider
      actions={staticActions}
      options={{
        enableHistory: true,
      }}
    >
      <NavigationHandler />
      <DynamicSearchActions />
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm">
          <KBarAnimator className="mx-4 sm:mx-auto w-full max-w-lg overflow-hidden bg-white shadow-2xl">
            <KBarSearch
              className="w-full border-b border-neutral-100 px-5 py-4 text-sm outline-none placeholder:text-neutral-300"
              defaultPlaceholder="Search artists, artworks, styles..."
            />
            <SearchResults />
            <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-2.5">
              <span className="text-[10px] text-neutral-300">
                ↑↓ navigate · ↵ select
              </span>
              <span className="text-[10px] text-neutral-300">⌘K</span>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}

function NavigationHandler() {
  const router = useRouter();

  useRegisterActions(
    [
      {
        id: "home",
        name: "Home",
        section: "Navigation",
        perform: () => router.push("/"),
      },
      {
        id: "styles",
        name: "Browse Styles",
        section: "Navigation",
        perform: () => router.push("/browse/styles"),
      },
      {
        id: "genres",
        name: "Browse Genres",
        section: "Navigation",
        perform: () => router.push("/browse/genres"),
      },
      {
        id: "museums",
        name: "Browse Museums",
        section: "Navigation",
        perform: () => router.push("/browse/museums"),
      },
      {
        id: "artists",
        name: "Browse Artists",
        section: "Navigation",
        perform: () => router.push("/browse/artists"),
      },
      {
        id: "search",
        name: "Search",
        section: "Navigation",
        perform: () => router.push("/search"),
      },
    ],
    [router]
  );

  return null;
}
