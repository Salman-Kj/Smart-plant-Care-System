import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGardeners() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const gardenersQuery = useQuery({
    queryKey: [api.gardeners.list.path],
    queryFn: async () => {
      const res = await fetch(api.gardeners.list.path, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch gardeners");
      const data = api.gardeners.list.responses[200].parse(await res.json());
      const unique = new Map<number, (typeof data)[number]>();
      data.forEach((gardener) => {
        unique.set(gardener.id, gardener);
      });
      return Array.from(unique.values());
    },
  });

  const hireGardenerMutation = useMutation({
    mutationFn: async ({
      id,
      dateTime,
      date,
      hours,
      message,
      userName,
      userEmail,
      userPhone,
      userAddress,
    }: {
      id: number;
      dateTime: string;
      date: string;
      hours: number;
      message?: string;
      userName?: string;
      userEmail?: string;
      userPhone?: string;
      userAddress?: string;
    }) => {
      const url = buildUrl(api.gardeners.hire.path, { id });
      const res = await fetch(url, {
        method: api.gardeners.hire.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime,
          date,
          hours,
          message,
          userName,
          userEmail,
          userPhone,
          userAddress,
          bookingTime: new Date().toISOString(),
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to hire gardener");
      return api.gardeners.hire.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Gardener hired successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
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
