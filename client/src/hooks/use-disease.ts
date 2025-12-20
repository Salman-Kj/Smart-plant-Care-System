import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type detectDiseaseInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type DetectInput = z.infer<typeof detectDiseaseInput>;

export function useDisease() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const historyQuery = useQuery({
    queryKey: [api.disease.history.path],
    queryFn: async () => {
      const res = await fetch(api.disease.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.disease.history.responses[200].parse(await res.json());
    },
  });

  const detectMutation = useMutation({
    mutationFn: async (data: DetectInput) => {
      const res = await fetch(api.disease.detect.path, {
        method: api.disease.detect.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Detection failed");
      return api.disease.detect.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.disease.history.path] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    detect: detectMutation,
  };
}
