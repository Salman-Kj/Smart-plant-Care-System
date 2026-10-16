import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export type GardenerBooking = {
  id: number;
  userId: number;
  gardenerId: number;
  serviceDate: string;
  status: string;
  createdAt: string | null;
  message?: string | null;
  userName?: string;
  userPhone?: string | null;
  userAddress?: string | null;
  amount?: number;
  paymentStatus?: string;
  paymentMethod?: string | null;
  gardenerPayoutStatus?: string;
  gardenerPaidAt?: string | null;
};

export function useGardenerBookings() {
  const { toast } = useToast();

  const bookingsQuery = useQuery<GardenerBooking[]>({
    queryKey: [api.gardenerBookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.gardenerBookings.list.path, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw : [];
      return list.map((b: Record<string, unknown>) => ({
        ...b,
        serviceDate: typeof b.serviceDate === "string" ? b.serviceDate : (b.serviceDate instanceof Date ? (b.serviceDate as Date).toISOString() : String(b.serviceDate ?? "")),
        createdAt: b.createdAt == null ? null : (typeof b.createdAt === "string" ? b.createdAt : (b.createdAt instanceof Date ? (b.createdAt as Date).toISOString() : String(b.createdAt))),
        amount: typeof b.amount === "number" ? b.amount : Number(b.amount) || 0,
        paymentStatus: (b.paymentStatus as string) ?? "unpaid",
        paymentMethod: (b.paymentMethod as string) ?? null,
        gardenerPayoutStatus: (b.gardenerPayoutStatus as string) ?? "pending",
        gardenerPaidAt: b.gardenerPaidAt == null ? null : (typeof b.gardenerPaidAt === "string" ? b.gardenerPaidAt : (b.gardenerPaidAt instanceof Date ? (b.gardenerPaidAt as Date).toISOString() : String(b.gardenerPaidAt))),
      })) as GardenerBooking[];
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/gardener/booking/${id}/accept`);
      return res.json();
    },
    onSuccess: () => bookingsQuery.refetch(),
    onError: (error: Error) =>
      toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/gardener/booking/${id}/reject`);
      return res.json();
    },
    onSuccess: () => {
      bookingsQuery.refetch();
      toast({ title: "Booking Rejected", description: "The booking has been rejected." });
    },
    onError: (error: Error) =>
      toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, cashReceived }: { id: number; cashReceived?: boolean }) => {
      const res = await fetch(`/api/gardener/booking/${id}/complete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cashReceived === true ? { cashReceived: true } : {}),
      });
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Failed to complete booking";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return await res.json();
    },
    onSuccess: () => {
      bookingsQuery.refetch();
      toast({ title: "Booking Completed", description: "The booking has been marked as completed." });
    },
    onError: (error: Error) =>
      toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  return {
    bookings: bookingsQuery.data || [],
    isLoading: bookingsQuery.isLoading,
    accept: acceptMutation,
    reject: rejectMutation,
    complete: completeMutation,
    refetch: bookingsQuery.refetch,
  };
}
