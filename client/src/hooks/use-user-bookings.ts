import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export type UserBooking = {
  id: number;
  userId: number;
  gardenerId: number;
  serviceDate: string;
  status: string;
  createdAt: string | null;
  message?: string | null;
  gardenerName?: string | null;
  gardenerTableId?: number | null;
  amount?: number;
  paymentStatus?: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  gardenerPayoutStatus?: string;
  gardenerPaidAt?: string | null;
};

function normalizeBooking(b: Record<string, unknown>): UserBooking {
  return {
    ...b,
    serviceDate: typeof b.serviceDate === "string" ? b.serviceDate : (b.serviceDate instanceof Date ? (b.serviceDate as Date).toISOString() : String(b.serviceDate ?? "")),
    createdAt: b.createdAt == null ? null : (typeof b.createdAt === "string" ? b.createdAt : (b.createdAt instanceof Date ? (b.createdAt as Date).toISOString() : String(b.createdAt))),
    gardenerName: (b.gardenerName as string) ?? null,
    gardenerTableId: typeof b.gardenerTableId === "number" ? b.gardenerTableId : (b.gardenerTableId ? Number(b.gardenerTableId) : null),
    amount: typeof b.amount === "number" ? b.amount : Number(b.amount) || 0,
    paymentStatus: (b.paymentStatus as string) ?? "unpaid",
    paidAt: b.paidAt == null ? null : (typeof b.paidAt === "string" ? b.paidAt : (b.paidAt instanceof Date ? (b.paidAt as Date).toISOString() : String(b.paidAt))),
    paymentMethod: (b.paymentMethod as string) ?? null,
    gardenerPayoutStatus: (b.gardenerPayoutStatus as string) ?? "pending",
    gardenerPaidAt: b.gardenerPaidAt == null ? null : (typeof b.gardenerPaidAt === "string" ? b.gardenerPaidAt : (b.gardenerPaidAt instanceof Date ? (b.gardenerPaidAt as Date).toISOString() : String(b.gardenerPaidAt))),
  } as UserBooking;
}

export function useUserBookings(enabled = true) {
  const queryClient = useQueryClient();
  const bookingsQuery = useQuery<UserBooking[]>({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookings.list.path, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw : [];
      return list.map((b) => normalizeBooking(b as Record<string, unknown>));
    },
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const payBooking = useMutation({
    mutationFn: async ({ bookingId, paymentMethod }: { bookingId: number; paymentMethod: string }) => {
      const path = api.bookings.pay.path.replace(":id", String(bookingId));
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentMethod: paymentMethod || "card" }),
      });
      const text = await res.text();
      if (!res.ok) {
        try {
          const err = JSON.parse(text) as { message?: string };
          throw new Error(err.message || "Payment failed");
        } catch (e) {
          if (e instanceof SyntaxError || text.startsWith("<")) {
            throw new Error("Server error. Please try again. If this persists, run npm run db:push and restart the server.");
          }
          throw e;
        }
      }
      try {
        return JSON.parse(text);
      } catch {
        throw new Error("Server returned invalid response. Please try again.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
    },
  });

  return {
    bookings: bookingsQuery.data || [],
    isLoading: bookingsQuery.isLoading,
    refetch: bookingsQuery.refetch,
    payBooking,
  };
}
