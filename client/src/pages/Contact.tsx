import { useState } from "react";
import { Leaf, Send } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Required fields", description: "Name, email, and message are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Error", description: data.message || "Failed to send message.", variant: "destructive" });
        return;
      }
      toast({ title: "Message sent", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/5">
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" />
              <span>Smart Plant Care</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">Contact Us</h1>
            <p className="text-muted-foreground mt-2">Have a question or feedback? Send us a message.</p>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-background p-6 md:p-8 shadow-sm">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Brief subject" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Your message..." className="mt-1 min-h-[120px]" required />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send message</>}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link href="/"><span className="hover:text-primary">← Back to home</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
