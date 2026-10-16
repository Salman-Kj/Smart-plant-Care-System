# Smart Plant Care – Fixed Chatbot Plan (Safe, No Crash)

Add a **fixed floating chatbot** on public pages only. All changes are **additive**; no existing routes, API, or layouts are modified.

---

## Golden rules for this feature

| Rule | Meaning |
|------|--------|
| **Add only** | New component, new data file. No removal or change of existing components/routes. |
| **Same visibility as Navbar/Footer** | Show chatbot only where Navbar & Footer show: public pages. Hide on `/gardener/*` and `/admin/*`. |
| **No new API** | All replies are client-side (keyword → reply). No server routes, no DB. |
| **No shared/routes or server/routes change** | Backend untouched. |
| **One place in App.tsx** | Single line: render `<ChatbotWidget />` with same condition as Footer. |

---

## What was built

1. **Fixed button** – Bottom-right, always visible on public pages (scroll ke sath).
2. **Chat panel** – Click par open/close; greeting + message list + input + quick action buttons.
3. **Auto replies** – User message → keyword match → predefined reply (no backend).
4. **Quick options** – Buttons: Book Gardener, Disease Detection, Store, Contact (navigate + same replies).

---

## Files added

| File | Purpose |
|------|--------|
| `client/src/data/chatbot-faq.ts` | FAQ pairs: keywords + reply text. `getChatbotReply()`, `chatbotQuickActions`. |
| `client/src/components/chatbot/ChatbotWidget.tsx` | Fixed button + chat panel UI. Uses `chatbot-faq.ts` for replies. |

---

## Change in App.tsx

- Import: `import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";`
- Render: `{!isGardenerRoute && !isAdminRoute && <ChatbotWidget />}` (next to Footer).

No routes, Router, Navbar, or Footer logic changed.

---

## FAQ keywords and replies (chatbot-faq.ts)

| Keywords (user message contains any) | Auto reply |
|--------------------------------------|------------|
| hi, hello, hey, start | Greeting |
| gardener, book gardener, hire gardener, book | Book gardener reply |
| price, cost, rate, payment, pay, fee | Pricing reply |
| disease, plant disease, sick plant, leaf problem | Disease detection reply |
| store, shop, buy plants, order plants | Store reply |
| order, my order, track order, order status | My Orders reply |
| cancel, cancel booking, cancel order | Cancel reply |
| contact, support, help, email, phone | Contact reply |
| account, login, register, sign up | Login/Register reply |
| faq, frequently asked | FAQ reply |
| *(default)* | Default "I didn't get that" reply |

Quick actions: Book Gardener → `/gardeners`, Disease Detection → `/disease`, Store → `/store`, Contact → `/about`.

---

## Testing checklist

- [ ] Home, Store, Gardeners, About, Blog, Auth – chatbot open/close; no layout shift or crash.
- [ ] Type "hello" → greeting reply.
- [ ] Type "book gardener" → booking reply.
- [ ] Type "price" → pricing reply.
- [ ] Type "xyz" → default reply.
- [ ] Quick buttons show correct reply and/or navigate.
- [ ] `/gardener/bookings` – chatbot **not** visible.
- [ ] `/admin/dashboard` – chatbot **not** visible.
- [ ] Login, cart, checkout, my orders – still work.

---

## Rollback

1. Remove from App.tsx: import + `<ChatbotWidget />`.
2. Optionally delete `ChatbotWidget.tsx` and `chatbot-faq.ts`.

No migrations, no API – rollback is instant.
