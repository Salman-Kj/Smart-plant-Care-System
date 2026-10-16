import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMemo, useState } from "react";
import { demoAccessories } from "@/data/store-catalog";
import { Link } from "wouter";

export default function AccessoriesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addStoreItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccessories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return demoAccessories;
    return demoAccessories.filter((item) =>
      [item.name, item.use].some((field) => field.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const getAccessoryType = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("pruner")) return "Pruner";
    if (lower.includes("ramba") || lower.includes("rambi")) return "Hand Tool";
    if (lower.includes("sprinkler")) return "Sprinkler";
    if (lower.includes("shower")) return "Watering";
    if (lower.includes("grow bag")) return "Grow Bag";
    if (lower.includes("pot")) return "Pots";
    return "Accessory";
  };

  const handleAddToCart = (item: typeof demoAccessories[number]) => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to add items to cart.", variant: "destructive" });
      return;
    }
    addStoreItem.mutate({
      name: item.name,
      price: item.priceValue,
      imageUrl: item.imageUrl,
      category: "accessory",
      description: item.use,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Plant & Care Store</p>
        <h1 className="text-4xl font-display font-bold mb-2">Gardening Accessories</h1>
        <p className="text-muted-foreground">Essential tools and accessories for every gardener.</p>
      </div>

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search accessories..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {filteredAccessories.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl">
          <p className="text-xl text-muted-foreground">No accessories match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAccessories.map((item) => {
            const detailHref = `/store/product/accessories/${item.id}`;
            return (
            <div
              key={item.id}
              className="group bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <Link href={detailHref} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {getAccessoryType(item.name)}
                  </div>
                </div>
              </Link>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <Link href={detailHref} className="block">
                    <h3 className="text-lg font-semibold font-display line-clamp-1">{item.name}</h3>
                  </Link>
                  <span className="text-base font-bold text-primary">{item.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 flex-grow">{item.use}</p>

                <div className="flex flex-col gap-2 mt-auto">
                  <Link href={detailHref}>
                    <Button variant="outline" className="w-full rounded-xl">
                      View details
                    </Button>
                  </Link>
                  <Button className="w-full rounded-xl" onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
