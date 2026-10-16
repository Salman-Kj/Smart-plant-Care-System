# Notification System – Verification Summary

## ✅ Verified Components

### 1. Database
- **Migration:** `migrations/0009_notifications.sql` – table `notifications` with `user_id`, `type`, `related_id`, `message`, `read`, `created_at`. Indexes on `user_id` and `(user_id, read)`.
- **Schema:** `shared/schema.ts` – `notifications` table and `InsertNotification` type match migration.
- **Run migration:** `npm run db:migrate` (if not already applied).

### 2. Storage (`server/storage.ts`)
- `createNotification(notification)` – inserts and returns notification.
- `getNotificationsForUser(userId)` – returns last 50, newest first.
- `getUnreadCountForUser(userId)` – returns count of unread.
- `markNotificationRead(notificationId, userId)` – sets `read: true` for that user’s notification.

### 3. API (`server/routes.ts`)
- **GET /api/notifications** – `requireUser`, returns list for `req.user.id`.
- **GET /api/notifications/unread-count** – `requireUser`, returns `{ count }`.
- **PUT /api/notifications/:id/read** – `requireUser`, marks one as read; 404 if not found or not owned.

### 4. When notifications are created
- **New order:** After `storage.createOrder()`, all users with role `admin` get a notification: `"New order #<orderId> placed."`
- **New booking:** After `storage.createBooking()` (hire gardener), the gardener’s **user** id gets a notification: `"New booking request #<bookingId> received."`

### 5. Frontend
- **Hook:** `use-notifications.ts` – fetches list + unread count when `enabled`, `markRead(id)` with cache invalidation.
- **Component:** `NotificationBell` – bell icon, unread badge, dropdown list; click item calls `markRead(n.id)`.
- **Usage:** Navbar (logged-in user), AdminLayout header, GardenerLayout header.

## How to test manually

1. **Apply migration (if needed)**  
   `npm run db:migrate`

2. **Start app**  
   `npm run dev`

3. **Admin – new order**
   - Login as admin.
   - In another browser/incognito, login as normal user, place an order (Store → add to cart → checkout).
   - As admin, open notification bell (Navbar or Admin dashboard) – should see “New order #X placed.”

4. **Gardener – new booking**
   - Login as gardener.
   - In another browser/incognito, login as user, go to Hire Gardener, book that gardener.
   - As gardener, open notification bell – should see “New booking request #X received.”

5. **Mark as read**
   - Click a notification in the dropdown – it should get “read” styling and unread count should decrease.

## Notes
- Notifications are per **user** (admin user id, gardener user id). Bell is shown only when user is logged in.
- Unread count and list refetch after marking as read (React Query invalidation).
