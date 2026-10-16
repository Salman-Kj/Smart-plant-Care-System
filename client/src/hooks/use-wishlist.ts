import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import type { Plant } from "@shared/schema";

export type WishlistItemWithPlant = { id: number; userId: number; plantId: number; createdAt: string | null; plant: Plant };

export type CatalogWishlistEntry = { id: number; userId: number; itemType: string; itemKey: string; createdAt: string | null };

const WISHLIST_KEY = ["/api/wishlist"];

export function useWishlist(enabled: boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const listQuery = useQuery<{ items: WishlistItemWithPlant[]; catalog: CatalogWishlistEntry[] }>({
    queryKey: WISHLIST_KEY,
    queryFn: async () => {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (res.status === 401) return { items: [], catalog: [] };
      if (!res.ok) throw new Error("Failed to load wishlist");
      const data = await res.json();
      if (Array.isArray(data)) return { items: data, catalog: [] };
      return { items: data.items ?? [], catalog: data.catalog ?? [] };
    },
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: async (plantId: number) => {
      const res = await apiRequest("POST", `/api/wishlist/${plantId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast({ title: "Added to wishlist", description: "Plant saved for later." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    },
  });

  const addCatalogMutation = useMutation({
    mutationFn: async ({ type, key }: { type: string; key: string }) => {
      const res = await apiRequest("POST", "/api/wishlist/catalog", { type, key });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast({ title: "Added to wishlist", description: "Plant saved for later." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (plantId: number) => {
      await apiRequest("DELETE", `/api/wishlist/${plantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast({ title: "Removed from wishlist" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
    },
  });

  const removeCatalogMutation = useMutation({
    mutationFn: async ({ type, key }: { type: string; key: string }) => {
      await apiRequest("DELETE", `/api/wishlist/catalog/${encodeURIComponent(type)}/${encodeURIComponent(key)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast({ title: "Removed from wishlist" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
    },
  });

  const items = listQuery.data?.items ?? [];
  const catalogItems = listQuery.data?.catalog ?? [];
  const wishlistPlantIds = items.map((w) => w.plantId);
  const catalogKeys = new Set(catalogItems.map((c) => `${c.itemType}:${c.itemKey}`));

  const isInWishlist = (plantId: number) => wishlistPlantIds.includes(plantId);
  const isInCatalogWishlist = (itemType: string, itemKey: string) => catalogKeys.has(`${itemType}:${itemKey}`);

  const toggleWishlist = (plantId: number | string) => {
    if (typeof plantId === "number") {
      if (isInWishlist(plantId)) removeMutation.mutate(plantId);
      else addMutation.mutate(plantId);
    } else {
      const key = String(plantId);
      if (isInCatalogWishlist("plants", key)) removeCatalogMutation.mutate({ type: "plants", key });
      else addCatalogMutation.mutate({ type: "plants", key });
    }
  };

  const isPlantInWishlist = (plantId: number | string) => {
    if (typeof plantId === "number") return isInWishlist(plantId);
    return isInCatalogWishlist("plants", String(plantId));
  };

  return {
    items,
    catalogItems,
    isLoading: listQuery.isLoading,
    addToWishlist: addMutation.mutate,
    addCatalogToWishlist: addCatalogMutation.mutate,
    removeFromWishlist: removeMutation.mutate,
    removeFromCatalogWishlist: removeCatalogMutation.mutate,
    isInWishlist,
    isInCatalogWishlist,
    isPlantInWishlist,
    toggleWishlist,
    refetch: listQuery.refetch,
  };
}
