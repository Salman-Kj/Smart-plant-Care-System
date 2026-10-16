import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    setToken(params.get("token") || "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({ title: "Error", description: "Invalid reset link. Use the link from your email.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });
      const data = (await res.json()).catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Error", description: (data as { message?: string }).message || "Reset failed.", variant: "destructive" });
        return;
      }
      setSuccess(true);
      toast({ title: "Password reset", description: "You can now log in with your new password." });
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/5">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex items-center justify-center gap-2 text-primary font-display font-bold text-xl">
            <Leaf className="h-6 w-6" />
            <span>Smart Plant Care</span>
          </div>
          <p className="text-muted-foreground">Your password has been reset. You can now log in.</p>
          <Link href="/auth">
            <Button className="w-full rounded-xl">Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/5">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
          <Leaf className="h-6 w-6" />
          <span>Smart Plant Care</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Set new password</h1>
        <p className="text-muted-foreground text-sm">
          Enter your new password below. It must be at least 8 characters with uppercase, lowercase, and a number.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="rounded-xl"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={isPending || !token.trim()}>
            {isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>

        <Link href="/auth">
          <Button variant="ghost" className="gap-2 w-full rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </div>
    </div>
  );
}
