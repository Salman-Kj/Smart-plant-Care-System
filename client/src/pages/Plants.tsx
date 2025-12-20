import { usePlants } from "@/hooks/use-plants";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlantSchema } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PlantsPage() {
  const { plants, isLoading } = usePlants();
  const { user } = useAuth();
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Plant Marketplace</h1>
          <p className="text-muted-foreground">Buy rare plants or sell your own from your home garden.</p>
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

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      ) : plants.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl">
          <p className="text-xl text-muted-foreground">No plants listed yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlantCard({ plant }: { plant: any }) {
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBuy = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to purchase items.", variant: "destructive" });
      return;
    }
    
    // Simplified order creation
    createOrder.mutate({
      userId: user.id,
      totalAmount: plant.price,
      address: "Default User Address", // In real app, prompt for address
      items: [{ plantId: plant.id, name: plant.name, price: plant.price, quantity: 1 }],
      status: "pending"
    });
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
        <img 
          src={plant.imageUrl} 
          alt={plant.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide text-primary">
          {plant.category}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-display line-clamp-1">{plant.name}</h3>
          <span className="text-lg font-bold text-primary">${(plant.price / 100).toFixed(2)}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">{plant.description}</p>
        
        <Button 
          onClick={handleBuy} 
          disabled={createOrder.isPending}
          className="w-full mt-auto rounded-xl"
        >
          {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
            </>
          )}
        </Button>
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
