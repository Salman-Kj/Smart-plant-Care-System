import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type GardenerReviewWithUsername = {
  id: number;
  bookingId: number;
  userId: number;
  gardenerId: number;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  username: string;
};

export function useGardenerReviews(gardenerId: number | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const listQuery = useQuery<GardenerReviewWithUsername[]>({
    queryKey: ["/api/gardeners", gardenerId, "reviews"],
    queryFn: async () => {
      if (gardenerId == null) return [];
      const res = await fetch(`/api/gardeners/${gardenerId}/reviews`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load reviews");
      return res.json();
    },
    enabled: enabled && gardenerId != null,
  });

  const submitMutation = useMutation({
    mutationFn: async ({
      gardenerId: gid,
      bookingId,
      rating,
      comment,
    }: {
      gardenerId: number;
      bookingId: number;
      rating: number;
      comment?: string;
    }) => {
      const res = await apiRequest("POST", `/api/gardeners/${gid}/reviews`, {
        bookingId,
        rating,
        comment,
      });
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardeners", variables.gardenerId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Review saved", description: "Thanks for your feedback." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save review", description: err.message, variant: "destructive" });
    },
  });

  return {
    reviews: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    submitReview: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
  };
}
