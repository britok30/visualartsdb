import { Skeleton } from "@/components/ui/skeleton";

export default function ArtworkLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-[500px] w-full rounded-none" />
        <div className="space-y-6">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="space-y-4 pt-4">
            <div>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
            <div>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <div>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
