import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArticleCardSkeleton() {
  return (
    <Card className="border-2 border-border/60 h-full">
      <CardContent className="p-6">
        <Skeleton className="w-full h-40 rounded-lg mb-4" />
        <Skeleton className="h-6 w-[85%] mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}
