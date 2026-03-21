"use client";

import { useKBar } from "kbar";
import { Search } from "lucide-react";

export function KBarTrigger() {
  const { query } = useKBar();

  return (
    <button
      onClick={query.toggle}
      className="mx-auto flex items-center gap-3 border-b border-neutral-200 px-1 pb-3 text-neutral-300 transition-colors hover:border-neutral-900 hover:text-neutral-500"
    >
      <Search size={16} strokeWidth={1.5} />
      <span className="text-sm">Search artists, artworks, styles...</span>
      <kbd className="ml-2 text-[10px] text-neutral-300">⌘K</kbd>
    </button>
  );
}
