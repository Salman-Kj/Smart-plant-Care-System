import { Leaf } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-secondary/5">
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" />
              <span>Smart Plant Care</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">1. Information we collect</h2>
            <p className="leading-relaxed">
              We collect information you provide when you register, book a gardener, place an order, or contact us.
              This may include your name, email, phone number, address, and payment-related details when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">2. How we use your information</h2>
            <p className="leading-relaxed">
              We use your information to provide and improve our services, process bookings and orders,
              communicate with you, and ensure a secure experience. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">3. Cookies and similar technologies</h2>
            <p className="leading-relaxed">
              We may use cookies and similar technologies to keep you logged in, remember your preferences,
              and understand how you use our platform. You can manage cookie settings in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">4. Data security</h2>
            <p className="leading-relaxed">
              We take reasonable steps to protect your data. Passwords are stored in a secure hashed form.
              Payment details are handled in line with our payment providers&apos; practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">5. Contact</h2>
            <p className="leading-relaxed">
              For privacy-related questions or requests, contact us at{" "}
              <a href="mailto:support@smartplantcare.com" className="text-primary hover:underline">
                support@smartplantcare.com
              </a>
              .
            </p>
          </section>

          <div className="pt-6 border-t border-border/60">
            <Link href="/about">
              <Button variant="outline" className="rounded-full">Back to About</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
