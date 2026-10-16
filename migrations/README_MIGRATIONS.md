# Migrations

## Apply pending migrations (0007, 0008)

From the project root, with `.env` containing `DATABASE_URL`:

```bash
npm run db:migrate
```

This runs `script/migrate.ts` and applies:

- **0007_add_booking_payment_columns.sql** – adds `amount`, `hours`, `payment_status`, `paid_at`, `payment_method`, `gardener_payout_status`, `gardener_paid_at` to `bookings`.
- **0008_add_user_reset_token.sql** – adds `reset_token`, `reset_token_expires` to `users` (for forgot password).

## Alternative: run SQL manually

```bash
psql "YOUR_DATABASE_URL" -f migrations/0007_add_booking_payment_columns.sql
```

## Or sync full schema

```bash
npm run db:push
```
