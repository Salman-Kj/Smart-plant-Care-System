import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPlants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [deletePlantId, setDeletePlantId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: plants = [], refetch, isLoading, error } = useQuery({
    queryKey: ["/api/plants"],
    queryFn: async () => {
      const res = await fetch("/api/plants", { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch plants: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (plantId: number) => {
      const res = await fetch(`/api/admin/plants/${plantId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete plant");
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Success", description: "Plant deleted successfully" });
      setDeletePlantId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredPlants = plants.filter(
    (plant: any) =>
      plant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout title="Plants">
        <div className="flex justify-center items-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Plants">
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="text-destructive font-semibold">Error loading plants</div>
          <div className="text-muted-foreground text-sm">{error instanceof Error ? error.message : "Please try again."}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Plants">
      <div className="flex items-center justify-between mb-6">
        <div className="bg-secondary/30 rounded-2xl border border-border/60 p-4 flex items-center gap-3 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="border-0 bg-transparent focus-visible:ring-0"
            placeholder="Search plants"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-6">
              <Plus className="mr-2 h-4 w-4" />
              Add Plant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Plant</DialogTitle>
              <DialogDescription>Add a new plant to the store</DialogDescription>
            </DialogHeader>
            <AddPlantForm
              onSuccess={() => {
                setIsAddDialogOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="grid grid-cols-5 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
            <div>Plant</div>
            <div>Category</div>
            <div>Price</div>
            <div>Image</div>
            <div className="text-right">Actions</div>
          </div>
          {filteredPlants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No plants found</div>
          ) : (
            filteredPlants.map((plant: any) => (
              <div key={plant.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 text-sm items-center">
                <div className="font-medium">{plant.name}</div>
                <div>{plant.category}</div>
                <div className="text-primary">Rs {(plant.price / 100).toLocaleString()}</div>
                <div>
                  <img src={plant.imageUrl} alt={plant.name} className="w-12 h-12 rounded object-cover" />
                </div>
                <div className="text-right flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPlant(plant);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletePlantId(plant.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plant</DialogTitle>
            <DialogDescription>Update plant information</DialogDescription>
          </DialogHeader>
          {selectedPlant && (
            <EditPlantForm
              plant={selectedPlant}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedPlant(null);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePlantId} onOpenChange={(open) => !open && setDeletePlantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this plant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePlantId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePlantId && deleteMutation.mutate(deletePlantId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

const PLANT_CATEGORIES = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "hanging", label: "Hanging" },
  { value: "succulents", label: "Succulents" },
  { value: "cactus", label: "Cactus" },
];

function AddPlantForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "indoor",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          price: Math.round(parseFloat(data.price) * 100), // Convert to cents
        }),
      });
      if (!res.ok) throw new Error("Failed to create plant");
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Plant added successfully" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Plant Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (Rs)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PLANT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Adding..." : "Add Plant"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditPlantForm({ plant, onSuccess }: { plant: any; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: plant.name,
    description: plant.description,
    price: (plant.price / 100).toString(),
    imageUrl: plant.imageUrl,
    category: plant.category,
  });
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/admin/plants/${plant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          price: Math.round(parseFloat(data.price) * 100), // Convert to cents
        }),
      });
      if (!res.ok) throw new Error("Failed to update plant");
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Plant updated successfully" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Plant Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (Rs)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PLANT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Updating..." : "Update Plant"}
        </Button>
      </DialogFooter>
    </form>
  );
}
