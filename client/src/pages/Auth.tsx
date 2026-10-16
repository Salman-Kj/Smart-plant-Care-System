import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { cleanupStuckOverlays } from "@/lib/overlay-cleanup";

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) return;
    
    // Cleanup overlays immediately when user is set (login/register success)
    cleanupStuckOverlays();
    document.body.classList.remove("modal-open", "overflow-hidden");
    document.body.style.pointerEvents = "auto";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
    document.body.removeAttribute("data-modal-open");
    
    // Remove only closed overlay/backdrop divs (not page content)
    const closedOverlays = document.querySelectorAll('[data-radix-overlay][data-state="closed"], [data-radix-dialog-overlay][data-state="closed"], [data-radix-sheet-overlay][data-state="closed"]');
    closedOverlays.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.hasAttribute('data-radix-overlay')) {
        htmlEl.remove();
      }
    });
    
    // Remove Select/Popover portals only if they contain closed content
    const portals = document.querySelectorAll('[data-radix-portal]');
    portals.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const hasOpenContent = htmlEl.querySelector('[data-state="open"]');
      const hasClosedOverlay = htmlEl.querySelector('[data-radix-overlay][data-state="closed"]');
      // Only remove if it has a closed overlay and no open content
      if (hasClosedOverlay && !hasOpenContent) {
        htmlEl.remove();
      }
    });
    
    // Navigate after cleanup
    if (user.role === "gardener") {
      setLocation("/gardener/dashboard");
    } else if (user.role === "admin") {
      setLocation("/admin/dashboard");
    } else {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel: Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Enter your details to access your account</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onLogin={(data) => login.mutate(data)} isPending={login.isPending} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm onRegister={(data) => register.mutate(data)} isPending={register.isPending} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Panel: Image */}
      <div className="hidden lg:block relative bg-muted">
        {/* Unsplash abstract plant texture */}
        <img 
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1527&auto=format&fit=crop" 
          alt="Plant texture" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-primary/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "To plant a garden is to believe in tomorrow."
            </p>
            <footer className="text-sm opacity-80">— Audrey Hepburn</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin, isPending }: { onLogin: (data: any) => void, isPending: boolean }) {
  const form = useForm({
    defaultValues: { username: "", password: "", role: "user" },
  });

  return (
    <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...form.register("username")} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...form.register("password")} required />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={form.watch("role")}
          onValueChange={(value) => form.setValue("role", value as "user" | "gardener" | "admin", { shouldValidate: true })}
        >
          <SelectTrigger className="h-11 rounded-xl bg-secondary/20 border border-border/60 px-4">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-border/60 bg-background">
            <SelectItem className="rounded-md focus:bg-primary/10 focus:text-primary" value="user">
              User
            </SelectItem>
            <SelectItem className="rounded-md focus:bg-primary/10 focus:text-primary" value="gardener">
              Gardener
            </SelectItem>
            <SelectItem className="rounded-md focus:bg-primary/10 focus:text-primary" value="admin">
              Admin
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
      </Button>
      <p className="text-center text-sm text-muted-foreground mt-2">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must include at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must include at least 1 number");

const registerSchema = insertUserSchema.extend({
  role: z.enum(["user", "gardener"]),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function RegisterForm({ onRegister, isPending }: { onRegister: (data: any) => void, isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: "user",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(({ confirmPassword, ...data }) => onRegister(data))} className="space-y-4">
      <div className="space-y-2">
        <Label>Username</Label>
        <Input {...form.register("username")} />
        {form.formState.errors.username && <span className="text-xs text-destructive">{form.formState.errors.username.message}</span>}
      </div>
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input {...form.register("fullName")} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={form.watch("role")}
          onValueChange={(value) => form.setValue("role", value)}
        >
          <SelectTrigger className="h-11 rounded-xl bg-secondary/20 border border-border/60 px-4">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-border/60 bg-background">
            <SelectItem className="rounded-md focus:bg-primary/10 focus:text-primary" value="user">
              User
            </SelectItem>
            <SelectItem className="rounded-md focus:bg-primary/10 focus:text-primary" value="gardener">
              Gardener
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" {...form.register("password")} />
          {form.formState.errors.password && (
            <span className="text-xs text-destructive">{form.formState.errors.password.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label>Confirm</Label>
          <Input type="password" {...form.register("confirmPassword")} />
          {form.formState.errors.confirmPassword && (
            <span className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</span>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
