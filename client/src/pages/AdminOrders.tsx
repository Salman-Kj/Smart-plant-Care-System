import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Package, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderRow = {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  address: string;
  items: Array<{ name?: string; quantity: number; plantId?: number }>;
  createdAt: string | null;
};

function normalizeOrderStatus(status: unknown): "pending" | "dispatched" | "delivered" | "completed" {
  const s = String(status || "").trim().toLowerCase();
  // Some older orders may have custom statuses (e.g. "paid"). Treat them as "pending" for the dispatch flow.
  if (s === "dispatched" || s === "delivered" || s === "completed" || s === "pending") return s;
  return "pending";
}

function statusBadgeClass(status: string) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "pending") return "bg-yellow-100 text-yellow-800";
  if (s === "paid") return "bg-emerald-100 text-emerald-800";
  if (s === "dispatched") return "bg-blue-100 text-blue-800";
  if (s === "delivered" || s === "completed") return "bg-green-100 text-green-800";
  return "bg-secondary text-muted-foreground";
}

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch orders: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");

      if (!res.ok) {
        const errorData = isJson ? await res.json().catch(() => ({})) : {};
        const fallbackText = isJson ? "" : await res.text().catch(() => "");
        throw new Error(
          (errorData as any).message ||
            (fallbackText ? "Server returned non-JSON error response." : "Failed to update order status")
        );
      }

      if (!isJson) {
        // This usually happens when the backend route is missing and the dev server returns index.html
        throw new Error("Server returned HTML instead of JSON. Restart the server and try again.");
      }

      return await res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Success", description: "Order status updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filteredOrders = (orders as OrderRow[]).filter(
    (order) =>
      String(order.id).includes(searchQuery) ||
      String(order.userId).includes(searchQuery) ||
      (order.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout title="Orders">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Orders">
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="text-destructive font-semibold">Error loading orders</div>
          <div className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : "Please try again."}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders">
      <div className="flex items-center justify-between mb-6">
        <div className="bg-secondary/30 rounded-2xl border border-border/60 p-4 flex items-center gap-3 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="border-0 bg-transparent focus-visible:ring-0"
            placeholder="Search by order ID, user ID, address, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="grid grid-cols-[90px_80px_140px_1fr_170px_260px] gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
            <div>Order #</div>
            <div>User ID</div>
            <div>Total</div>
            <div>Items</div>
            <div className="text-right">Date</div>
            <div className="text-right">Status</div>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              No orders found.
            </div>
          ) : (
            filteredOrders
              .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
              .map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[90px_80px_140px_1fr_170px_260px] gap-4 p-4 border-b last:border-b-0 text-sm items-center"
                >
                  <div className="font-medium">#{order.id}</div>
                  <div>{order.userId}</div>
                  <div className="text-primary font-medium">
                    Rs {((order.totalAmount ?? 0) / 100).toLocaleString()}
                  </div>
                  <div className="text-muted-foreground min-w-0">
                    {(order.items as OrderRow["items"])?.length ?? 0} item(s)
                    {(order.items as OrderRow["items"])?.length
                      ? (
                          <span className="block text-foreground/80 truncate">
                            {(order.items as OrderRow["items"])
                              .slice(0, 2)
                              .map((i) => `${i.name ?? "Item"} x${i.quantity}`)
                              .join(", ")}
                            {(order.items as OrderRow["items"]).length > 2 ? "…" : ""}
                          </span>
                        )
                      : ""}
                  </div>
                  <div className="text-right text-muted-foreground">
                    {order.createdAt
                      ? format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")
                      : "—"}
                  </div>
                  <div className="flex justify-end items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(
                        order.status
                      )}`}
                    >
                      {String(order.status || "pending")}
                    </span>
                    <Select
                      value={normalizeOrderStatus(order.status)}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ orderId: order.id, status: value })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="h-8 w-[150px] bg-background">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] bg-background border shadow-lg">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {filteredOrders.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Delivery address is stored on each order. User ID links to the customer who placed the order.
        </p>
      )}
    </AdminLayout>
  );
}
