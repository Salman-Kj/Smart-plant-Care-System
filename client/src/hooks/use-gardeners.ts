import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGardeners() {
  const { toast } = useToast();

  const gardenersQuery = useQuery({
    queryKey: [api.gardeners.list.path],
    queryFn: async () => {
      const res = await fetch(api.gardeners.list.path);
      if (!res.ok) throw new Error("Failed to fetch gardeners");
      return api.gardeners.list.responses[200].parse(await res.json());
    },
  });

  const hireGardenerMutation = useMutation({
    mutationFn: async ({ id, date, hours }: { id: number; date: string; hours: number }) => {
      const url = buildUrl(api.gardeners.hire.path, { id });
      const res = await fetch(url, {
        method: api.gardeners.hire.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, hours }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to hire gardener");
      return api.gardeners.hire.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Gardener hired successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    gardeners: gardenersQuery.data || [],
    isLoading: gardenersQuery.isLoading,
    hireGardener: hireGardenerMutation,
  };
}
