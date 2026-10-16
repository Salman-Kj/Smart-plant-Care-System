import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Calendar, DollarSign, ChevronRight, ShoppingBag } from "lucide-react";
import { OrderCardSkeleton } from "@/components/ui/order-card-skeleton";
import { format } from "date-fns";
import { Order } from "@shared/schema";

function getOrderStatusMessage(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "Order confirmed. We'll process and dispatch soon.";
  if (s === "dispatched") return "Dispatched. Delivery expected within 24 hours.";
  if (s === "delivered") return "Delivered.";
  if (s === "completed") return "Order complete.";
  return status || "—";
}

function getOrderStatusBadgeClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s === "dispatched") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "delivered" || s === "completed") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

const ORDER_STATUS_STEPS = ["pending", "dispatched", "delivered", "completed"] as const;

function OrderStatusTimeline({ status }: { status: string }) {
  const current = (status || "pending").toLowerCase();
  const idx = ORDER_STATUS_STEPS.findIndex((s) => s === current);
  const activeIdx = idx >= 0 ? idx : 0;
  return (
    <div className="flex items-center gap-1 mt-2" aria-label="Order status">
      {ORDER_STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`h-2 w-8 rounded-full transition-colors Rs{
              i <= activeIdx ? "bg-primary" : "bg-muted"
            }`}
            title={step}
          />
          {i < ORDER_STATUS_STEPS.length - 1 && (
            <div className={`h-0.5 w-4 Rs{i < activeIdx ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
      <span className="sr-only">
        {ORDER_STATUS_STEPS.slice(0, activeIdx + 1).join(" → ")}
      </span>
    </div>
  );
}

export default function MyOrdersPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-display font-bold mb-10">My Orders</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">No orders yet</h1>
        <p className="text-muted-foreground mb-8">You haven't made any purchases yet. Start browsing our collection!</p>
        <Link href="/plants">
          <Button size="lg" className="rounded-full px-8">
            Explore Plants
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold mb-10">My Orders</h1>

      <div className="grid gap-6">
        {orders.sort((a, b) => b.id - a.id).map((order) => (
          <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-secondary/10 group">
            <Link href={`/orders/confirmation/Rs{order.id}`}>
              <div className="cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 border-b bg-white/50 dark:bg-black/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {order.createdAt ? format(new Date(order.createdAt), "PPP") : "Recently"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total</p>
                      <p className="text-lg font-bold text-primary">Rs{(order.totalAmount / 100).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider Rs{getOrderStatusBadgeClass(order.status || "")}`}>
                        {order.status || "pending"}
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right max-w-[180px]">
                        {getOrderStatusMessage(order.status || "")}
                      </p>
                      <OrderStatusTimeline status={order.status || "pending"} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {(order.items as any[]).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-black/40 px-3 py-1.5 rounded-lg border text-sm">
                        {item.name} <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                      </div>
                    ))}
                    {(order.items as any[]).length > 3 && (
                      <div className="bg-white dark:bg-black/40 px-3 py-1.5 rounded-lg border text-sm text-muted-foreground">
                        +{(order.items as any[]).length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
