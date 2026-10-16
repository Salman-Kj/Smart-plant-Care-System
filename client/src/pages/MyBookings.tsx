import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserBookings, type UserBooking } from "@/hooks/use-user-bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2, MessageCircle, Send, CreditCard, CalendarCheck, Star } from "lucide-react";
import { useGardenerReviews } from "@/hooks/use-gardener-reviews";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";

export default function MyBookings() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { bookings, isLoading, payBooking } = useUserBookings(Boolean(user));
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payBookingId, setPayBookingId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<"card" | "cod" | "wallet">("card");
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rateBooking, setRateBooking] = useState<{ id: number; gardenerTableId: number } | null>(null);
  const [rateRating, setRateRating] = useState(5);
  const [rateComment, setRateComment] = useState("");
  const { submitReview, isSubmitting } = useGardenerReviews(null, false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const sortedBookings = [...bookings].sort((a, b) => {
    const order: Record<string, number> = {
      accepted: 0,
      pending: 1,
      rejected: 2,
      cancelled: 3,
    };
    const aRank = order[a.status] ?? 9;
    const bRank = order[b.status] ?? 9;
    if (aRank !== bRank) return aRank - bRank;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
  const confirmedBookings = sortedBookings.filter((booking) => booking.status === "accepted");
  const activeBookings = sortedBookings.filter(
    (booking) => booking.status === "pending" || booking.status === "completed"
  );
  const historyBookings = sortedBookings.filter(
    (booking) => booking.status === "cancelled" || booking.status === "rejected"
  );

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

  const deleteBooking = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const baseUrl = api.bookings.remove.path.replace(":id", String(id));
      const url = status === "pending" ? baseUrl : `${baseUrl}?mode=delete`;
      await apiRequest("DELETE", url);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      if (variables.status === "pending") {
        toast({ title: "Cancelled", description: "Appointment cancelled." });
      } else {
        toast({ title: "Deleted", description: "Booking removed." });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ bookingId, content }: { bookingId: number; content: string }) => {
      const res = await fetch(api.messages.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId, content }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send message");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Message Sent", description: "Your message has been sent to the gardener." });
      setMessageText("");
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: [api.messages.getForBooking.path] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const { data: messages } = useQuery({
    queryKey: [api.messages.getForBooking.path, selectedBooking],
    queryFn: async () => {
      if (!selectedBooking) return [];
      const res = await fetch(api.messages.getForBooking.path.replace(":bookingId", String(selectedBooking)), {
        credentials: "include",
      });
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!selectedBooking,
  });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/auth");
    }
  }, [isAuthLoading, user, setLocation]);

  if (!isAuthLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">Please login</h1>
        <p className="text-muted-foreground">Login to view your bookings.</p>
      </div>
    );
  }

  const handlePayClick = (booking: typeof bookings[0]) => {
    setPayBookingId(booking.id);
    setPayMethod("card");
    setCardDetails({ cardNumber: "", cardName: "", expiryDate: "", cvv: "" });
    setPayDialogOpen(true);
  };

  const handleCardInputChange = (field: string, value: string) => {
    if (field === "cardNumber") {
      const formatted = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      if (formatted.length <= 19) setCardDetails((d) => ({ ...d, cardNumber: formatted }));
    } else if (field === "expiryDate") {
      const formatted = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
      setCardDetails((d) => ({ ...d, expiryDate: formatted }));
    } else if (field === "cvv") {
      if (value.length <= 3 && /^\d*$/.test(value)) setCardDetails((d) => ({ ...d, cvv: value }));
    } else {
      setCardDetails((d) => ({ ...d, [field]: value }));
    }
  };

  const isCardDetailsValid = () =>
    cardDetails.cardNumber.replace(/\s/g, "").length === 16 &&
    cardDetails.cardName.trim().length > 0 &&
    cardDetails.expiryDate.length === 5 &&
    cardDetails.cvv.length === 3;

  const cardNumberInvalid = cardDetails.cardNumber.replace(/\s/g, "").length > 0 && cardDetails.cardNumber.replace(/\s/g, "").length !== 16;
  const cardNameInvalid = cardDetails.cardName.trim().length === 0 && cardDetails.cardName.length > 0;
  const expiryInvalid = cardDetails.expiryDate.length > 0 && cardDetails.expiryDate.length !== 5;
  const cvvInvalid = cardDetails.cvv.length > 0 && cardDetails.cvv.length !== 3;

  const handleConfirmPay = () => {
    if (payBookingId == null) return;
    if (payMethod === "card" && !isCardDetailsValid()) {
      toast({ title: "Invalid card details", description: "Please fill all card details correctly.", variant: "destructive" });
      return;
    }
    payBooking.mutate(
      { bookingId: payBookingId, paymentMethod: payMethod },
      {
        onSuccess: () => {
          if (payMethod === "cod") {
            toast({
              title: "COD confirmed",
              description: "You will pay in cash when the gardener completes the service.",
            });
          } else {
            toast({ title: "Payment successful", description: "Your payment has been recorded." });
          }
          setPayDialogOpen(false);
          setPayBookingId(null);
        },
        onError: (e: Error) => {
          toast({ title: "Payment failed", description: e.message, variant: "destructive" });
        },
      }
    );
  };

  const renderTable = (items: typeof bookings, emptyText: string) => (
    <Card className="border border-border/60">
      <CardContent className="p-0">
        <div className="grid grid-cols-8 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
          <div>Gardener</div>
          <div>Service Date</div>
          <div>Status</div>
          <div>Amount</div>
          <div>Payment</div>
          <div>Message</div>
          <div>Action</div>
          <div>Chat</div>
        </div>
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          items.map((booking) => (
            <div key={booking.id} className="grid grid-cols-8 gap-4 p-4 border-b last:border-b-0 text-sm items-center">
              <div className="font-medium">{booking.gardenerName || "Gardener"}</div>
              <div>{formatDateTime(booking.serviceDate || booking.createdAt)}</div>
              <div className="text-primary">{booking.status}</div>
              <div>Rs {(booking.amount ?? 0).toLocaleString()}</div>
              <div>
                {(booking.paymentStatus ?? "unpaid") === "paid" ? (
                  <span className="text-muted-foreground text-xs">
                    Paid {booking.paidAt ? formatDateTime(booking.paidAt) : ""}
                  </span>
                ) : (booking.paymentMethod ?? "").toLowerCase() === "cod" ? (
                  <span className="text-muted-foreground text-xs" title="Pay in cash when gardener completes service">
                    Pay at service (COD)
                  </span>
                ) : booking.status === "accepted" ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handlePayClick(booking)}
                    disabled={payBooking.isPending}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Pay now
                  </Button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div className="text-muted-foreground">
                {booking.message ? booking.message : "Not provided"}
              </div>
              <div className="flex items-center gap-2">
                {booking.status === "completed" && (booking as UserBooking).gardenerTableId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRateBooking({ id: booking.id, gardenerTableId: (booking as UserBooking).gardenerTableId! });
                      setRateDialogOpen(true);
                      setRateRating(5);
                      setRateComment("");
                    }}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Rate
                  </Button>
                ) : booking.status === "completed" || (booking.paymentStatus ?? "unpaid") === "paid" ? (
                  <span className="text-muted-foreground text-xs">—</span>
                ) : booking.status === "pending" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => deleteBooking.mutate({ id: booking.id, status: booking.status })}
                    disabled={deleteBooking.isPending}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteBooking.mutate({ id: booking.id, status: booking.status })}
                    disabled={deleteBooking.isPending}
                    aria-label="Delete booking"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedBooking(booking.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Chat with {booking.gardenerName || "Gardener"}</DialogTitle>
                      <DialogDescription>
                        Send a message about your booking
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-4">
                        {messages && messages.length > 0 ? (
                          messages.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  msg.senderId === user?.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-foreground"
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No messages yet. Start the conversation!
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && messageText.trim()) {
                              sendMessage.mutate({ bookingId: booking.id, content: messageText });
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (messageText.trim()) {
                              sendMessage.mutate({ bookingId: booking.id, content: messageText });
                            }
                          }}
                          disabled={!messageText.trim() || sendMessage.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  if (!isLoading && bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <CalendarCheck className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">No bookings yet</h1>
        <p className="text-muted-foreground mb-8">Book a gardener to get expert help for your plants. Your appointments will show here.</p>
        <Link href="/gardeners">
          <Button size="lg" className="rounded-full px-8">
            Book a Gardener
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Track your gardener requests and status</p>
      </div>
      <Tabs defaultValue="confirmed" className="w-full space-y-4">
        <TabsList className="gap-2 bg-muted/30">
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="active">Pending & Completed</TabsTrigger>
          <TabsTrigger value="history">Cancelled / Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="confirmed" className="pt-2">
          {renderTable(confirmedBookings, "No confirmed appointments yet.")}
        </TabsContent>
        <TabsContent value="active" className="pt-2">
          {renderTable(activeBookings, "No pending or completed bookings yet.")}
        </TabsContent>
        <TabsContent value="history" className="pt-2">
          {renderTable(historyBookings, "No cancelled or rejected bookings.")}
        </TabsContent>
      </Tabs>

      <Dialog
        open={payDialogOpen}
        onOpenChange={(open) => {
          setPayDialogOpen(open);
          if (!open) setCardDetails({ cardNumber: "", cardName: "", expiryDate: "", cvv: "" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay for booking</DialogTitle>
            <DialogDescription>
              {payBookingId != null && (() => {
                const b = bookings.find((x) => x.id === payBookingId);
                return b ? `Amount: Rs ${(b.amount ?? 0).toLocaleString()} — ${b.gardenerName || "Gardener"}` : "";
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment method</label>
              <div className="flex gap-4">
                {(["card", "cod", "wallet"] as const).map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={payMethod === m}
                      onChange={() => setPayMethod(m)}
                      className="rounded border-input"
                    />
                    <span className="capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {payMethod === "card" && (
              <div className="space-y-4 rounded-lg border border-border/60 p-4 bg-muted/20">
                <div className="space-y-2">
                  <Label htmlFor="pay-cardNumber">Card Number</Label>
                  <Input
                    id="pay-cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
                    maxLength={19}
                    className={`h-11 ${cardNumberInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoComplete="off"
                  />
                  {cardNumberInvalid && <p className="text-xs text-destructive">Enter 16 digits</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay-cardName">Cardholder Name</Label>
                  <Input
                    id="pay-cardName"
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardName}
                    onChange={(e) => handleCardInputChange("cardName", e.target.value)}
                    className={`h-11 ${cardNameInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoComplete="off"
                  />
                  {cardNameInvalid && <p className="text-xs text-destructive">Name is required</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pay-expiryDate">Expiry (MM/YY)</Label>
                    <Input
                      id="pay-expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardInputChange("expiryDate", e.target.value)}
                      maxLength={5}
                      className={`h-11 ${expiryInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      autoComplete="off"
                    />
                    {expiryInvalid && <p className="text-xs text-destructive">Use MM/YY</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-cvv">CVV</Label>
                    <Input
                      id="pay-cvv"
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                      maxLength={3}
                      className={`h-11 ${cvvInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      autoComplete="off"
                    />
                    {cvvInvalid && <p className="text-xs text-destructive">Enter 3 digits</p>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter card details above, then click Confirm payment below.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleConfirmPay}
              disabled={
                payBooking.isPending ||
                payBookingId == null ||
                (payMethod === "card" && !isCardDetailsValid())
              }
            >
              {payBooking.isPending ? "Processing..." : "Confirm payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate gardener</DialogTitle>
            <DialogDescription>How was your experience? Your review helps other users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-label={`${r} star${r > 1 ? "s" : ""}`}
                    className="p-2 rounded hover:bg-secondary/50"
                    onClick={() => setRateRating(r)}
                  >
                    <Star className={`h-6 w-6 ${r <= rateRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Comment (optional)</Label>
              <Textarea
                placeholder="Share your experience..."
                value={rateComment}
                onChange={(e) => setRateComment(e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
            <Button
              className="w-full"
              disabled={!rateBooking || isSubmitting}
              onClick={() => {
                if (rateBooking) {
                  submitReview({
                    gardenerId: rateBooking.gardenerTableId,
                    bookingId: rateBooking.id,
                    rating: rateRating,
                    comment: rateComment.trim() || undefined,
                  });
                  setRateDialogOpen(false);
                  setRateBooking(null);
                  setRateComment("");
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Submit review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
