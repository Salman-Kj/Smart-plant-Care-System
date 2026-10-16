import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@shared/routes";
import { DiseaseLog } from "@shared/schema";
import { format } from "date-fns";
import { Leaf } from "lucide-react";

const formatDateTime = (value?: string | Date | null) => {
  if (value == null) return "Not available";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return format(date, "dd MMM yyyy, h:mm a");
};

const clampPercent = (value?: number | null) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
};

export default function DiseaseHistory() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: logs = [], isLoading } = useQuery<DiseaseLog[]>({
    queryKey: [api.disease.history.path],
    enabled: Boolean(user && user.role === "user"),
    queryFn: async () => {
      const res = await fetch(api.disease.history.path, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to load disease history");
      }
      return api.disease.history.responses[200].parse(await res.json());
    },
  });

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "user")) {
      setLocation("/auth");
    }
  }, [isAuthLoading, user, setLocation]);

  if (!isAuthLoading && (!user || user.role !== "user")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">My Disease History</h1>
        <p className="text-muted-foreground">Your previous plant analysis results</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
          Loading...
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center text-muted-foreground">
          <Leaf className="h-12 w-12 mb-4 text-primary/40" />
          <p>You haven't analyzed any plant yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {logs.map((log) => {
            const confidence = clampPercent(log.confidence);
            return (
              <Card
                key={log.id}
                className="border border-border/60 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary/40">
                    {log.imageUrl ? (
                      <img
                        src={log.imageUrl}
                        alt={log.imageName || log.diseaseName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{log.diseaseName || "Not available"}</h2>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{confidence}%</span>
                    </div>
                    <Progress value={confidence} />
                  </div>

                  <div className="text-sm space-y-2">
                    <div>
                      <p className="font-medium">Cause</p>
                      <p className="text-muted-foreground">
                        {log.cause || "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Treatment Solution</p>
                      <p className="text-muted-foreground">
                        {log.solution || "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Recommended Medicine</p>
                      <p className="text-muted-foreground">
                        {log.medicine || "Not available"}
                      </p>
                      {log.medicine && (
                        <Link
                          href={`/medicines?q=${encodeURIComponent(log.medicine)}`}
                          className="inline-block mt-2 text-sm font-medium text-primary hover:underline"
                        >
                          Find in Store
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
