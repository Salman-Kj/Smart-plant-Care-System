import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Leaf, LogOut, User as UserIcon, ShoppingCart, Package, Menu, Sparkles, Moon, Sun, Heart } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/store", label: "Plant & Care Store" },
    { href: "/disease", label: "Disease Detect" },
    { href: "/gardeners", label: "Hire Gardener" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="sticky top-0 z-[100] w-full border-b bg-white/80 backdrop-blur-md dark:bg-black/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl text-primary hover:opacity-80 transition-opacity">
          <Leaf className="h-6 w-6" />
          <span>PlantCare</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full shrink-0"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user && <NotificationBell enabled={!!user} />}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="mt-6 space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="text-sm">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </Button>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block">
                    <span
                      className={`text-sm font-medium ${
                        location === link.href ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
                {user ? (
                  <div className="pt-4 border-t space-y-3">
                    <Link href="/profile" className="block text-sm text-muted-foreground">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block text-sm text-muted-foreground">
                      My Orders
                    </Link>
                    <Link href="/wishlist" className="block text-sm text-muted-foreground">
                      Wishlist
                    </Link>
                    <Link href="/my-bookings" className="block text-sm text-muted-foreground">
                      My Bookings
                    </Link>
                    {user.role === "user" && (
                      <Link href="/disease-history" className="block text-sm text-muted-foreground">
                        Disease History
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start px-0 text-sm text-muted-foreground"
                      onClick={() => logout.mutate()}
                    >
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <Link href="/auth">
                      <Button className="w-full">Login / Register</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          {user && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 transition-colors">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10">
                  <UserIcon className="h-5 w-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 !z-[9999]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email || user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "user" && (
                  <>
                    <div className="mx-2 my-2 p-3 rounded-md bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Smart Suggestions</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Cause + treatment</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {user.role === "user" && (
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link href="/orders">
                  <DropdownMenuItem className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/wishlist">
                  <DropdownMenuItem className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/my-bookings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </DropdownMenuItem>
                </Link>
                {user.role === "user" && (
                  <Link href="/disease-history">
                    <DropdownMenuItem className="cursor-pointer">
                      <Leaf className="mr-2 h-4 w-4" />
                      <span>Disease History</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Admin Portal</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button>Login / Register</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
