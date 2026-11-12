import { Skeleton } from "@/components/ui/skeleton";

export function SavedRecordSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-3.5 shadow-xs">
      {/* Header site skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="size-7 shrink-0 rounded-lg" />
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>

      {/* Input row skeletons */}
      <div className="grid gap-2">
        <Skeleton className="h-8.5 w-full rounded-xl" />
        <Skeleton className="h-8.5 w-full rounded-xl" />
      </div>
    </div>
  );
}
