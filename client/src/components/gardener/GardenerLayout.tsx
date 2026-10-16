import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Briefcase,
  CheckCircle2,
  Users,
  User,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function GardenerLayout({ title, subtitle, children }: Props) {
  const [location, setLocation] = useLocation();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="min-h-[60vh]" />;
  }

  if (!user || user.role !== "gardener") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Access restricted</h1>
        <p className="text-muted-foreground mb-6">
          This area is available to gardeners only.
        </p>
        <Link href="/auth">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  const navItems = [
    { href: "/gardener/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/gardener/bookings", label: "Jobs", icon: Briefcase },
    { href: "/gardener/completed", label: "Completed Jobs", icon: CheckCircle2 },
    { href: "/community", label: "Community", icon: Users },
    { href: "/gardener/profile", label: "Profile", icon: User },
    { href: "/gardener/messages", label: "Messages", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-8">
        <aside className="w-64 hidden lg:block">
          <div className="bg-white rounded-2xl border border-border p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-8">
              <img
                src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80"
                alt="Gardener"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">{user.fullName || user.username}</div>
                <div className="text-xs text-primary">Gardener</div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-secondary/60"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => logout.mutate(undefined, { onSuccess: () => setLocation("/auth") })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-foreground/80 hover:bg-secondary/60"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            <NotificationBell enabled={!!user} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
