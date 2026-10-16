import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Users,
  Leaf,
  BookOpen,
  Settings,
  Sprout,
  Package,
  CalendarCheck,
  Menu,
  X,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function AdminLayout({ title, children }: Props) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-[60vh]" />;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Access restricted</h1>
        <p className="text-muted-foreground mb-6">
          This area is available to admins only.
        </p>
        <Link href="/auth">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/plants", label: "Plants", icon: Leaf },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/gardeners", label: "Gardeners", icon: Sprout },
    { href: "/admin/articles", label: "Articles", icon: BookOpen },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="w-64 hidden lg:block">
          <div className="bg-white rounded-2xl border border-border p-6 sticky top-6">
            <div className="mb-8">
              <div className="text-sm font-semibold text-foreground">Smart Plant Care</div>
              <div className="text-xs text-primary">Admin</div>
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
            </nav>

            <div className="mt-8">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-primary"
                onClick={() => {
                  logout.mutate(undefined, {
                    onSuccess: () => setLocation("/auth"),
                  });
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <aside className="w-64 bg-white h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Smart Plant Care</div>
                    <div className="text-xs text-primary">Admin</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
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
                </nav>

                <div className="mt-8">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-primary"
                    onClick={() => {
                      logout.mutate(undefined, {
                        onSuccess: () => setLocation("/auth"),
                      });
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 lg:ml-0 ml-0">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="text-4xl font-display font-bold">{title}</h1>
            <NotificationBell enabled={!!user} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
