import { Leaf } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-secondary/5">
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" />
              <span>Smart Plant Care</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">Terms of Service</h1>
            <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">1. Acceptance of terms</h2>
            <p className="leading-relaxed">
              By using Smart Plant Care (the &quot;Service&quot;), you agree to these Terms of Service.
              If you do not agree, please do not use the Service.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">2. Use of the Service</h2>
            <p className="leading-relaxed">
              You may use the Service for personal or commercial plant care, disease detection,
              marketplace purchases, and gardener bookings. You must not misuse the Service, attempt to
              gain unauthorized access, or use it for any illegal purpose.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">3. Accounts and data</h2>
            <p className="leading-relaxed">
              You are responsible for keeping your account credentials secure. We may suspend or
              terminate accounts that violate these terms. Your use of the Service is also governed
              by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">4. Purchases and bookings</h2>
            <p className="leading-relaxed">
              Orders and gardener bookings are subject to availability and our payment and cancellation
              policies. Refunds and disputes are handled in accordance with the policies stated at the
              time of purchase or booking.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">5. Limitation of liability</h2>
            <p className="leading-relaxed">
              Smart Plant Care is provided &quot;as is.&quot; We do not guarantee the accuracy of disease
              detection or advice. We are not liable for any indirect, incidental, or consequential
              damages arising from your use of the Service.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">6. Changes</h2>
            <p className="leading-relaxed">
              We may update these terms from time to time. Continued use of the Service after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
        <div className="max-w-3xl mx-auto mt-10 text-center">
          <Link href="/">
            <span className="text-sm text-primary hover:underline">← Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
