import { useMemo } from "react";
import { GardenerLayout } from "@/components/gardener/GardenerLayout";
import { useGardenerBookings } from "@/hooks/use-gardener-bookings";
import { useAuth } from "@/hooks/use-auth";
import { useGardeners } from "@/hooks/use-gardeners";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function GardenerDashboard() {
  const { bookings, isLoading } = useGardenerBookings();
  const { user } = useAuth();
  const { gardeners } = useGardeners();
  const [, setLocation] = useLocation();

  // Check if gardener profile exists
  const gardener = useMemo(() => {
    if (!user) return null;
    return gardeners.find((g) => g.userId === user.id);
  }, [user, gardeners]);

  useEffect(() => {
    if (user && user.role === "gardener" && !gardener && !isLoading) {
      setLocation("/gardener/profile");
    }
  }, [user, gardener, isLoading, setLocation]);

  const pending = bookings.filter((b) => b.status === "pending");
  const approved = bookings.filter((b) => b.status === "accepted");
  const completed = bookings.filter((b) => b.status === "completed");
  const released = completed.filter((b) => (b.gardenerPayoutStatus ?? "pending") === "released");

  // Earnings only from released (paid by user and released after complete)
  const totalEarnings = released.reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyReleased = released.filter((b) => {
    const paidAt = b.gardenerPaidAt ? new Date(b.gardenerPaidAt).getTime() : new Date(b.serviceDate).getTime();
    return paidAt >= sevenDaysAgo.getTime();
  });
  const weeklyEarnings = weeklyReleased.reduce((sum, b) => sum + (b.amount ?? 0), 0);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const earningsByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return days.map((day) => {
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      return released.filter((b) => {
        const paidAt = b.gardenerPaidAt ? new Date(b.gardenerPaidAt) : new Date(b.serviceDate);
        return paidAt >= day && paidAt <= dayEnd;
      }).reduce((sum, b) => sum + (b.amount ?? 0), 0);
    });
  }, [released]);

  const maxEarnings = Math.max(...earningsByDay, 1);
  const chartHeights = earningsByDay.map((earnings) => Math.round((earnings / maxEarnings) * 100));

  if (isLoading) {
    return (
      <GardenerLayout title="Dashboard" subtitle="Track your earnings and performance">
        <div className="flex justify-center items-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </GardenerLayout>
    );
  }

  if (!gardener) {
    return null;
  }

  return (
    <GardenerLayout title="Dashboard" subtitle="Track your earnings and performance">
      <div className="space-y-8">
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <span className="border-b-2 border-primary pb-2 text-primary">Weekly</span>
          <span className="pb-2 cursor-not-allowed opacity-50">Monthly</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-sm text-muted-foreground">Total Earnings</div>
            <div className="text-2xl font-bold text-primary">Rs {totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {released.length} paid of {completed.length} completed
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-sm text-muted-foreground">Pending Requests</div>
            <div className="text-2xl font-bold text-primary">{pending.length}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {pending.length === 0 ? "No pending requests" : "Awaiting your response"}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-sm text-muted-foreground">Accepted Jobs</div>
            <div className="text-2xl font-bold text-primary">{approved.length}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {approved.length === 0 ? "No accepted jobs" : "In progress"}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-lg font-semibold mb-4">Pending Bookings</div>
            {pending.length === 0 ? (
              <div className="text-sm text-muted-foreground">No pending requests.</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pending.map((booking) => (
                  <div key={booking.id} className="border border-border/60 rounded-xl p-4">
                    <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Service date: {formatDate(booking.serviceDate)}
                    </div>
                    {booking.message && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Message: {booking.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-lg font-semibold mb-4">Accepted Bookings</div>
            {approved.length === 0 ? (
              <div className="text-sm text-muted-foreground">No accepted jobs.</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {approved.map((booking) => (
                  <div key={booking.id} className="border border-border/60 rounded-xl p-4">
                    <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Service date: {formatDate(booking.serviceDate)}
                    </div>
                    {booking.message && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Message: {booking.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-lg font-semibold mb-4">Completed Bookings</div>
            {completed.length === 0 ? (
              <div className="text-sm text-muted-foreground">No completed jobs.</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {completed.map((booking) => (
                  <div key={booking.id} className="border border-border/60 rounded-xl p-4">
                    <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Service date: {formatDate(booking.serviceDate)}
                    </div>
                    <div className="text-sm text-primary font-medium mt-1">
                      Rs {(booking.amount ?? 0).toLocaleString()}
                      {(booking.gardenerPayoutStatus ?? "pending") === "released" && booking.gardenerPaidAt && (
                        <span className="text-muted-foreground font-normal ml-2">
                          — Paid {formatDate(booking.gardenerPaidAt)}
                        </span>
                      )}
                    </div>
                    {booking.message && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Message: {booking.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="text-lg font-semibold mb-6">Earnings Breakdown</div>
          <div className="text-sm text-muted-foreground">Earnings</div>
          <div className="text-3xl font-bold text-primary">Rs {weeklyEarnings.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mb-6">Last 7 Days</div>
          {maxEarnings > 0 ? (
            <div className="grid grid-cols-7 gap-4 items-end h-40">
              {chartHeights.map((height, index) => {
                const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                const dayDate = new Date(now);
                dayDate.setDate(dayDate.getDate() - (6 - index));
                const dayName = dayNames[dayDate.getDay()];
                return (
                  <div key={index} className="flex flex-col items-center gap-3">
                    <div
                      className="w-8 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                      style={{ height: `${Math.max(height, 5)}px` }}
                      title={`Rs ${earningsByDay[index]}`}
                    />
                    <span className="text-xs text-muted-foreground">{dayName}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              No earnings in the last 7 days
            </div>
          )}
        </div>
      </div>
    </GardenerLayout>
  );
}
