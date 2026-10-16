import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";

export type PlantReviewWithUsername = {
  id: number;
  userId: number;
  plantId: number;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  username: string;
};

export function usePlantReviews(plantId: number | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const listQuery = useQuery<PlantReviewWithUsername[]>({
    queryKey: ["/api/plants", plantId, "reviews"],
    queryFn: async () => {
      if (plantId == null) return [];
      const res = await fetch(`/api/plants/${plantId}/reviews`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load reviews");
      return res.json();
    },
    enabled: enabled && plantId != null,
  });

  const submitMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment?: string }) => {
      if (plantId == null) throw new Error("No plant");
      const res = await apiRequest("POST", `/api/plants/${plantId}/reviews`, { rating, comment });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants", plantId, "reviews"] });
      toast({ title: "Review saved", description: "Thanks for your feedback." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save review", description: err.message, variant: "destructive" });
    },
  });

  const reviews = listQuery.data ?? [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return {
    reviews,
    averageRating,
    isLoading: listQuery.isLoading,
    submitReview: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    refetch: listQuery.refetch,
  };
}
