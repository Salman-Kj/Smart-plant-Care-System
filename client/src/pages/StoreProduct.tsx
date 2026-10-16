import { Link, useRoute } from "wouter";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { usePlantReviews } from "@/hooks/use-plant-reviews";
import { useToast } from "@/hooks/use-toast";
import { usePlants } from "@/hooks/use-plants";
import { Heart, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  allDemoPlants,
  demoAccessories,
  demoFertilizers,
  demoMedicines,
} from "@/data/store-catalog";

type StoreType = "plants" | "medicines" | "fertilizers" | "accessories";

export default function StoreProduct() {
  const { user } = useAuth();
  const { addToCart, addStoreItem } = useCart();
  const { isPlantInWishlist, toggleWishlist } = useWishlist(!!user);
  const { toast } = useToast();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const { plants, isLoading } = usePlants();
  const [, params] = useRoute("/store/product/:type/:id");
  const [quantity, setQuantity] = useState(1);

  const type = (params?.type ?? "plants") as StoreType;
  const itemId = params?.id ?? "";

  const item = useMemo(() => {
    if (type === "plants") {
      const demo = allDemoPlants.find((plant) => plant.id === itemId);
      if (demo) return demo;
      const numericId = Number(itemId);
      if (!Number.isNaN(numericId)) {
        return plants?.find((plant) => plant.id === numericId);
      }
      return undefined;
    }
    if (type === "medicines") {
      return demoMedicines.find((med) => med.id === itemId);
    }
    if (type === "fertilizers") {
      return demoFertilizers.find((fert) => fert.id === itemId);
    }
    if (type === "accessories") {
      return demoAccessories.find((acc) => acc.id === itemId);
    }
    return undefined;
  }, [type, itemId, plants]);

  const plantIdForReviews =
    type === "plants" && item && typeof (item as { id?: unknown }).id === "number"
      ? (item as { id: number }).id
      : null;
  const {
    reviews: realReviews,
    averageRating,
    isLoading: reviewsLoading,
    submitReview,
    isSubmitting,
  } = usePlantReviews(plantIdForReviews, !!item && type === "plants");

  const getFallbackPrice = (label?: string) => {
    if (!label) return 0;
    const match = label.replace(/,/g, "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  const getPriceText = () => {
    if (!item) return "";
    if ("priceLabel" in item && item.priceLabel) return item.priceLabel;
    if ("price" in item && typeof item.price === "string") return item.price;
    if ("price" in item && typeof item.price === "number") {
      return `Rs ${(item.price / 100).toFixed(2)}`;
    }
    return "";
  };

  const getDescription = () => {
    if (!item) return "";
    if ("description" in item && item.description) return item.description;
    if ("use" in item && item.use) return item.use;
    return "Carefully curated for plant lovers.";
  };

  const getCategoryLabel = () => {
    if (!item) return "";
    if ("category" in item && item.category) return item.category;
    return type.replace(/s$/, "");
  };

  const getDetailPoints = () => {
    if (!item) return [];
    if (type === "plants") {
      const category = getCategoryLabel();
      const careHints: Record<string, string[]> = {
        indoor: ["Bright indirect light", "Water when top soil is dry", "Indoor friendly"],
        outdoor: ["Full sun to partial shade", "Water 2-3 times weekly", "Outdoor hardy"],
        imported: ["Filtered light", "Moderate watering", "Premium imported variety"],
        hanging: ["Bright light", "Allow soil to dry slightly", "Perfect for baskets"],
        succulent: ["Direct/bright light", "Low water needs", "Drought tolerant"],
        cactus: ["Direct sunlight", "Very low water", "Low maintenance"],
      };
      return (
        careHints[category] ?? ["Easy care", "Healthy plant", "Great for home decor"]
      );
    }
    if (type === "medicines") {
      return [
        "Apply to affected leaves and stems",
        "Use gloves and follow label directions",
        "Store in a cool, dry place",
      ];
    }
    if (type === "fertilizers") {
      return [
        "Mix with soil or water as directed",
        "Best used during growing season",
        "Improves root and leaf health",
      ];
    }
    return [
      "Durable build for daily gardening",
      "Ergonomic and easy to use",
      "Perfect for home and terrace gardens",
    ];
  };

  const detailPoints = getDetailPoints();
  const relatedItems = useMemo(() => {
    const pickLimit = 4;
    if (type === "plants") {
      const list = allDemoPlants.filter((plant) => plant.id !== itemId);
      return list.slice(0, pickLimit).map((plant) => ({
        id: plant.id,
        name: plant.name,
        imageUrl: plant.imageUrl,
        price: plant.priceLabel || "",
        href: `/store/product/plants/${plant.id}`,
      }));
    }
    if (type === "medicines") {
      return demoMedicines
        .filter((med) => med.id !== itemId)
        .slice(0, pickLimit)
        .map((med) => ({
          id: med.id,
          name: med.name,
          imageUrl: med.imageUrl,
          price: med.price,
          href: `/store/product/medicines/${med.id}`,
        }));
    }
    if (type === "fertilizers") {
      return demoFertilizers
        .filter((fert) => fert.id !== itemId)
        .slice(0, pickLimit)
        .map((fert) => ({
          id: fert.id,
          name: fert.name,
          imageUrl: fert.imageUrl,
          price: fert.price,
          href: `/store/product/fertilizers/${fert.id}`,
        }));
    }
    return demoAccessories
      .filter((acc) => acc.id !== itemId)
      .slice(0, pickLimit)
      .map((acc) => ({
        id: acc.id,
        name: acc.name,
        imageUrl: acc.imageUrl,
        price: acc.price,
        href: `/store/product/accessories/${acc.id}`,
      }));
  }, [type, itemId]);

  const reviews = useMemo(() => {
    const reviewPool = {
      plants: [
        { name: "Ayesha K.", rating: 5, text: "Healthy leaves and great packaging." },
        { name: "Hassan R.", rating: 4, text: "Arrived fresh, easy to maintain." },
        { name: "Nimra S.", rating: 5, text: "Looks beautiful on my desk." },
        { name: "Ali Z.", rating: 4, text: "Good value for money." },
        { name: "Zain A.", rating: 5, text: "Strong roots and vibrant color." },
        { name: "Sara M.", rating: 4, text: "Care tips were helpful." },
      ],
      medicines: [
        { name: "Usman K.", rating: 5, text: "Worked fast on leaf spots." },
        { name: "Hina F.", rating: 4, text: "Easy to apply, good results." },
        { name: "Bilal S.", rating: 5, text: "Saved my plants in a week." },
        { name: "Mariam A.", rating: 4, text: "Clear usage instructions." },
        { name: "Farhan R.", rating: 5, text: "Great for fungal issues." },
        { name: "Nadia I.", rating: 4, text: "Nice quality and affordable." },
      ],
      fertilizers: [
        { name: "Imran K.", rating: 5, text: "Noticeable growth boost." },
        { name: "Sana J.", rating: 4, text: "Leaves look greener now." },
        { name: "Adeel M.", rating: 5, text: "Easy mixing and effective." },
        { name: "Khadija S.", rating: 4, text: "Good for indoor plants." },
        { name: "Shahzaib T.", rating: 5, text: "Great value and quality." },
        { name: "Rida H.", rating: 4, text: "Soil health improved." },
      ],
      accessories: [
        { name: "Arsalan M.", rating: 5, text: "Solid build and comfortable grip." },
        { name: "Iqra S.", rating: 4, text: "Very handy for daily use." },
        { name: "Noman R.", rating: 5, text: "Sharp and sturdy tools." },
        { name: "Laiba K.", rating: 4, text: "Good quality for the price." },
        { name: "Zoya T.", rating: 5, text: "Makes gardening easier." },
        { name: "Yasir A.", rating: 4, text: "Nice finishing and durable." },
      ],
    } as const;

    const list = reviewPool[type];
    const seed = Math.abs(itemId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
    const start = seed % list.length;
    return Array.from({ length: 4 }).map((_, idx) => list[(start + idx) % list.length]);
  }, [type, itemId]);

  const handleAddToCart = () => {
    if (!item) return;
    if (!user) {
      toast({ title: "Login required", description: "Please login to add items to cart.", variant: "destructive" });
      return;
    }

    // Only use plant cart API for DB plants (numeric id). Catalog/demo plants use store-item API.
    const plantId = type === "plants" && "id" in item ? (item as { id: unknown }).id : undefined;
    if (typeof plantId === "number") {
      addToCart.mutate({ plantId, quantity });
      return;
    }

    const priceValue =
      "priceValue" in item
        ? item.priceValue
        : "priceLabel" in item
          ? getFallbackPrice(item.priceLabel)
          : typeof item.price === "number"
            ? item.price
            : 0;

    const category =
      type === "medicines"
        ? "medicine"
        : type === "fertilizers"
          ? "fertilizer"
          : type === "accessories"
            ? "accessory"
            : "category" in item
              ? item.category || "indoor"
              : "indoor";

    addStoreItem.mutate({
      name: item.name,
      price: priceValue,
      imageUrl: item.imageUrl,
      category,
      description: getDescription(),
    });
  };

  if (isLoading && type === "plants") {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold mb-3">Product not found</h1>
        <p className="text-muted-foreground mb-6">
          This item is not available. Browse the store to find another product.
        </p>
        <Link href="/store">
          <Button className="rounded-full px-6">Back to store</Button>
        </Link>
      </div>
    );
  }

  const priceText = getPriceText();
  const categoryLabel = getCategoryLabel();
  const description = getDescription();
  const detailTitle =
    type === "plants"
      ? "Care details"
      : type === "medicines"
        ? "How to use"
        : type === "fertilizers"
          ? "Usage tips"
          : "Product highlights";
  const backHref =
    type === "plants"
      ? "/plants"
      : type === "medicines"
        ? "/medicines"
        : type === "fertilizers"
          ? "/fertilizers"
          : "/accessories";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={backHref} className="text-sm text-primary">
          ← Back to {type}
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="rounded-3xl border bg-background overflow-hidden">
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary/20">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
            {type === "plants" && user && item && (
              <button
                type="button"
                aria-label={isPlantInWishlist((item as { id: number | string }).id) ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur shadow-md hover:bg-white transition-colors"
                onClick={() => toggleWishlist((item as { id: number | string }).id)}
              >
                <Heart
                  className={`h-5 w-5 ${isPlantInWishlist((item as { id: number | string }).id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {categoryLabel}
            </span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{item.name}</h1>
            {priceText && <p className="text-xl font-semibold text-primary">{priceText}</p>}
          </div>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
          <div className="rounded-2xl border bg-background px-5 py-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx} className={idx < 4 ? "text-primary" : "text-muted-foreground"}>
                    ★
                  </span>
                ))}
              </div>
              <span className="font-semibold text-foreground">4.6</span>
              <span className="text-muted-foreground">(12 reviews)</span>
            </div>
          </div>
          <div className="rounded-2xl border bg-secondary/20 p-4">
            <h3 className="text-sm font-semibold mb-2">{detailTitle}</h3>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {detailPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-2xl border bg-background px-4 py-3">
              <p className="font-semibold text-foreground">Availability</p>
              <p>In stock · Limited batch</p>
            </div>
            <div className="rounded-2xl border bg-background px-4 py-3">
              <p className="font-semibold text-foreground">Delivery</p>
              <p>Dispatch in 24–48 hours</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold">Quantity</p>
            <div className="flex items-center rounded-full border bg-background">
              <button
                type="button"
                className="h-9 w-10 rounded-full text-lg text-muted-foreground hover:text-foreground"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                className="h-9 w-10 rounded-full text-lg text-muted-foreground hover:text-foreground"
                onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
              >
                +
              </button>
            </div>
            <span className="text-xs text-muted-foreground">Max 10 per order</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAddToCart}
              disabled={addToCart.isPending || addStoreItem.isPending}
              className="rounded-full px-6"
            >
              {addToCart.isPending || addStoreItem.isPending ? "Adding..." : "Add to cart"}
            </Button>
            <Link href="/cart">
              <Button variant="outline" className="rounded-full px-6">
                Go to cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {relatedItems.length > 0 && (
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-display font-bold">Related items</h2>
              <p className="text-muted-foreground text-sm">
                More picks you might like.
              </p>
            </div>
            <Link href={backHref} className="text-sm text-primary">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedItems.map((related) => (
              <Link key={related.id} href={related.href} className="block">
                <div className="group rounded-2xl border bg-background overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                    <img
                      src={related.imageUrl}
                      alt={related.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold line-clamp-1">{related.name}</h3>
                      <span className="text-sm font-bold text-primary">{related.price}</span>
                    </div>
                    <div className="mt-3 inline-flex items-center justify-center rounded-full border border-input bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                      View details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="mt-10">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-display font-bold">Customer reviews</h2>
            <p className="text-muted-foreground text-sm">
              {plantIdForReviews != null && realReviews.length > 0
                ? `${realReviews.length} review(s) · ${averageRating != null ? averageRating.toFixed(1) : "—"} avg`
                : "Recent feedback from plant lovers."}
            </p>
          </div>
        </div>
        {plantIdForReviews != null && user && (
          <div className="mb-6 rounded-2xl border bg-background p-5">
            <p className="font-semibold mb-3">Write a review</p>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-label={`${r} star${r > 1 ? "s" : ""}`}
                  className="p-1 rounded hover:bg-secondary/50"
                  onClick={() => setReviewRating(r)}
                >
                  <Star
                    className={`h-6 w-6 ${r <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Your review (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="mb-3 min-h-[80px]"
            />
            <Button
              size="sm"
              className="rounded-full"
              disabled={isSubmitting}
              onClick={() => {
                submitReview({ rating: reviewRating, comment: reviewComment || undefined });
                setReviewComment("");
              }}
            >
              {isSubmitting ? "Saving..." : "Submit review"}
            </Button>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {plantIdForReviews != null && realReviews.length > 0 ? (
            realReviews.map((review) => (
              <div key={review.id} className="rounded-2xl border bg-background p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{review.username}</p>
                  <div className="flex gap-0.5 text-primary text-sm">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${idx <= review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
            ))
          ) : plantIdForReviews != null && reviewsLoading ? (
            <p className="text-muted-foreground">Loading reviews...</p>
          ) : plantIdForReviews != null && realReviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.name} className="rounded-2xl border bg-background p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{review.name}</p>
                  <div className="text-primary text-sm">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} className={idx < review.rating ? "text-primary" : "text-muted-foreground"}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
