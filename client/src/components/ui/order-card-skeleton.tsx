import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderCardSkeleton() {
  return (
    <Card className="border-none shadow-sm bg-secondary/10 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 border-b bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
