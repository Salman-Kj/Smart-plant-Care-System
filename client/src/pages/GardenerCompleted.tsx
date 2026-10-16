import { GardenerLayout } from "@/components/gardener/GardenerLayout";
import { useGardenerBookings } from "@/hooks/use-gardener-bookings";

export default function GardenerCompleted() {
  const { bookings, isLoading } = useGardenerBookings();
  const completed = bookings.filter((b) => b.status === "completed");
  const formatDateTime = (value?: string | null) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <GardenerLayout title="Completed Jobs" subtitle="Completed bookings only">
      <div className="bg-white rounded-2xl border border-border p-6">
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : completed.length === 0 ? (
          <div className="text-muted-foreground">No completed jobs yet.</div>
        ) : (
          <div className="space-y-4">
            {completed.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-border/60 rounded-2xl p-4"
              >
                <div>
                  <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                  <div className="text-sm text-muted-foreground">
                    Service date: {formatDateTime(booking.serviceDate)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Status: {booking.status}
                  </div>
                  <div className="text-sm text-primary font-medium mt-1">
                    Rs {(booking.amount ?? 0).toLocaleString()}
                    {(booking.gardenerPayoutStatus ?? "pending") === "released" && booking.gardenerPaidAt && (
                      <span className="text-muted-foreground font-normal ml-2">
                        — Paid {formatDateTime(booking.gardenerPaidAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-primary font-medium">
                  {(booking.gardenerPayoutStatus ?? "pending") === "released" ? "Paid" : "Completed"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GardenerLayout>
  );
}
