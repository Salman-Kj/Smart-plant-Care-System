import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  PlayCircle,
  ShieldCheck,
  Star,
  UserCheck,
  Sparkles,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import heroPlant from "@/assets/hero-plant.jpg";
import beforeTreatment from "@/assets/before-treatment.png";
import afterTreatment from "@/assets/after-treatment.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-10 md:pt-8 md:pb-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/25 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Smart Plant Care
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] tracking-tight">
              Smarter care for <span className="text-primary">healthier plants</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              AI-powered disease detection, plant marketplace, and expert gardener
              hiring — a complete platform for plant lovers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/disease">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Try AI Detection
                </Button>
              </Link>
              <Link href="/plants">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base border-2 hover:bg-secondary/50"
                >
                  Browse Shop
                </Button>
              </Link>
            </div>

            <div className="pt-4 space-y-4 max-w-lg">
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Accuracy" value="98%" />
                <StatCard label="Avg. Time" value="5s" />
                <StatCard label="Active Users" value="1K+" />
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <span>4.8/5 from 1,200+ users</span>
                <span className="hidden sm:inline">•</span>
                <span>AI model updated weekly</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[28px] overflow-hidden shadow-[0_25px_60px_rgba(16,24,40,0.25)] ring-1 ring-black/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent z-10" />
              <img
                src={heroPlant}
                alt="Seedling in hand"
                className="w-full aspect-[4/3] object-cover transform -scale-x-100"
              />
              <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg max-w-xs border border-black/5">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">AI Diagnosis</p>
                    <p className="text-xs text-muted-foreground">Fast & reliable results</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex absolute -top-6 right-6 bg-background/95 border rounded-2xl shadow-lg px-4 py-3 items-center gap-3 backdrop-blur">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Smart Suggestions</p>
                <p className="text-xs text-muted-foreground">Cause + treatment</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground">
              Simple steps to keep your plants healthy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SimpleCard
              icon={<BadgeCheck className="h-7 w-7 text-primary" />}
              title="Upload Leaf Image"
              text="Select a clear image of the affected leaf."
            />
            <SimpleCard
              icon={<Sparkles className="h-7 w-7 text-primary" />}
              title="AI Detects Disease"
              text="Get disease name, confidence and cause."
            />
            <SimpleCard
              icon={<Clock className="h-7 w-7 text-primary" />}
              title="Instant Treatment"
              text="See solution and recommended medicine."
            />
          </div>
        </div>
      </section>

      {/* AI in Action */}
      <section className="py-10 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <PlayCircle className="h-3.5 w-3.5" />
                AI In Action
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                See how a single photo becomes a full care plan
              </h2>
              <p className="text-muted-foreground">
                Upload a photo and get diagnosis, cause, and treatment guidance
                in seconds.
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div className="rounded-2xl border bg-background p-4">
                  <p className="text-2xl font-bold text-primary">5s</p>
                  <p className="text-xs text-muted-foreground">Average diagnosis time</p>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <p className="text-2xl font-bold text-primary">3+</p>
                  <p className="text-xs text-muted-foreground">Insights per report</p>
                </div>
              </div>

              <Link href="/disease">
                <Button
                  variant="outline"
                  className="mt-2 rounded-full px-6 border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                >
                  View demo
                </Button>
              </Link>
            </div>

            <div className="relative rounded-3xl border bg-background p-4 shadow-sm">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop"
                  alt="AI detection preview"
                  className="w-full aspect-[16/9] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                  Diagnosis: Leaf spot · 92% confidence
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Live detection preview</span>
                <span>00:32</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything your garden needs
            </h2>
            <p className="text-muted-foreground">
              From diagnosis to treatment and care, we provide comprehensive solutions
              for plant parents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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

      {/* Why Choose Us */}
      <section className="py-14 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border bg-background p-8 md:p-12 shadow-md shadow-primary/5">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Why Choose Smart Plant Care?
              </h3>
              <p className="text-muted-foreground">
                Trusted, fast, and accurate plant care — built for students and gardeners.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  title: "98% Accuracy",
                  text: "AI model trained on real plant disease patterns.",
                },
                {
                  title: "Expert-backed",
                  text: "Recommendations aligned with horticulture best practices.",
                },
                {
                  title: "Fast Detection",
                  text: "Upload a photo and get results in seconds.",
                },
                {
                  title: "Secure",
                  text: "Your images stay private and are used only for analysis.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border bg-background p-5 text-center shadow-sm"
                >
                  <p className="text-lg font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Common Plant Diseases */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What Are Common Plant Diseases?
            </h2>
            <p className="text-muted-foreground">
              Explore frequent diseases, their affected plants, and quick symptoms.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                plant: "Pear",
                disease: "Rust",
                image:
                  "https://strapi.myplantin.com/medium_TM_Jan20_diseases_pear_rust_lead_min_4ef6178cb5.webp",
                note: "Orange or brown spots on leaves.",
              },
              {
                plant: "Cucumber",
                disease: "Leaf Spot",
                image:
                  "https://www.shutterstock.com/image-photo/yellow-spots-on-cucumber-leavesdisease-600nw-2227495635.jpg",
                note: "Yellow spots and mottled leaf damage.",
              },
              {
                plant: "Tomato",
                disease: "Septoria",
                image:
                  "https://strapi.myplantin.com/medium_Septoria_Spot_5699c4f3fd.webp",
                note: "Spots on leaves with yellow halos.",
              },
              {
                plant: "Cucumber",
                disease: "Mosaic",
                image:
                  "https://www.verticalfarmdaily.com/remote/https/agfstorage.blob.core.windows.net/misc/VFD_com/2024/09/04/agro.png?preset=ContentFullSmall",
                note: "Patchy leaf color and stunted growth.",
              },
              {
                plant: "Citrus",
                disease: "Bacteriosis",
                image: "https://agrotendencia.tv/wp-content/uploads/2018/12/bacteriosis.jpg",
                note: "Water-soaked spots and leaf blight.",
              },
              {
                plant: "Potato",
                disease: "Rot",
                image:
                  "https://strapi.myplantin.com/small_csm_Rhizo_solani_f5ba3c059d_min_aa4afdb2c4.webp",
                note: "Soft stem or leaves with decay.",
              },
              {
                plant: "Squash",
                disease: "Powdery Mildew",
                image:
                  "https://www.gardendesign.com/pictures/images/400x320Exact_0x0/site_3/powdery-mildew-powdery-mildew-on-squash-leaf-shutterstock-com_13365.jpg",
                note: "White powdery coating on leaves.",
              },
              {
                plant: "Peach",
                disease: "Leaf Curl",
                image:
                  "https://strapi.myplantin.com/small_Peach_Leaves_affected_by_Leaf_Curl_fcf405fc24.webp",
                note: "Twisted, curled, thick leaves.",
              },
              {
                plant: "Grape",
                disease: "Mold",
                image: "https://strapi.myplantin.com/small_gray_mold_main_c76c1851fd.webp",
                note: "Gray mold growth and leaf fall.",
              },
              {
                plant: "General",
                disease: "Fungi",
                image:
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs_jB35C7Ia--FkvNETR_h64G0SxZlEY0deA&s",
                note: "Spots on leaves and wilting.",
              },
              {
                plant: "General",
                disease: "Light or Heat Source Damage",
                image:
                  "https://strapi.myplantin.com/small_Heat_Damage_1024x675_d37ee42fcd.webp",
                note: "Brown leaf tips and scorching.",
              },
              {
                plant: "General",
                disease: "Water Deficiency in Plants",
                image:
                  "https://strapi.myplantin.com/small_water-deficiency-main_0dc3e215-82f0-499d-9975-82a4ce73cfdd.webp",
                note: "Wilting leaves and dry edges.",
              },
            ].map((item) => (
              <div
                key={item.disease}
                className="group rounded-2xl border bg-background shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={`${item.plant} - ${item.disease}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {item.plant}
                  </p>
                  <h3 className="text-lg font-semibold">{item.disease}</h3>
                  <p className="text-sm text-muted-foreground">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Before & After Recovery
            </h2>
            <p className="text-muted-foreground">
              Quick treatment guidance can visibly restore plant health.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            <div className="rounded-2xl border bg-background overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <img
                src={beforeTreatment}
                alt="Before treatment - damaged plant"
                className="w-full aspect-[2/1] object-cover"
              />
              <div className="px-4 py-3 text-xs text-muted-foreground">Before treatment</div>
            </div>
            <div className="rounded-2xl border bg-background overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <img
                src={afterTreatment}
                alt="After treatment"
                className="w-full aspect-[2/1] object-cover"
              />
              <div className="px-4 py-3 text-xs text-muted-foreground">After treatment</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Users Love PlantCare
            </h2>
            <p className="text-muted-foreground">
              Trusted by plant lovers, students, and home gardeners.
            </p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 snap-x">
            {[
              {
                name: "Ayesha K.",
                role: "Home Gardener",
                quote:
                  "AI diagnosis helped me save my tomatoes in minutes. Super easy to use!",
                highlight: "Verified User",
              },
              {
                name: "Ali R.",
                role: "Plant Seller",
                quote:
                  "Marketplace listings are clean and buyers trust the platform.",
                highlight: "Top Seller",
              },
              {
                name: "Hira M.",
                role: "Student",
                quote:
                  "The disease reports are clear and the recommendations actually worked for my plants.",
                highlight: "Plant Enthusiast",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="min-w-[260px] md:min-w-0 snap-start rounded-2xl border bg-background p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {t.name.split(" ")[0][0]}
                    </div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary">
                    {t.highlight}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  “{t.quote}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Quick answers to common questions about Smart Plant Care.
            </p>
          </div>
          <div className="max-w-3xl mx-auto rounded-2xl border bg-background p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is the AI diagnosis accurate?</AccordionTrigger>
                <AccordionContent>
                  The model is trained on real plant disease patterns and continuously improved for accuracy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Do I need to create an account?</AccordionTrigger>
                <AccordionContent>
                  You can explore features without an account, but saving history requires login.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes. Your images are used only for analysis and never shared publicly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What image quality works best?</AccordionTrigger>
                <AccordionContent>
                  Use a clear, well-lit photo where the affected leaf is visible and in focus.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I hire a gardener after diagnosis?</AccordionTrigger>
                <AccordionContent>
                  Yes. You can book a gardener for treatment or routine care directly from the platform.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Will my history be saved?</AccordionTrigger>
                <AccordionContent>
                  Logged-in users can view disease history and past recommendations anytime.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-6 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border bg-background p-5 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  Get weekly plant care tips
                </h3>
                <p className="text-muted-foreground">
                  Simple advice, disease alerts, and best practices.
                </p>
              </div>
              <div className="flex w-full md:w-auto gap-3">
                <Input placeholder="Enter your email" className="md:w-64" />
                <Button className="rounded-full px-6">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
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

function SimpleCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
      <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4 text-center shadow-sm">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

