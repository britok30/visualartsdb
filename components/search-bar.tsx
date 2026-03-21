"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
  placeholder?: string;
}

export function SearchBar({
  defaultValue = "",
  large = false,
  placeholder = "Search artists, artworks, styles...",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search
          className={`absolute left-0 top-1/2 -translate-y-1/2 text-neutral-300 ${
            large ? "h-5 w-5" : "h-4 w-4"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full border-b border-neutral-200 bg-transparent pr-4 text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors focus:border-neutral-900 ${
            large ? "pb-3 pl-8 text-lg" : "pb-2 pl-7 text-sm"
          }`}
        />
      </div>
    </form>
  );
}
