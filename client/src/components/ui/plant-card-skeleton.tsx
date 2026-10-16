import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlantCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/60">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-[75%]" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-20" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}
