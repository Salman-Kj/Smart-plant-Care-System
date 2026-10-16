import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, CalendarCheck, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type AdminBookingRow = {
  id: number;
  userId: number;
  gardenerId: number;
  userName: string | null;
  gardenerName: string | null;
  userPhone: string | null;
  userAddress: string | null;
  serviceDate: string;
  status: string;
  amount: number;
  hours: number;
  paymentStatus: string;
  paidAt: string | null;
  paymentMethod: string | null;
  gardenerPayoutStatus: string;
  gardenerPaidAt: string | null;
  gardenerPaymentMethod: string | null;
  gardenerPaymentDetail: string | null;
  gardenerAccountTitle: string | null;
  createdAt: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function maskDetail(s: string | null | undefined) {
  if (!s || s.length < 4) return "—";
  return "****" + s.slice(-4);
}

export default function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bookings", { credentials: "include" });
      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();
      if (!contentType.includes("application/json")) {
        if (text.trimStart().startsWith("<")) {
          throw new Error(
            "Server ne HTML bheja (JSON nahi). Database schema update karein: terminal mein 'npm run db:push' chala kar server restart karein."
          );
        }
        throw new Error("Failed to fetch bookings");
      }
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }
      if (!res.ok) {
        const msg = (data as { message?: string })?.message || "Failed to fetch bookings";
        throw new Error(msg);
      }
      return Array.isArray(data) ? data : [];
    },
  });

  const filtered = (bookings as AdminBookingRow[]).filter(
    (b) =>
      String(b.id).includes(searchQuery) ||
      (b.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.gardenerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.paymentStatus || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout title="Hire Bookings">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Hire Bookings">
        <div className="text-destructive py-8">
          {error instanceof Error ? error.message : "Failed to load bookings."}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hire Bookings">
      <Card className="border border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking ID, user, gardener, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">User</th>
                  <th className="p-3 font-medium">Gardener</th>
                  <th className="p-3 font-medium">Service Date</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">User Pay</th>
                  <th className="p-3 font-medium">Paid At</th>
                  <th className="p-3 font-medium">Method</th>
                  <th className="p-3 font-medium">Payout</th>
                  <th className="p-3 font-medium">Gardener Pay Through</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="border-b border-border/40 hover:bg-secondary/30">
                      <td className="p-3">{b.id}</td>
                      <td className="p-3">
                        <div className="font-medium">{b.userName || "—"}</div>
                        {b.userPhone && (
                          <div className="text-xs text-muted-foreground">{b.userPhone}</div>
                        )}
                      </td>
                      <td className="p-3 font-medium">{b.gardenerName || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{formatDate(b.serviceDate)}</td>
                      <td className="p-3 font-medium">Rs {(b.amount ?? 0).toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={
                            (b.paymentStatus || "").toLowerCase() === "paid"
                              ? "text-green-600 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {b.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{formatDate(b.paidAt)}</td>
                      <td className="p-3 capitalize">{b.paymentMethod || "—"}</td>
                      <td className="p-3">
                        <span
                          className={
                            (b.gardenerPayoutStatus || "").toLowerCase() === "released"
                              ? "text-green-600 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {b.gardenerPayoutStatus || "pending"}
                        </span>
                        {b.gardenerPaidAt && (
                          <div className="text-xs text-muted-foreground">
                            {formatDate(b.gardenerPaidAt)}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-xs">
                          <span className="capitalize font-medium">
                            {b.gardenerPaymentMethod || "—"}
                          </span>
                          {b.gardenerPaymentDetail && (
                            <div className="text-muted-foreground">
                              {maskDetail(b.gardenerPaymentDetail)}
                              {b.gardenerAccountTitle && ` · ${b.gardenerAccountTitle}`}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
