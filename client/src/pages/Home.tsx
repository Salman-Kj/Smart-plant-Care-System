import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Leaf, ShieldCheck, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 md:pt-24 md:pb-48">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Smart AI Plant Doctor
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1]">
              Keep your plants <span className="text-primary">healthy & thriving</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Detect diseases instantly with AI, shop for rare indoor plants, and hire expert gardeners—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/disease">
                <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Try AI Detection
                </Button>
              </Link>
              <Link href="/plants">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-2 hover:bg-secondary/50">
                  Browse Shop
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Unsplash hero image of lush indoor plants */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=2449&auto=format&fit=crop" 
                alt="Beautiful indoor plants" 
                className="w-full h-auto object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-xs animate-float">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">98% Accuracy</p>
                    <p className="text-xs text-muted-foreground">AI Disease Detection</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything your garden needs</h2>
            <p className="text-muted-foreground">From diagnosis to treatment and care, we provide comprehensive solutions for plant parents.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-primary" />}
              title="AI Disease Detection"
              description="Upload a photo of your sick plant. Our AI identifies the disease and suggests treatments instantly."
              link="/disease"
            />
            <FeatureCard 
              icon={<Leaf className="h-8 w-8 text-primary" />}
              title="Plant Marketplace"
              description="Buy healthy, home-grown plants directly from verified sellers or sell your own propagations."
              link="/plants"
            />
            <FeatureCard 
              icon={<UserCheck className="h-8 w-8 text-primary" />}
              title="Hire Expert Gardeners"
              description="Need help with maintenance? Hire rated local gardeners for one-time or recurring visits."
              link="/gardeners"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) {
  return (
    <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="bg-primary/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
      <Link href={link} className="inline-flex items-center text-primary font-medium hover:underline">
        Get Started <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  );
}
