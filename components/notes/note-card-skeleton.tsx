import { Skeleton } from "@/components/ui/skeleton";

export function NoteCardSkeleton() {
  return (
    <div className="rounded-xl border bg-gradient-to-b from-card to-card/50 p-6 shadow-lg space-y-6">
      <div className="space-y-4">
        <div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-20 mt-2" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-muted/20">
        <Skeleton className="h-9 w-[90px]" />
        <Skeleton className="h-9 w-[60px]" />
        <Skeleton className="h-9 w-[70px] ml-auto" />
      </div>
    </div>
  );
}
