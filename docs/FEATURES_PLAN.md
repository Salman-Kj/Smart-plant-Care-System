# Smart Plant Care – Features Implementation Plan

Implementation order and checklist. Each phase: migration → schema → storage → API → frontend.

| Phase | Feature | Migration | Status |
|-------|---------|-----------|--------|
| 1 | Wishlist | 0010_wishlist.sql | Done |
| 2 | Plant reviews | 0011_plant_reviews.sql | Done |
| 3 | Gardener reviews | 0012_gardener_reviews.sql | Done (API + storage; UI: Rate in MyBookings optional) |
| 4 | Contact page | 0013_contact_messages.sql | Done |
| 5 | Order tracking UI | — | Done |
| 6 | Promo codes | 0014_promo_codes.sql | Pending |
| 7 | Related products | — | Pending |
| 8 | Gardener availability | 0015_gardener_availability.sql | Pending |
| 9 | Newsletter | 0016_newsletter_subscribers.sql | Done |
| 10 | Terms of Service | — | Done |
| 11 | Share + small UX | — | Pending |

Rules: New tables only; no breaking changes to existing APIs; additive columns with default/null.
