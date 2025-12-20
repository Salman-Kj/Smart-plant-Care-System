import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertPlant } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePlants() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const plantsQuery = useQuery({
    queryKey: [api.plants.list.path],
    queryFn: async () => {
      const res = await fetch(api.plants.list.path);
      if (!res.ok) throw new Error("Failed to fetch plants");
      return api.plants.list.responses[200].parse(await res.json());
    },
  });

  const createPlantMutation = useMutation({
    mutationFn: async (data: InsertPlant) => {
      const res = await fetch(api.plants.create.path, {
        method: api.plants.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create plant");
      return api.plants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plants.list.path] });
      toast({ title: "Success", description: "Plant listed for sale!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    plants: plantsQuery.data || [],
    isLoading: plantsQuery.isLoading,
    createPlant: createPlantMutation,
  };
}
