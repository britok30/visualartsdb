import { Skeleton } from "@/components/ui/skeleton";

function ScrollRowSkeleton() {
  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between px-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="shrink-0">
            <Skeleton className="h-[420px] w-[280px] rounded-none" />
            <Skeleton className="mt-3 h-4 w-48" />
            <Skeleton className="mt-1.5 h-3 w-32" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="mx-auto max-w-5xl px-6 pt-32 pb-28 text-center">
        <Skeleton className="mx-auto h-28 w-full max-w-3xl sm:h-40" />
        <Skeleton className="mx-auto mt-8 h-5 w-72" />
        <Skeleton className="mx-auto mt-12 h-5 w-64" />
      </section>

      {/* Scroll row skeletons */}
      <div className="space-y-16">
        <ScrollRowSkeleton />
        <ScrollRowSkeleton />
        <ScrollRowSkeleton />
      </div>
    </div>
  );
}
