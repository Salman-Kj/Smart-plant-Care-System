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
      return res.json();
    },
  });

  const detectMutation = useMutation({
    mutationFn: async (data: FormData | DetectInput) => {
      const isFormData = data instanceof FormData;
      const res = await fetch(api.disease.detect.path, {
        method: api.disease.detect.method,
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Detection failed");
      return res.json();
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
