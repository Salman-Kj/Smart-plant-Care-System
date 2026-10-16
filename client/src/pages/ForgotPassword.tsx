import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Error", description: "Please enter your email.", variant: "destructive" });
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()).catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Error", description: (data as { message?: string }).message || "Something went wrong.", variant: "destructive" });
        return;
      }
      setSent(true);
      toast({ title: "Check your email", description: "If an account exists with that email, we sent a reset link. In development, check the server console for the link." });
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/5">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
          <Leaf className="h-6 w-6" />
          <span>Smart Plant Care</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Forgot password</h1>
        <p className="text-muted-foreground text-sm">
          Enter the email for your account and we will send you a link to reset your password.
        </p>

        {sent ? (
          <div className="rounded-xl border border-border/60 bg-primary/5 p-4 text-sm text-muted-foreground">
            If an account exists with that email, you will receive a reset link. The link expires in 1 hour.
            In development, the reset link is also printed in the server console.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}

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
