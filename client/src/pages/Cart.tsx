import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";

export default function CartPage() {
  const { items, isLoading, updateQuantity, removeFromCart, total } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleCheckout = async () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    setLocation("/checkout");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-6 rounded-xl bg-secondary/10 border border-border/60">
                <Skeleton className="w-full sm:w-40 h-40 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any plants to your cart yet.</p>
        <Link href="/plants">
          <Button size="lg" className="rounded-full px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm bg-secondary/10">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-40 h-40">
                  <img
                    src={item.plant.imageUrl}
                    alt={item.plant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold font-display">{item.plant.name}</h3>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          item.plant.category === "medicine"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : item.plant.category === "fertilizer"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : item.plant.category === "accessory"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-primary/20 bg-primary/5 text-primary"
                        }`}
                      >
                        {item.plant.category}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      Rs {((item.plant.price * item.quantity) / 100).toFixed(0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3 bg-white dark:bg-black rounded-full p-1 border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity.mutate({ plantId: item.plantId, quantity: Math.max(1, item.quantity - 1) })}
                        disabled={updateQuantity.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity.mutate({ plantId: item.plantId, quantity: item.quantity + 1 })}
                        disabled={updateQuantity.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => removeFromCart.mutate(item.plantId)}
                      disabled={removeFromCart.isPending}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-none shadow-lg bg-primary/5">
            <CardHeader>
              <CardTitle className="font-display">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rs {(total / 100).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">Rs {(total / 100).toFixed(0)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full rounded-full h-12 text-lg shadow-lg shadow-primary/20"
                onClick={handleCheckout}
              >
                Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
