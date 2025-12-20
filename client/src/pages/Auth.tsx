import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { z } from "zod";

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

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
    defaultValues: { username: "", password: "" },
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
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function RegisterForm({ onRegister, isPending }: { onRegister: (data: any) => void, isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", confirmPassword: "", fullName: "", email: "" },
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" {...form.register("password")} />
        </div>
        <div className="space-y-2">
          <Label>Confirm</Label>
          <Input type="password" {...form.register("confirmPassword")} />
        </div>
      </div>
      {form.formState.errors.confirmPassword && <span className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</span>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
