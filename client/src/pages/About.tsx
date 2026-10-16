import { Leaf, ShieldCheck, Sparkles, Heart, Users, BookOpen, ArrowRight, Mail, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function About() {
  return (
    <div className="min-h-screen bg-secondary/5">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Leaf className="h-4 w-4" />
              <span>Smart Plant Care</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary tracking-tight">
              About Us
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your complete platform for smarter plant care — from AI detection to marketplace to expert gardeners.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Mission */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-primary">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              We help plant lovers keep their plants healthy with AI-powered disease detection,
              a plant and care store, and access to verified gardeners. Whether you are a beginner
              or an enthusiast, Smart Plant Care gives you the tools and support you need — all in one place.
            </p>
          </section>

          {/* What we offer */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-primary">
              What We Offer
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4 p-6 rounded-2xl border border-border/60 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI Disease Detection</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upload a leaf image and get instant disease identification with causes and solutions.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl border border-border/60 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Plant & Care Store</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Browse plants, medicines, fertilizers, and accessories — all in one place.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl border border-border/60 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all sm:col-span-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Hire Verified Gardeners</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Book verified gardeners for advice, maintenance, and care — with messaging and booking built in.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Who it's for */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-primary">
              Who It&apos;s For
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border/60">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Beginners</h3>
                  <p className="text-sm text-muted-foreground">Learn and grow with guided detection and care tips.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border/60">
                <Leaf className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Plant Lovers</h3>
                  <p className="text-sm text-muted-foreground">One place for plants, products, and expert help.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border/60">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Gardeners</h3>
                  <p className="text-sm text-muted-foreground">Get booked, get paid, and build your reputation.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust / Values */}
          <section className="rounded-2xl border border-border/60 bg-primary/5 p-8 md:p-10 text-center">
            <p className="text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
              <Heart className="h-5 w-5 text-primary shrink-0" />
              <span>Built for plant lovers, by plant lovers.</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Verified gardeners · Secure booking · One platform for detection, shop, and hire
            </p>
          </section>

          {/* FAQ */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-primary flex items-center gap-2">
              <HelpCircle className="h-7 w-7" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full rounded-xl border border-border/60 bg-background p-4">
              <AccordionItem value="faq-1" className="border-b border-border/60 px-2">
                <AccordionTrigger className="text-left">How do I book a gardener?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Go to Hire Gardener, choose a gardener, pick a date and time, and submit your request. The gardener will accept or reject. Once accepted, you can message them and pay as per the chosen method (card or COD).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2" className="border-b border-border/60 px-2">
                <AccordionTrigger className="text-left">What payment methods are accepted?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We accept card (credit/debit), PayPal, JazzCash, and cash on delivery (COD). For COD, you pay the gardener when the service is completed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3" className="border-b border-border/60 px-2">
                <AccordionTrigger className="text-left">When will my order be delivered?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  After you place an order, we process and dispatch it. You can see the status in My Orders (pending, dispatched, delivered). Delivery time depends on your location.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4" className="border-b border-border/60 px-2">
                <AccordionTrigger className="text-left">Is the AI disease detection accurate?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  The model is trained on real plant disease patterns. Results are for guidance; for serious issues we recommend consulting a gardener or expert.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5" className="px-2">
                <AccordionTrigger className="text-left">How do I reset my password?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  On the login page, use &quot;Forgot password?&quot; and enter your email. We&apos;ll send you a link to set a new password. The link expires after a short time for security.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Contact Us */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-primary">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              For any issue, question, or feedback, reach out to us. We&apos;ll get back to you as soon as we can.
            </p>
            <div className="flex gap-4 p-6 rounded-2xl border border-border/60 bg-background shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a
                  href="mailto:support@smartplantcare.com"
                  className="text-primary font-medium hover:underline"
                >
                  support@smartplantcare.com
                </a>
                <p className="text-sm text-muted-foreground mt-1">
                  We typically respond within 24–48 hours.
                </p>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="text-center pt-4 border-t border-border/60">
            <p className="text-muted-foreground mb-6">Explore more</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/">
                <Button variant="outline" className="gap-2 rounded-full">
                  Back to Home
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" className="gap-2 rounded-full">
                  <BookOpen className="h-4 w-4" />
                  Blog
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="gap-2 rounded-full">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
