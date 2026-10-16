import { usePlants } from "@/hooks/use-plants";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart, Loader2, Heart } from "lucide-react";
import { PlantCardSkeleton } from "@/components/ui/plant-card-skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlantSchema } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { demoPlantsByCategory, plantCategories } from "@/data/store-catalog";

export default function PlantsPage() {
  const { plants, isLoading } = usePlants();
  const { user } = useAuth();
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("indoor");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = plantCategories;
  const displayPlants =
    demoPlantsByCategory[selectedCategory as keyof typeof demoPlantsByCategory] || plants;
  const filteredPlants = displayPlants.filter((plant) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      plant.name?.toLowerCase().includes(query) ||
      plant.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div className="w-full">
          <p className="text-sm text-muted-foreground">Plant & Care Store</p>
          <h1 className="text-4xl font-display font-bold mb-2">Plants</h1>
          <p className="text-muted-foreground">Buy healthy indoor and outdoor plants for your home garden.</p>
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
          />
        </div>
        
        {user && (
          <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Sell a Plant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>List a Plant for Sale</DialogTitle>
              </DialogHeader>
              <SellPlantForm onSuccess={() => setIsSellDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category.value;
            return (
              <Button
                key={category.value}
                variant={isActive ? "default" : "outline"}
                className="rounded-full whitespace-nowrap"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <PlantCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl">
          <p className="text-xl text-muted-foreground">No plants found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlantCard({ plant }: { plant: any }) {
  const { addToCart, addStoreItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPlantInWishlist, toggleWishlist } = useWishlist(!!user);
  const detailHref = `/store/product/plants/${plant.id}`;
  const canWishlist = !!user;

  const getFallbackPrice = (label?: string) => {
    if (!label) return 0;
    const match = label.replace(/,/g, "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to add items to cart.", variant: "destructive" });
      return;
    }
    const isStoreItem = typeof plant.id === "string";
    if (isStoreItem) {
      addStoreItem.mutate({
        name: plant.name,
        price: plant.priceValue ?? getFallbackPrice(plant.priceLabel),
        imageUrl: plant.imageUrl,
        category: plant.category || "indoor",
        description: plant.description,
      });
      return;
    }
    addToCart.mutate({ plantId: plant.id, quantity: 1 });
  };

  const priceText =
    plant.priceLabel ?? (typeof plant.price === "number" ? `Rs ${(plant.price / 100).toFixed(2)}` : "");

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          {canWishlist && (
            <button
              type="button"
              aria-label={isPlantInWishlist(plant.id) ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-colors z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(plant.id);
              }}
            >
              <Heart
                className={`h-4 w-4 ${isPlantInWishlist(plant.id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
              />
            </button>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide text-primary">
            {plant.category}
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <Link href={detailHref} className="block">
            <h3 className="text-base font-semibold font-display line-clamp-1">{plant.name}</h3>
          </Link>
          <span className="text-base font-bold text-primary">{priceText}</span>
        </div>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-3 flex-grow">
          {plant.description || "Indoor plant"}
        </p>

        <div className="flex flex-col gap-2 mt-auto">
          <Link href={detailHref}>
            <Button variant="outline" size="sm" className="w-full rounded-lg h-9">
              View details
            </Button>
          </Link>
          <Button
            onClick={handleAddToCart}
            disabled={addToCart.isPending || addStoreItem.isPending}
            size="sm"
            className="w-full rounded-lg h-9"
          >
            {addToCart.isPending || addStoreItem.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SellPlantForm({ onSuccess }: { onSuccess: () => void }) {
  const { createPlant } = usePlants();
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertPlantSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "indoor",
      sellerId: user?.id
    }
  });

  const onSubmit = (data: any) => {
    // For demo, if imageUrl is empty, assign a random Unsplash plant
    if (!data.imageUrl) {
      data.imageUrl = "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1887&auto=format&fit=crop";
    }
    // ensure price is number
    data.price = Number(data.price);
    data.sellerId = user?.id;
    
    createPlant.mutate(data, {
      onSuccess: () => onSuccess()
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Plant Name</Label>
        <Input {...form.register("name")} placeholder="e.g. Monstera Deliciosa" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (Cents)</Label>
          <Input type="number" {...form.register("price", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(val) => form.setValue("category", val)} defaultValue="indoor">
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indoor">Indoor</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
              <SelectItem value="succulent">Succulent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input {...form.register("imageUrl")} placeholder="https://..." />
        <p className="text-[10px] text-muted-foreground">Leave empty for a random plant image</p>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...form.register("description")} placeholder="Describe the plant's condition..." />
      </div>

      <Button type="submit" className="w-full" disabled={createPlant.isPending}>
        {createPlant.isPending ? "Listing..." : "List Item"}
      </Button>
    </form>
  );
}
