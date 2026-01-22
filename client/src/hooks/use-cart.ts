import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { useToast } from "./use-toast";
import { CartItem, Plant } from "@shared/schema";

export type CartItemWithPlant = CartItem & { plant: Plant };

export function useCart() {
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<CartItemWithPlant[]>({
    queryKey: [api.cart.list.path],
  });

  const addToCart = useMutation({
    mutationFn: async ({ plantId, quantity }: { plantId: number; quantity?: number }) => {
      const res = await apiRequest("POST", api.cart.add.path, { plantId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      toast({ title: "Added to cart", description: "The plant has been added to your shopping cart." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add to cart", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ plantId, quantity }: { plantId: number; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/cart/${plantId}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update quantity", description: error.message, variant: "destructive" });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (plantId: number) => {
      await apiRequest("DELETE", `/api/cart/${plantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      toast({ title: "Removed from cart", description: "The plant has been removed from your cart." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove item", description: error.message, variant: "destructive" });
    },
  });

  const total = items.reduce((sum, item) => sum + item.plant.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    total,
    itemCount,
  };
}
