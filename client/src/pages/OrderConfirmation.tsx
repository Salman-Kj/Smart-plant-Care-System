import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Calendar, DollarSign, ArrowLeft } from "lucide-react";
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
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  if (s === "dispatched") return "bg-blue-100 text-blue-700";
  if (s === "delivered" || s === "completed") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const order = orders.find(o => o.id === Number(id));

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Link href="/">
          <Button className="mt-4">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground text-lg">Thank you for your purchase. Your order #{order.id} is being processed.</p>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Order Date
              </div>
              <p className="font-medium">{order.createdAt ? format(new Date(order.createdAt), "PPP") : "Today"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total Amount
              </div>
              <p className="font-bold text-lg text-primary">Rs{(order.totalAmount / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold mb-4">Ordered Items</h3>
            <div className="space-y-4">
              {(order.items as any[]).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">Rs{(item.price * item.quantity / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm font-medium">Track your order</span>
              <div className="flex flex-col gap-1">
                <span className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusBadgeClass(order.status || "")}`}>
                  {order.status || "pending"}
                </span>
                <p className="text-sm text-muted-foreground">
                  {getOrderStatusMessage(order.status || "")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/orders">
          <Button variant="outline" className="rounded-full px-8">
            View My Orders
          </Button>
        </Link>
        <Link href="/plants">
          <Button className="rounded-full px-8">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
