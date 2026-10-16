import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

type ProfileData = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  profileImage?: string | null;
};

export default function UserProfile() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [imageDirty, setImageDirty] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "user")) {
      setLocation("/auth");
    }
  }, [isAuthLoading, user, setLocation]);

  useEffect(() => {
    if (!user || user.role !== "user") return;
    setProfile((prev) => ({
      ...prev,
      fullName: user.fullName || user.username,
      email: user.email || "",
    }));
    const loadProfile = async () => {
      try {
        const res = await fetch(api.profile.get.path, { credentials: "include" });
        if (res.status === 401) return;
        if (!res.ok) throw new Error("Failed to load profile");
        const data = (await res.json()) as ProfileData;
        setProfile((prev) => ({
          ...prev,
          phone: data.phone || "",
          address: data.address || "",
          profileImage: data.profileImage || "",
        }));
        setImageDirty(false);
      } catch (err) {
        console.error("Profile load failed", err);
      }
    };
    loadProfile();
  }, [user, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        title: "Image too large",
        description: "Please upload an image under 2MB.",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const scale = Math.max(size / img.width, size / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const dx = (size - drawWidth) / 2;
        const dy = (size - drawHeight) / 2;
        ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setProfile((prev) => ({ ...prev, profileImage: dataUrl }));
        setImageDirty(true);
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const fetchProfile = async () => {
    const res = await fetch(api.profile.get.path, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load profile");
    const data = (await res.json()) as ProfileData;
    setProfile((prev) => ({
      ...prev,
      phone: data.phone || "",
      address: data.address || "",
      profileImage: data.profileImage || "",
    }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      let allowImage = imageDirty;
      if (imageDirty && profile.profileImage) {
        const base64 = profile.profileImage.split(",")[1] || "";
        const approxBytes = Math.floor((base64.length * 3) / 4);
        if (approxBytes > 2 * 1024 * 1024) {
          toast({
            title: "Image too large",
            description: "Image skipped. Please upload under 2MB.",
            variant: "destructive",
          });
          allowImage = false;
          setProfile((prev) => ({ ...prev, profileImage: "" }));
          setImageDirty(false);
        }
      }
      const payload: Record<string, string> = {
        phone: profile.phone || "",
        address: profile.address || "",
      };
      if (allowImage) {
        payload.profileImage = profile.profileImage || "";
      }
      const res = await fetch(api.profile.update.path, {
        method: api.profile.update.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update profile");
      }
      try {
        await fetchProfile();
      } catch (err) {
        console.error("Profile refresh failed", err);
      }
      toast({ title: "Saved", description: "Profile updated successfully." });
      setImageDirty(false);
    } catch (err) {
      const rawMessage = err instanceof Error && err.message ? err.message : "";
      if (rawMessage.includes("request entity too large")) {
        setProfile((prev) => ({ ...prev, profileImage: "" }));
        setImageDirty(false);
        try {
          const retry = await fetch(api.profile.update.path, {
            method: api.profile.update.method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              phone: profile.phone || "",
              address: profile.address || "",
            }),
          });
          if (!retry.ok) {
            const retryText = await retry.text();
            throw new Error(retryText || "Failed to update profile");
          }
          await fetchProfile();
          toast({
            title: "Saved",
            description: "Profile saved. Image skipped (too large).",
          });
          return;
        } catch (retryError) {
          console.error("Profile retry failed", retryError);
        }
        toast({
          title: "Image too large",
          description: "Please upload an image under 2MB.",
          variant: "destructive",
        });
      } else {
        const message = rawMessage || "Profile update failed.";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      toast({ title: "Missing info", description: "Enter both passwords.", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch(api.profile.changePassword.path, {
        method: api.profile.changePassword.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to change password");
      }
      toast({ title: "Updated", description: "Password changed successfully." });
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast({ title: "Error", description: "Password update failed.", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user || user.role !== "user") return null;

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-2xl border border-border/60">
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <div className="w-28 h-28 rounded-full overflow-hidden bg-secondary/40 flex items-center justify-center border border-border/60">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Upload</span>
                  )}
                </div>
              </label>
              <div className="text-lg font-semibold">{profile.fullName || user.username}</div>
              <div className="text-sm text-muted-foreground">{user.email || "No email"}</div>
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile.fullName || user.username} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email || user.email || ""} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={profile.phone || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={profile.address || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="sm:w-1/2" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>

            <div className="border-t border-border/60 pt-6">
              <div className="text-sm font-semibold mb-3">Change Password</div>
              <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Old Password</Label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Updating..." : "Change Password"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
