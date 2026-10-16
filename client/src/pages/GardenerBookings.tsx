import { useState, useMemo } from "react";
import { GardenerLayout } from "@/components/gardener/GardenerLayout";
import { useGardenerBookings } from "@/hooks/use-gardener-bookings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";

function isCodUnpaid(booking: { paymentMethod?: string | null; paymentStatus?: string }) {
  return (booking.paymentMethod ?? "").toLowerCase() === "cod" && (booking.paymentStatus ?? "unpaid") !== "paid";
}
function isNonCodUnpaid(booking: { paymentMethod?: string | null; paymentStatus?: string }) {
  const method = (booking.paymentMethod ?? "").toLowerCase();
  const unpaid = (booking.paymentStatus ?? "unpaid") !== "paid";
  return method !== "cod" && unpaid;
}

export default function GardenerBookings() {
  const { bookings, accept, reject, complete, isLoading } = useGardenerBookings();
  const [cashReceivedIds, setCashReceivedIds] = useState<Set<number>>(new Set());

  const pending = bookings.filter((b) => b.status === "pending");
  const approved = bookings.filter((b) => b.status === "accepted");
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
    <GardenerLayout title="Jobs" subtitle="Overview">
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-transparent p-0 gap-6">
          <TabsTrigger value="overview" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="pending" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Pending
          </TabsTrigger>
          <TabsTrigger value="accepted" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Accepted
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="text-sm text-muted-foreground">Pending Jobs</div>
              <div className="text-2xl font-bold">{pending.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="text-sm text-muted-foreground">Accepted Jobs</div>
              <div className="text-2xl font-bold">{approved.length}</div>
            </div>
            <Link href="/gardener/completed">
              <div className="bg-white rounded-2xl border border-border p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="text-sm text-muted-foreground">Completed Jobs</div>
                <div className="text-2xl font-bold">{bookings.filter((b) => b.status === "completed").length}</div>
                <div className="text-xs text-primary mt-1">View history →</div>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-lg font-semibold mb-4">Pending Booking Requests</div>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : pending.length === 0 ? (
              <div className="text-muted-foreground">No pending requests.</div>
            ) : (
              <div className="space-y-4">
                {pending.map((booking) => (
                <div
                    key={booking.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-border/60 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                      <div className="text-sm text-muted-foreground">
                        Phone: {booking.userPhone || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Address: {booking.userAddress || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Service date: {formatDateTime(booking.serviceDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Booking time: {formatDateTime(booking.createdAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Message: {booking.message || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {booking.status}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => accept.mutate(booking.id)}
                        disabled={accept.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => reject.mutate(booking.id)}
                        disabled={reject.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-lg font-semibold mb-4">Accepted Bookings</div>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : approved.length === 0 ? (
              <div className="text-muted-foreground">No accepted bookings.</div>
            ) : (
              <div className="space-y-4">
                {approved.map((booking) => (
                <div
                    key={booking.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-border/60 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                      <div className="text-sm text-muted-foreground">
                        Phone: {booking.userPhone || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Address: {booking.userAddress || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Service date: {formatDateTime(booking.serviceDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Booking time: {formatDateTime(booking.createdAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Message: {booking.message || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {booking.status}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-sm text-primary font-medium mb-2">Accepted</div>
                      {isNonCodUnpaid(booking) && (
                        <span className="text-xs text-amber-600">Customer must pay first</span>
                      )}
                      {isCodUnpaid(booking) && (
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cashReceivedIds.has(booking.id)}
                            onChange={() =>
                              setCashReceivedIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(booking.id)) next.delete(booking.id);
                                else next.add(booking.id);
                                return next;
                              })
                            }
                            className="rounded border-input"
                          />
                          I received cash from customer
                        </label>
                      )}
                      <Button
                        onClick={() =>
                          complete.mutate({
                            id: booking.id,
                            cashReceived: isCodUnpaid(booking) ? cashReceivedIds.has(booking.id) : undefined,
                          })
                        }
                        disabled={
                          complete.isPending ||
                          (isCodUnpaid(booking) && !cashReceivedIds.has(booking.id)) ||
                          isNonCodUnpaid(booking)
                        }
                        size="sm"
                        className="min-w-[140px]"
                        title={isNonCodUnpaid(booking) ? "Customer must pay first" : undefined}
                      >
                        {complete.isPending ? "Completing..." : "Mark Complete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AvailabilityCalendar bookings={bookings} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-8">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-lg font-semibold mb-4">Pending Booking Requests</div>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : pending.length === 0 ? (
              <div className="text-muted-foreground">No pending requests.</div>
            ) : (
              <div className="space-y-4">
                {pending.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-border/60 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                      <div className="text-sm text-muted-foreground">
                        Phone: {booking.userPhone || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Address: {booking.userAddress || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Service date: {formatDateTime(booking.serviceDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Booking time: {formatDateTime(booking.createdAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Message: {booking.message || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {booking.status}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => accept.mutate(booking.id)}
                        disabled={accept.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => reject.mutate(booking.id)}
                        disabled={reject.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-8">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-lg font-semibold mb-4">Accepted Bookings</div>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : approved.length === 0 ? (
              <div className="text-muted-foreground">No accepted bookings.</div>
            ) : (
              <div className="space-y-4">
                {approved.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-border/60 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{booking.userName || "Unknown User"}</div>
                      <div className="text-sm text-muted-foreground">
                        Phone: {booking.userPhone || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Address: {booking.userAddress || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Service date: {formatDateTime(booking.serviceDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Booking time: {formatDateTime(booking.createdAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Message: {booking.message || "Not provided"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {booking.status}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-sm text-primary font-medium mb-2">Accepted</div>
                      {isNonCodUnpaid(booking) && (
                        <span className="text-xs text-amber-600">Customer must pay first</span>
                      )}
                      {isCodUnpaid(booking) && (
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cashReceivedIds.has(booking.id)}
                            onChange={() =>
                              setCashReceivedIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(booking.id)) next.delete(booking.id);
                                else next.add(booking.id);
                                return next;
                              })
                            }
                            className="rounded border-input"
                          />
                          I received cash from customer
                        </label>
                      )}
                      <Button
                        onClick={() =>
                          complete.mutate({
                            id: booking.id,
                            cashReceived: isCodUnpaid(booking) ? cashReceivedIds.has(booking.id) : undefined,
                          })
                        }
                        disabled={
                          complete.isPending ||
                          (isCodUnpaid(booking) && !cashReceivedIds.has(booking.id)) ||
                          isNonCodUnpaid(booking)
                        }
                        size="sm"
                        className="min-w-[140px]"
                        title={isNonCodUnpaid(booking) ? "Customer must pay first" : undefined}
                      >
                        {complete.isPending ? "Completing..." : "Mark Complete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </GardenerLayout>
  );
}

// Availability Calendar Component
function AvailabilityCalendar({ bookings }: { bookings: any[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get accepted bookings dates
  const acceptedDates = useMemo(() => {
    return bookings
      .filter((b) => b.status === "accepted")
      .map((b) => {
        const date = new Date(b.serviceDate);
        return date.toISOString().split("T")[0]; // YYYY-MM-DD format
      });
  }, [bookings]);

  // Get pending bookings dates
  const pendingDates = useMemo(() => {
    return bookings
      .filter((b) => b.status === "pending")
      .map((b) => {
        const date = new Date(b.serviceDate);
        return date.toISOString().split("T")[0];
      });
  }, [bookings]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const renderCalendar = (date: Date) => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(date);
    const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isAccepted = acceptedDates.includes(dateStr);
      const isPending = pendingDates.includes(dateStr);
      const isPast = new Date(dateStr) < new Date(new Date().toISOString().split("T")[0]);
      
      days.push(
        <div
          key={day}
          className={`h-8 rounded-md flex items-center justify-center text-sm cursor-default ${
            isPast
              ? "text-muted-foreground/50"
              : isAccepted
              ? "bg-primary/20 text-primary font-medium"
              : isPending
              ? "bg-orange-100 text-orange-700 font-medium"
              : "hover:bg-secondary/50"
          }`}
          title={
            isAccepted
              ? "Accepted booking"
              : isPending
              ? "Pending booking"
              : isPast
              ? "Past date"
              : "Available"
          }
        >
          {day}
        </div>
      );
    }
    
    return { monthName, days };
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const currentMonthCalendar = renderCalendar(currentMonth);
  const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const nextMonthCalendar = renderCalendar(nextMonthDate);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="text-lg font-semibold mb-6">Availability Calendar</div>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20"></div>
          <span>Accepted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary/50"></div>
          <span>Available</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">{currentMonthCalendar.monthName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-xs uppercase font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {currentMonthCalendar.days}
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(nextMonthDate)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">{nextMonthCalendar.monthName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 1);
                setCurrentMonth(next);
              }}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-xs uppercase font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {nextMonthCalendar.days}
          </div>
        </div>
      </div>
    </div>
  );
}
