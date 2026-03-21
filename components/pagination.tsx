import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}

export function Pagination({ page, totalPages, href }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={href(page - 1)}>
            <ChevronLeft size={14} />
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft size={14} />
          Previous
        </Button>
      )}

      <span className="min-w-[4rem] text-center text-xs text-neutral-400">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={href(page + 1)}>
            Next
            <ChevronRight size={14} />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
          <ChevronRight size={14} />
        </Button>
      )}
    </div>
  );
}
