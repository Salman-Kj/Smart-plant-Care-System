import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Order } from "@shared/routes"; // Note: InsertOrder is implied in schema
import { useToast } from "@/hooks/use-toast";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

type InsertOrder = z.infer<typeof insertOrderSchema>;

export function useOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const ordersQuery = useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to place order");
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Order Placed!", description: "Your plants are on the way." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    createOrder: createOrderMutation,
  };
}
