import { useGardeners } from "@/hooks/use-gardeners";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function GardenersPage() {
  const { gardeners, isLoading } = useGardeners();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-display font-bold mb-4">Hire Expert Gardeners</h1>
        <p className="text-muted-foreground">Professional help for your garden maintenance, landscaping, or plant health consultations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gardeners.map((gardener) => (
            <GardenerCard key={gardener.id} gardener={gardener} />
          ))}
        </div>
      )}
    </div>
  );
}

function GardenerCard({ gardener }: { gardener: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-card rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center">
      <div className="relative mb-6">
        <img 
          src={gardener.imageUrl} 
          alt={gardener.name} 
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
        {gardener.available && (
          <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white" title="Available" />
        )}
      </div>
      
      <h3 className="text-xl font-bold font-display mb-1">{gardener.name}</h3>
      <p className="text-primary font-medium text-sm mb-4">{gardener.experience} Experience</p>
      
      <div className="flex items-center gap-1 mb-6 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
        <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
        <span className="font-bold text-orange-700">{gardener.rating}.0</span>
        <span className="text-orange-400 text-xs">(24 reviews)</span>
      </div>

      <div className="w-full grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-secondary/30 p-3 rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Rate</p>
          <p className="font-bold">${gardener.hourlyRate}/hr</p>
        </div>
        <div className="bg-secondary/30 p-3 rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Location</p>
          <p className="font-bold">New York</p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full rounded-xl" size="lg">Hire Now</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hire {gardener.name}</DialogTitle>
          </DialogHeader>
          <HireForm gardener={gardener} onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HireForm({ gardener, onSuccess }: { gardener: any, onSuccess: () => void }) {
  const { hireGardener } = useGardeners();
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Login required", variant: "destructive" });
      return;
    }
    hireGardener.mutate({ id: gardener.id, date, hours }, {
      onSuccess: () => onSuccess()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Duration (Hours)</Label>
        <Input type="number" min={1} max={8} value={hours} onChange={(e) => setHours(Number(e.target.value))} required />
      </div>
      <div className="bg-secondary/20 p-4 rounded-lg flex justify-between items-center">
        <span className="font-medium">Total Cost</span>
        <span className="font-bold text-xl">${gardener.hourlyRate * hours}</span>
      </div>
      <Button type="submit" className="w-full" disabled={hireGardener.isPending}>
        {hireGardener.isPending ? "Confirming..." : "Confirm Booking"}
      </Button>
    </form>
  );
}
