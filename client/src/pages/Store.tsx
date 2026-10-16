import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Pill, Sprout, Shovel, Star, ShieldCheck, Truck } from "lucide-react";

const storeItems = [
  {
    title: "Plants",
    description: "Browse indoor, outdoor, and succulent plants.",
    href: "/plants",
    icon: Leaf,
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW6wW_30qQsAeknLD3RpmifjmrYS9939JkCA&s",
    stats: "120+ plants",
    badge: "Popular",
  },
  {
    title: "Medicines",
    description: "Plant care medicines to protect and restore.",
    href: "/medicines",
    icon: Pill,
    imageUrl:
      "https://www.shutterstock.com/image-photo/long-aisle-store-filled-shelves-260nw-2650443091.jpg",
    stats: "25+ remedies",
    badge: "New",
  },
  {
    title: "Fertilizers",
    description: "Nutrition blends for healthy growth.",
    href: "/fertilizers",
    icon: Sprout,
    imageUrl:
      "https://www.geturbanleaf.com/cdn/shop/articles/5af28ab25675d3682bb467800cc25870.jpg?v=1704821815",
    stats: "18+ mixes",
    badge: "Best Value",
  },
  {
    title: "Gardening Accessories",
    description: "Tools and essentials for everyday care.",
    href: "/accessories",
    icon: Shovel,
    imageUrl:
      "https://seedbeej.pk/wp-content/uploads/2024/07/guide-choose-gardening-tools-accessories-facebook.webp",
    stats: "40+ tools",
    badge: "Essential",
  },
];

const trustPoints = [
  {
    title: "Quality Checked",
    text: "Verified items for plant health and safety.",
    icon: ShieldCheck,
  },
  {
    title: "Top Rated",
    text: "Loved by students and plant enthusiasts.",
    icon: Star,
  },
  {
    title: "Fast Delivery",
    text: "Quick dispatch in major cities.",
    icon: Truck,
  },
];

const featuredItems = [
  {
    name: "Aglaonema Green Plant",
    tag: "Popular Plant",
    price: "Rs 1,800",
    imageUrl:
      "https://baghbani.pk/wp-content/uploads/2023/05/Aglaonema-Green-1-700x700.jpg.webp",
    href: "/store/product/plants/indoor-1",
  },
  {
    name: "Copper Fungicide Spray",
    tag: "Care Medicine",
    price: "Rs 950",
    imageUrl:
      "https://m.media-amazon.com/images/I/61swtrviB-L._SL1000_.jpg",
    href: "/store/product/medicines/med-1",
  },
  {
    name: "Coco Peat 800 gm Pack",
    tag: "Fertilizer",
    price: "Rs 300",
    imageUrl:
      "https://baghbani.pk/wp-content/uploads/2022/12/Cocopeat.jpg.webp",
    href: "/store/product/fertilizers/fert-1",
  },
  {
    name: "Pruner (BH-40)",
    tag: "Accessory",
    price: "Rs 1,200",
    imageUrl:
      "https://baghbani.pk/wp-content/uploads/2023/05/Pruner-BH-40.jpg.webp",
    href: "/store/product/accessories/acc-2",
  },
];

export default function StorePage() {
  return (
    <div className="bg-secondary/10">
      <div className="container mx-auto px-4 py-10">
        <section className="rounded-3xl border bg-background p-5 md:p-6 mb-5">
          <div className="max-w-2xl">
            <p className="text-sm text-primary font-semibold tracking-wide uppercase">
              Plant & Care Store
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-3">
              Everything your plants need
            </h1>
            <p className="text-muted-foreground mb-6">
              Shop plants, care medicines, fertilizers, and accessories — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/plants">
                <Button className="rounded-full px-6">Shop Plants</Button>
              </Link>
              <Link href="/medicines">
                <Button variant="outline" className="rounded-full px-6">
                  Shop Medicines
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="mb-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "80+ items", text: "Curated plants and care essentials" },
              { label: "Expert verified", text: "Recommendations you can trust" },
              { label: "Dispatch 24h", text: "Quick dispatch in major cities" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border bg-background p-4 text-center">
                <p className="text-sm font-semibold text-primary">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-6 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Browse by category</h2>
            <p className="text-muted-foreground">Pick a section to start your plant care journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storeItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="block">
                  <div className="group rounded-2xl border bg-background overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {item.badge}
                    </div>
                    <div className="absolute bottom-3 left-3 text-xs text-white/90">
                      {item.stats}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5">{item.description}</p>
                    <Button variant="outline" className="rounded-full px-4 mt-auto w-fit">
                      Explore
                    </Button>
                  </div>
                </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Top picks</h2>
              <p className="text-muted-foreground">Featured items loved by our community.</p>
            </div>
            <Link href="/plants">
              <Button variant="outline" className="rounded-full px-6">
                View all
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredItems.map((item) => (
              <Link key={item.name} href={item.href} className="block">
                <div className="group rounded-2xl border bg-background overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {item.tag}
                    </div>
                  </div>
                <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold">{item.name}</h3>
                    <span className="text-xs font-bold text-primary">{item.price}</span>
                    </div>
                    <div className="inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                      View details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="rounded-2xl border bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{point.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{point.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border bg-background p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-display font-bold mb-2">Need help choosing?</h3>
            <p className="text-muted-foreground">
              Our gardeners can suggest the best care for your plants.
            </p>
          </div>
          <Link href="/gardeners">
            <Button className="rounded-full px-6">Ask a gardener</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
