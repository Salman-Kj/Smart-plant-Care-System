import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { allDemoPlants } from "@/data/store-catalog";

function getFallbackPrice(label?: string): number {
  if (!label) return 0;
  const match = label.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { items, catalogItems, isLoading, removeFromWishlist, removeFromCatalogWishlist } = useWishlist(!!user);
  const { addToCart, addStoreItem } = useCart();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">Sign in to view your wishlist</h1>
        <p className="text-muted-foreground mb-8">Save plants for later and access them from any device.</p>
        <Link href="/auth">
          <Button size="lg" className="rounded-full px-8">Login / Register</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasAny = items.length > 0 || catalogItems.length > 0;
  if (!hasAny) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">Save plants you like by clicking the heart icon on any plant.</p>
        <Link href="/plants">
          <Button size="lg" className="rounded-full px-8">Browse Plants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold mb-10">Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((w) => (
          <Card key={`plant-${w.id}`} className="overflow-hidden border-none shadow-sm bg-secondary/10 group">
            <Link href={`/store/product/plants/${w.plant.id}`}>
              <div className="aspect-square overflow-hidden">
                <img
                  src={w.plant.imageUrl}
                  alt={w.plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={`/store/product/plants/${w.plant.id}`}>
                <h3 className="font-semibold text-lg mb-1 hover:text-primary truncate">{w.plant.name}</h3>
              </Link>
              <p className="text-primary font-medium mb-4">
                Rs {(w.plant.price / 100).toFixed(0)}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 rounded-full"
                  onClick={() => addToCart.mutate({ plantId: w.plant.id })}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" /> Add to cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => removeFromWishlist(w.plant.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {catalogItems
          .filter((c) => c.itemType === "plants")
          .map((c) => {
            const demo = allDemoPlants.find((p) => p.id === c.itemKey);
            const name = demo?.name ?? c.itemKey;
            const imageUrl = demo?.imageUrl ?? "";
            const priceLabel = demo?.priceLabel ?? "";
            const priceValue = "priceValue" in (demo ?? {}) ? (demo as { priceValue?: number }).priceValue : getFallbackPrice(priceLabel);
            const category = demo?.category ?? "indoor";
            return (
              <Card key={`catalog-${c.id}`} className="overflow-hidden border-none shadow-sm bg-secondary/10 group">
                <Link href={`/store/product/plants/${c.itemKey}`}>
                  <div className="aspect-square overflow-hidden bg-secondary/30">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Plant</div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/store/product/plants/${c.itemKey}`}>
                    <h3 className="font-semibold text-lg mb-1 hover:text-primary truncate">{name}</h3>
                  </Link>
                  <p className="text-primary font-medium mb-4">{priceLabel || "—"}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 rounded-full"
                      onClick={() =>
                        addStoreItem.mutate({
                          name,
                          price: priceValue || 0,
                          imageUrl: imageUrl || "",
                          category,
                          description: (demo as { description?: string })?.description,
                        })
                      }
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" /> Add to cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => removeFromCatalogWishlist({ type: c.itemType, key: c.itemKey })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
