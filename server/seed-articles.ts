import type { IStorage } from "./storage";

const SAMPLE_ARTICLES = [
  {
    title: "How to Care for Indoor Plants",
    slug: "how-to-care-for-indoor-plants",
    content: `Indoor plants bring life and freshness to your home. Here are some simple tips to keep them healthy.

Light: Most indoor plants need bright, indirect light. Place them near a window but avoid direct midday sun. Rotate pots every few weeks so all sides get light.

Watering: Overwatering is the most common mistake. Check the top inch of soil—water only when it feels dry. Use room-temperature water and ensure pots have drainage holes.

Humidity: Many houseplants prefer higher humidity. Group plants together, use a pebble tray with water, or mist leaves occasionally.

Feeding: During spring and summer, feed every 4–6 weeks with a balanced liquid fertilizer. Reduce or stop in autumn and winter when growth slows.

With a little attention, your indoor plants will thrive and reward you with lush foliage and cleaner air.`,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf0KecEYyni4jdAv_4ga5D5w6wVgw_Ir6D-Q&s",
    authorId: null as number | null,
    status: "published" as const,
  },
  {
    title: "Top Watering Tips for Healthy Plants",
    slug: "top-watering-tips",
    content: `Watering correctly is one of the most important skills in plant care. These tips will help you get it right.

When to water: Water in the morning when possible. This gives leaves time to dry and reduces the risk of fungal issues. Avoid watering in the heat of the day.

How much: Water until it runs from the drainage holes, then wait until the top layer of soil is dry before watering again. Shallow watering encourages weak roots.

Water quality: If your tap water is hard or chlorinated, let it sit overnight before using, or use rainwater when you can. Some sensitive plants prefer distilled or filtered water.

Signs of trouble: Drooping or yellow leaves can mean over- or under-watering. Check the soil and adjust your routine. When in doubt, it’s often better to underwater than overwater.

Adjust for the season: Plants need less water in winter and more in summer. Always check the soil rather than following a fixed schedule.`,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk88kxoLze3_j129qLFbpGCxZF0P8NIiSEhw&s",
    authorId: null as number | null,
    status: "published" as const,
  },
  {
    title: "Seasonal Plant Care Guide",
    slug: "seasonal-plant-care",
    content: `Plants have different needs through the year. Here’s a simple seasonal guide to keep your garden and houseplants in good shape.

Spring: Increase watering and start feeding as growth resumes. Repot root-bound plants, prune winter damage, and sow seeds or plant new additions. It’s a great time for propagation.

Summer: Water more often and provide shade for sensitive plants. Watch for pests and remove spent flowers to encourage more blooms. Mulch outdoor beds to retain moisture.

Autumn: Reduce feeding and watering as growth slows. Bring tender plants indoors before frost. Clear fallen leaves and prepare beds for winter. This is a good time to divide perennials.

Winter: Many plants rest. Water sparingly and avoid fertilizing most houseplants. Protect outdoor plants from frost and avoid placing indoor plants near cold drafts or hot radiators.

By tuning your care to the season, you give your plants the best chance to stay healthy year-round.`,
    imageUrl: "https://www.paudhewale.com/s/660a356584d1ac2391ae69de/686c12aeb983f22bb6175a07/blog-cover-33-.png",
    authorId: null as number | null,
    status: "published" as const,
  },
];

export async function seedArticlesIfNeeded(storage: IStorage): Promise<void> {
  const published = await storage.getArticlesPublished();
  if (published.length > 0) return;

  for (let i = 0; i < SAMPLE_ARTICLES.length; i++) {
    const article = SAMPLE_ARTICLES[i];
    await storage.createArticle({
      ...article,
      imageUrl: article.imageUrl,
    });
  }
}

/** Set imageUrl for existing articles by slug (so old seeded articles get images without re-seeding). */
export async function patchArticleImagesIfNeeded(storage: IStorage): Promise<void> {
  for (const sample of SAMPLE_ARTICLES) {
    if (!sample.imageUrl) continue;
    const existing = await storage.getArticleBySlug(sample.slug);
    if (existing) {
      await storage.updateArticle(existing.id, { imageUrl: sample.imageUrl });
    }
  }
}
