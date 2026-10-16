/**
 * Chatbot FAQ: keywords (user message contains any) → auto reply.
 * First match wins; all matching is case-insensitive.
 * Input is normalized (trim, lowercase, collapse spaces) for better matching.
 */

export interface ChatbotFaqEntry {
  keywords: string[];
  reply: string;
}

export const CHATBOT_GREETING =
  "Hi! I'm your Smart Plant Care assistant. You can ask about: booking a gardener, plant disease detection, store, pricing, or contact. Type your question or choose a quick option below.";

export const CHATBOT_DEFAULT_REPLY =
  "I didn't quite get that. You can ask about: **book a gardener**, **plant disease**, **store**, **pricing**, **my orders**, or **contact**. Or choose a quick option below.";

/** Normalize user input for matching: trim, lowercase, collapse spaces. */
function normalizeMessage(msg: string): string {
  return msg
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export const chatbotFaq: ChatbotFaqEntry[] = [
  // Greeting – keep first
  {
    keywords: ["hi", "hello", "hey", "start", "good morning", "good evening", "assalam", "salam"],
    reply: CHATBOT_GREETING,
  },
  // Thanks / bye
  {
    keywords: ["thanks", "thank you", "thnx", "bye", "goodbye", "ok bye"],
    reply: "You're welcome! If you need anything else, just ask. Happy planting!",
  },
  // My Bookings (specific before generic "book")
  {
    keywords: ["my bookings", "my booking", "bookings", "booking list", "kahan dekhun booking"],
    reply:
      "After login, go to **My Bookings** from the menu to see all your gardener bookings. You can cancel pending ones or view accepted/completed status there.",
  },
  // Book Gardener
  {
    keywords: [
      "gardener",
      "book gardener",
      "hire gardener",
      "hire",
      "book",
      "gardner",
      "mali",
      "gardening service",
    ],
    reply:
      "Book a gardener from our **Hire Gardener** page. Go to the menu, choose a gardener, pick date & time, enter your address and phone, then submit. You can also use the quick link below.",
  },
  // Price / payment
  {
    keywords: [
      "price",
      "cost",
      "rate",
      "payment",
      "pay",
      "fee",
      "charges",
      "paymant",
      "pricing",
      "kitna",
      "how much",
    ],
    reply:
      "Gardener rates vary by experience. You'll see the hourly rate on each gardener's profile. Payment can be done online or **Cash on Delivery (COD)** after the gardener accepts your booking.",
  },
  // Disease detection
  {
    keywords: [
      "disease",
      "plant disease",
      "sick plant",
      "leaf problem",
      "patta",
      "detect",
      "disease detection",
      "marz",
      "treatment",
    ],
    reply:
      "Use our **Disease Detect** tool: upload a photo of the affected leaf or plant and we'll suggest the cause and treatment. Find it in the menu.",
  },
  // Store / shop
  {
    keywords: [
      "store",
      "shop",
      "buy plants",
      "order plants",
      "plants buy",
      "buy",
      "store kahan",
    ],
    reply:
      "Buy plants from our **Store**. Add items to cart and checkout. Track your order in **My Orders** after login.",
  },
  // Cart
  {
    keywords: ["cart", "basket", "bag", "cart kahan", "checkout"],
    reply:
      "Your **Cart** is in the menu. Add items from the **Store**, then open Cart to review and checkout. You need to be logged in to place an order.",
  },
  // Orders / track
  {
    keywords: [
      "order",
      "my order",
      "track order",
      "order status",
      "orders",
      "kahan hai order",
      "delivery",
      "dispatched",
      "delivered",
    ],
    reply:
      "After login, go to **My Orders** to see all your orders and their status (pending, dispatched, delivered). You can also open the order for more details.",
  },
  // Cancel
  {
    keywords: ["cancel", "cancel booking", "cancel order", "cancel kar sakte", "cancel karna"],
    reply:
      "Bookings: From **My Bookings** you can cancel pending bookings. Orders: For order cancellation, contact support at support@smartplantcare.com with your order ID.",
  },
  // Contact / help
  {
    keywords: [
      "contact",
      "support",
      "help",
      "email",
      "phone",
      "madad",
      "help chahiye",
      "number",
      "address",
    ],
    reply:
      "For support, email us at support@smartplantcare.com or visit the **About** page for more contact details. We're here to help!",
  },
  // Login / account
  {
    keywords: ["account", "login", "register", "sign up", "signin", "sign in", "log in", "signup"],
    reply:
      "Use **Login** or **Register** from the top menu. Choose your role: User (to book & shop), Gardener (to offer services), or Admin.",
  },
  // Blog
  {
    keywords: ["blog", "articles", "post", "tips", "plant tips"],
    reply:
      "We have a **Blog** with plant care tips and articles. Open it from the menu to read the latest posts.",
  },
  // About
  {
    keywords: ["about", "about us", "who are you", "company", "hum kya hain"],
    reply:
      "Smart Plant Care helps you book gardeners, detect plant diseases, and shop for plants. Visit the **About** page from the menu for our mission and contact info.",
  },
  // FAQ
  {
    keywords: ["faq", "frequently asked", "common questions", "sawal"],
    reply:
      "We have an FAQ section on our **About** page. You can also ask me about: booking, pricing, disease detection, store, orders, or contact.",
  },
];

/**
 * Find reply for user message.
 * Message is normalized; first matching keyword wins.
 */
export function getChatbotReply(message: string): string {
  const normalized = normalizeMessage(message);
  if (!normalized) return CHATBOT_GREETING;

  for (const entry of chatbotFaq) {
    const found = entry.keywords.some((kw) => normalized.includes(kw.toLowerCase()));
    if (found) return entry.reply;
  }

  return CHATBOT_DEFAULT_REPLY;
}

/**
 * Quick action buttons: label + keyword to send (same reply logic).
 */
export const chatbotQuickActions: { label: string; keyword: string; path?: string }[] = [
  { label: "Book Gardener", keyword: "book gardener", path: "/gardeners" },
  { label: "Disease Detection", keyword: "plant disease", path: "/disease" },
  { label: "Store", keyword: "store", path: "/store" },
  { label: "My Orders", keyword: "my order", path: "/orders" },
  { label: "My Bookings", keyword: "my bookings", path: "/my-bookings" },
  { label: "Contact / Help", keyword: "contact", path: "/about" },
];

/**
 * Phrases in replies that should be clickable (bold text → path).
 * Used by ChatbotWidget to render links.
 */
export const chatbotReplyLinks: Record<string, string> = {
  "My Orders": "/orders",
  "My Bookings": "/my-bookings",
  "Hire Gardener": "/gardeners",
  "Disease Detect": "/disease",
  "About": "/about",
  "Store": "/store",
  "Blog": "/blog",
  "Cart": "/cart",
  "Login": "/auth",
  "Register": "/auth",
};
