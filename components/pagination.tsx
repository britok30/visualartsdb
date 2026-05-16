import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}

function pageWindow(page: number, totalPages: number): (number | "…")[] {
  const items: (number | "…")[] = [];
  const window = 1;
  const first = 1;
  const last = totalPages;
  const start = Math.max(first + 1, page - window);
  const end = Math.min(last - 1, page + window);

  items.push(first);
  if (start > first + 1) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < last - 1) items.push("…");
  if (last > first) items.push(last);
  return items;
}

export function Pagination({ page, totalPages, href }: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = pageWindow(page, totalPages);
  const showFullIndex = totalPages > 7;
  const allPages = showFullIndex
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : null;

  return (
    <>
    <nav
      aria-label="Pagination"
      className="mt-16 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={href(page - 1)} rel="prev" aria-label="Previous page">
            <ChevronLeft size={14} />
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled aria-disabled="true">
          <ChevronLeft size={14} />
          Previous
        </Button>
      )}

      <ul className="flex items-center gap-1">
        {items.map((item, i) =>
          item === "…" ? (
            <li
              key={`ellipsis-${i}`}
              className="px-2 text-xs text-neutral-400"
              aria-hidden="true"
            >
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <Button
                  variant="default"
                  size="sm"
                  disabled
                  aria-current="page"
                  className="min-w-9"
                >
                  {item}
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="min-w-9">
                  <Link href={href(item)} aria-label={`Page ${item}`}>
                    {item}
                  </Link>
                </Button>
              )}
            </li>
          ),
        )}
      </ul>

      {page < totalPages ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={href(page + 1)} rel="next" aria-label="Next page">
            Next
            <ChevronRight size={14} />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled aria-disabled="true">
          Next
          <ChevronRight size={14} />
        </Button>
      )}
    </nav>
    {allPages && (
      <nav
        aria-label="All pages"
        className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-x-2 gap-y-1 px-6 text-[11px] text-neutral-400"
      >
        <span className="text-neutral-300">Jump to:</span>
        {allPages.map((p) =>
          p === page ? (
            <span key={p} className="font-medium text-neutral-700" aria-current="page">
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              className="transition-colors hover:text-neutral-700"
            >
              {p}
            </Link>
          ),
        )}
      </nav>
    )}
    </>
  );
}
