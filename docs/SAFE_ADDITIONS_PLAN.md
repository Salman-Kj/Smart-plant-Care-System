# Smart Plant Care – Safe Additions Plan

Add features **without breaking** existing flows. Each change is additive; no removal of existing behaviour.

---

## Golden rules (every change)

| Rule | Meaning |
|------|--------|
| **Add, don’t remove** | New pages, new API, new columns only. Don’t delete existing routes/columns. |
| **Optional columns** | New DB columns: nullable or with a default; old rows must still work. |
| **New routes** | New features use new routes (`/privacy`, `/forgot-password`); don’t change existing URLs. |
| **Backward compatible API** | New query params optional (`?search=`, `?page=`); without params, behaviour stays the same. |
| **One phase, then test** | After each phase, test: login, booking, order, admin. |
| **Safe migrations** | Use `ADD COLUMN IF NOT EXISTS`, defaults; avoid destructive `DROP` / data delete. |

---

## Phase 0 – Before starting

- [ ] Git: commit current code; create branch `feature/add-features`.
- [ ] Backup DB if possible.
- [ ] Checklist: Login, Hire Gardener, Booking complete, Order place, Admin – all working. Re-test this after each phase.

---

## Phase 1 – Safest first (Auth + static pages)

| Feature | Safe approach |
|--------|----------------|
| **Forgot password** | New routes `/forgot-password`, `/reset-password`. New API `/api/auth/forgot-password`, `/api/auth/reset-password`. New columns on `users`: `reset_token`, `reset_token_expires` (nullable). Leave login/register unchanged. |
| **Privacy Policy** | New page `PrivacyPolicy.tsx`, new route `/privacy`. Footer link from `/about` to `/privacy`. No change to existing pages/API. |
| **FAQ** | New section on About page or new route `/faq`. Don’t remove existing About content. |

**After Phase 1:** Login, Register, Home, About, Footer links – all should work as before.

---

## Phase 2 – Search + filters (existing data safe)

| Feature | Safe approach |
|--------|----------------|
| **Search** | Store: client-side filter on existing list, or optional `?q=` param; no param = full list. Gardeners: optional `search` param; no param = same list as now. Blog: client-side filter. Don’t change existing response shape. |
| **Filters / sort** | Start client-side (same API). If backend filter later, use new optional params; default = no filter = current behaviour. |

**After Phase 2:** Store, Gardeners, Blog without search/filter – same as now.

---

## Phase 3 – Ratings + order tracking

| Feature | Safe approach |
|--------|----------------|
| **Ratings** | New table `gardener_reviews`; don’t change `bookings`/`gardeners`. New API: `POST /api/bookings/:id/review`, `GET /api/gardeners/:id/reviews`. Show rating on gardener profile only if data exists. |
| **Order tracking** | Use existing `status`; add timeline UI. If adding `dispatched_at`, use new nullable column; old orders can show “Not dispatched”. |

**After Phase 3:** Booking complete, My Bookings, My Orders, Admin orders – unchanged.

---

## Phase 4 – Pagination + UI polish

| Feature | Safe approach |
|--------|----------------|
| **Pagination** | API: optional `?page=1&limit=10`; no params = return full list. Add pagination only where needed; other pages unchanged. |
| **Skeletons / empty** | UI only; same data fetch. No API contract change. |

**After Phase 4:** Admin lists, My Orders, My Bookings – same data; better display.

---

## Phase 5 – Notifications + admin

| Feature | Safe approach |
|--------|----------------|
| **Email** | New code path (e.g. on booking accepted); existing accept logic unchanged. If email fails, log only; don’t fail the request. |
| **Notifications** | New table; no change to existing tables. Bell in navbar optional. |
| **Admin stats** | New API `GET /api/admin/stats`; existing admin routes unchanged. |
| **Export / payouts** | New endpoints; existing list/edit behaviour unchanged. |

**After Phase 5:** Admin dashboard, bookings, orders – same as before.

---

## Rollback (if something goes wrong)

- **Code:** `git checkout main` (or previous commit); drop feature branch.
- **DB:** Only new columns/tables added; optional: separate migration to drop them if needed. Prefer backup restore for data safety.
- **Deploy:** Run previous build; keep new env vars (e.g. SMTP) optional so app works without them.

---

## Checklist after every phase

- [ ] Login / Register (user, gardener, admin)
- [ ] Home, Store, Cart, Checkout
- [ ] Hire Gardener → Booking → Mark complete (COD)
- [ ] My Bookings, My Orders
- [ ] Admin: Orders, Bookings, Users, Settings
- [ ] Blog, About, Footer links

If all pass, the project is unaffected; plan is applied safely.
