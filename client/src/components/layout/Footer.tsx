import { useState } from "react";
import { Leaf, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: data.message || "Failed to subscribe", variant: "destructive" });
        return;
      }
      toast({ title: "Subscribed!", description: "You're on the list for tips and updates." });
      setNewsletterEmail("");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-muted/30 border-t py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
              <Leaf className="h-5 w-5" />
              <span>Smart Plant Care</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering plant lovers with smart technology. Detect diseases, buy rare plants, and hire expert help.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email for tips & updates"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="rounded-full h-9 text-sm"
                disabled={newsletterLoading}
              />
              <Button type="submit" size="sm" className="rounded-full shrink-0" disabled={newsletterLoading}>
                {newsletterLoading ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/disease" className="hover:text-primary">Disease Detection</Link></li>
              <li><Link href="/plants" className="hover:text-primary">Marketplace</Link></li>
              <li><Link href="/gardeners" className="hover:text-primary">Expert Help</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="GitHub"><Github className="h-5 w-5" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Smart Plant Care. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
