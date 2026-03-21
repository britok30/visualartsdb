"use client";

import Link from "next/link";
import { Search, Heart } from "lucide-react";
import { useKBar } from "kbar";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const { query } = useKBar();

  return (
    <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-6">
        <Link href="/" className="shrink-0">
          <span className="text-lg tracking-tight">VADB</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-6 text-sm tracking-wide">
            <Link href="/browse/styles" className="text-neutral-400 transition-colors hover:text-neutral-900">Styles</Link>
            <Link href="/browse/genres" className="text-neutral-400 transition-colors hover:text-neutral-900">Genres</Link>
            <Link href="/browse/museums" className="text-neutral-400 transition-colors hover:text-neutral-900">Museums</Link>
            <Link href="/browse/artists" className="text-neutral-400 transition-colors hover:text-neutral-900">Artists</Link>
            <a
              href="https://buy.stripe.com/6oU3cwfe41DU0io0IA7ok00"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 transition-colors hover:text-neutral-900"
            >
              Support
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/favorites"
              className="text-neutral-400 transition-colors hover:text-neutral-900"
            >
              <Heart size={18} strokeWidth={1.5} />
            </Link>
            <button
              onClick={query.toggle}
              className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-neutral-900"
            >
              <Search size={18} strokeWidth={1.5} />
              <kbd className="text-[10px] text-neutral-300">⌘K</kbd>
            </button>
          </div>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
