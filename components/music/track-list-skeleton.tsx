import { Skeleton } from "@/components/ui/skeleton";

export function TrackListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-1 rounded-2xl border border-border bg-surface p-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-3 w-10 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 p-2.5">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
