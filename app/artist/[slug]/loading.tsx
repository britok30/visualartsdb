import { Skeleton } from "@/components/ui/skeleton";

export default function ArtistLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex gap-8">
        <Skeleton className="h-28 w-28 shrink-0 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-16 w-full max-w-xl" />
        </div>
      </div>

      <div className="mt-20">
        <Skeleton className="h-6 w-24" />
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-[320px] w-full rounded-none" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-1.5 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
