import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    adminName: "",
    supportEmail: "",
    notificationPreference: "enabled",
  });

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch settings: ${res.status}`);
      }
      return await res.json();
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        adminName: settings.adminName || "",
        supportEmail: settings.supportEmail || "",
        notificationPreference: settings.notificationPreference || "enabled",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Settings saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center items-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Settings">
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="text-destructive font-semibold">Error loading settings</div>
          <div className="text-muted-foreground text-sm">{error instanceof Error ? error.message : "Please try again."}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <Card className="border border-border/60 max-w-2xl">
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Admin Name</Label>
              <Input
                placeholder="Admin name"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                type="email"
                placeholder="support@smartplantcare.com"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notification Preference</Label>
              <Input
                placeholder="Email notifications enabled"
                value={formData.notificationPreference}
                onChange={(e) => setFormData({ ...formData, notificationPreference: e.target.value })}
              />
            </div>
            <Button type="submit" className="rounded-full px-6" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
