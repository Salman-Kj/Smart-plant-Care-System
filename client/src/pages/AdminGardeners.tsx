import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, XCircle, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useGardeners } from "@/hooks/use-gardeners";
import { api } from "@shared/routes";

export default function AdminGardeners() {
  const [searchQuery, setSearchQuery] = useState("");
  const { gardeners = [], isLoading } = useGardeners();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async ({ gardenerId, verified }: { gardenerId: number; verified: boolean }) => {
      const res = await fetch(`/api/admin/gardeners/${gardenerId}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ verified }),
      });
      if (!res.ok) throw new Error("Failed to update verification");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.gardeners.list.path] });
      toast({ title: "Success", description: "Gardener verification updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Fix: Add null check for gardeners
  const filteredGardeners = (gardeners || []).filter(
    (gardener) =>
      gardener.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout title="Manage Gardeners">
        <div className="flex justify-center items-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!gardeners || gardeners.length === 0) {
    return (
      <AdminLayout title="Manage Gardeners">
        <div className="bg-secondary/30 rounded-2xl border border-border/60 p-4 mb-6 flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="border-0 bg-transparent focus-visible:ring-0"
            placeholder="Search gardeners"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Card className="border border-border/60">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">No gardeners found</div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Gardeners">
      <div className="bg-secondary/30 rounded-2xl border border-border/60 p-4 mb-6 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          className="border-0 bg-transparent focus-visible:ring-0"
          placeholder="Search gardeners"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
            <div>Gardener</div>
            <div>Location</div>
            <div>Experience</div>
            <div>Hourly Rate</div>
            <div>Rating</div>
            <div>Pay through</div>
            <div>Verified</div>
            <div className="text-right">Actions</div>
          </div>
          {filteredGardeners.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No gardeners found</div>
          ) : (
            filteredGardeners.map((gardener) => {
              const payMethod = (gardener as { paymentMethod?: string; paymentDetail?: string; accountTitle?: string }).paymentMethod;
              const payDetail = (gardener as { paymentDetail?: string }).paymentDetail;
              const payTitle = (gardener as { accountTitle?: string }).accountTitle;
              const payDisplay = payMethod
                ? `${payMethod.charAt(0).toUpperCase() + payMethod.slice(1)}${payDetail ? ` · ****${String(payDetail).slice(-4)}` : ""}${payTitle ? ` · ${payTitle}` : ""}`
                : "—";
              return (
                <div key={gardener.id} className="grid grid-cols-8 gap-4 p-4 border-b last:border-b-0 text-sm items-center">
                  <div className="font-medium">{gardener.name}</div>
                  <div className="text-muted-foreground">Karachi, Pakistan</div>
                  <div>{gardener.experience}</div>
                  <div className="text-primary">Rs {gardener.hourlyRate.toLocaleString()}</div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{gardener.rating || 5}</span>
                  </div>
                  <div className="text-muted-foreground text-xs max-w-[140px] truncate" title={payDisplay}>
                    {payDisplay}
                  </div>
                  <div>
                    {gardener.verified ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-right flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => verifyMutation.mutate({ gardenerId: gardener.id, verified: !gardener.verified })}
                      disabled={verifyMutation.isPending}
                    >
                      {gardener.verified ? "Unverify" : "Verify"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
