import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { demoMedicines } from "@/data/store-catalog";

export default function MedicinesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addStoreItem } = useCart();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoryLabelMap: Record<string, string> = {
    "Mildew / Blight / Rust": "Mildew & Rust",
    "Root / Stem Rot": "Root Rot",
  };

  const getCategoryLabel = (category: string) => categoryLabelMap[category] || category;

  useEffect(() => {
    const query = location.split("?")[1] || "";
    const params = new URLSearchParams(query);
    const q = params.get("q") || "";
    setSearchQuery(q);
  }, [location]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(demoMedicines.map((med) => med.category)));
    return ["all", ...list];
  }, []);

  const filteredMedicines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return demoMedicines.filter((med) => {
      const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return [med.name, med.category, med.use].some((field) =>
        field.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (item: typeof demoMedicines[number]) => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to add items to cart.", variant: "destructive" });
      return;
    }
    addStoreItem.mutate({
      name: item.name,
      price: item.priceValue,
      imageUrl: item.imageUrl,
      category: "medicine",
      description: item.use,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Plant & Care Store</p>
        <h1 className="text-4xl font-display font-bold mb-2">Medicines</h1>
        <p className="text-muted-foreground">
          Medicines recommended for fungal, bacterial, viral, and pest-related diseases.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="rounded-full text-xs capitalize"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "All" : getCategoryLabel(category)}
            </Button>
          ))}
        </div>
        <div className="w-full md:max-w-sm">
          <Input
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {filteredMedicines.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl">
          <p className="text-xl text-muted-foreground">No medicines match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMedicines.map((med) => {
            const detailHref = `/store/product/medicines/${med.id}`;
            return (
            <div
              key={med.id}
              className="group bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <Link href={detailHref} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                  <img
                    src={med.imageUrl}
                    alt={med.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {getCategoryLabel(med.category)}
                  </div>
                </div>
              </Link>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <Link href={detailHref} className="block">
                    <h3 className="text-lg font-semibold font-display line-clamp-1">{med.name}</h3>
                  </Link>
                  <span className="text-base font-bold text-primary">{med.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 flex-grow">{med.use}</p>

                <div className="flex flex-col gap-2 mt-auto">
                  <Link href={detailHref}>
                    <Button variant="outline" className="w-full rounded-xl">
                      View details
                    </Button>
                  </Link>
                  <Button className="w-full rounded-xl" onClick={() => handleAddToCart(med)}>
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
