import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, isLoading } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Load profile address when user is present
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const res = await fetch(api.profile.get.path, { credentials: "include" });
        if (res.status === 401 || !res.ok) return;
        const data = (await res.json()) as { address?: string | null };
        if (data.address) setDeliveryAddress(data.address);
      } catch {
        // ignore
      }
    };
    loadProfile();
  }, [user]);

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Gift card state
  const [giftCardCode, setGiftCardCode] = useState("");

  const handleCardInputChange = (field: string, value: string) => {
    if (field === "cardNumber") {
      // Format card number with spaces (XXXX XXXX XXXX XXXX)
      const formatted = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      if (formatted.length <= 19) {
        setCardDetails({ ...cardDetails, cardNumber: formatted });
      }
    } else if (field === "expiryDate") {
      // Format expiry date (MM/YY)
      const formatted = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
      setCardDetails({ ...cardDetails, expiryDate: formatted });
    } else if (field === "cvv") {
      // CVV max 3 digits
      if (value.length <= 3 && /^\d*$/.test(value)) {
        setCardDetails({ ...cardDetails, cvv: value });
      }
    } else {
      setCardDetails({ ...cardDetails, [field]: value });
    }
  };

  const isCardDetailsValid = () => {
    return (
      cardDetails.cardNumber.replace(/\s/g, "").length === 16 &&
      cardDetails.cardName.trim().length > 0 &&
      cardDetails.expiryDate.length === 5 &&
      cardDetails.cvv.length === 3
    );
  };

  // Per-field card validation for red border + error message
  const cardNumberDigits = cardDetails.cardNumber.replace(/\s/g, "");
  const cardNumberInvalid = cardNumberDigits.length > 0 && cardNumberDigits.length !== 16;
  const cardNameInvalid = cardDetails.cardName.trim().length === 0 && cardDetails.cardName.length > 0;
  const expiryInvalid = cardDetails.expiryDate.length > 0 && cardDetails.expiryDate.length !== 5;
  const cvvInvalid = cardDetails.cvv.length > 0 && cardDetails.cvv.length !== 3;

  const isGiftCardValid = () => {
    return giftCardCode.trim().length > 0;
  };

  const maskedCardLast4 = () => {
    const digits = cardDetails.cardNumber.replace(/\s/g, "");
    return digits.slice(-4);
  };

  const submitOrder = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    const orderData = {
      userId: user.id,
      totalAmount: total,
      address: deliveryAddress.trim() || "Address not provided",
      items: items.map((item) => ({
        plantId: item.plantId,
        name: item.plant.name,
        price: item.plant.price,
        quantity: item.quantity,
      })),
      status: paymentMethod === "cash" ? "pending" : "paid",
      paymentMethod: paymentMethod,
    };

    createOrder.mutate(orderData, {
      onSuccess: async (order) => {
        await apiRequest("DELETE", "/api/cart/clear");
        queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
        toast({
          title: paymentMethod === "cash" ? "Order placed" : "Order confirmed",
          description:
            paymentMethod === "cash"
              ? "Your order has been placed successfully. Payment will be collected on delivery."
              : "Payment received successfully.",
        });
        setLocation(`/orders/confirmation/${order.id}`);
      },
      onError: () => {
        toast({
          title: "Checkout failed",
          description: "There was an error processing your order.",
          variant: "destructive",
        });
      },
    });
  };

  const handleConfirmPayment = async () => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }

    // Validate card details if card payment is selected
    if (paymentMethod === "card" && !isCardDetailsValid()) {
      toast({
        title: "Invalid card details",
        description: "Please fill all card details correctly.",
        variant: "destructive",
      });
      return;
    }

    // Validate gift card if gift card payment is selected
    if (paymentMethod === "gift" && !isGiftCardValid()) {
      toast({
        title: "Invalid gift card",
        description: "Please enter a valid gift card code.",
        variant: "destructive",
      });
      return;
    }

    // Cash on delivery: place order immediately
    if (paymentMethod === "cash") {
      submitOrder();
      return;
    }

    // Card/Gift: show final confirm modal first
    setIsConfirmOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some plants before checkout.</p>
        <Button onClick={() => setLocation("/plants")} className="rounded-full px-8">
          Browse Plants
        </Button>
      </div>
    );
  }

  const tax = Math.round(total * 0.1);
  const grandTotal = total + tax;

  return (
    <div className="min-h-screen bg-secondary/10 py-12">
      <div className="container mx-auto px-4">
        <div className="text-sm text-muted-foreground mb-4">Cart / Checkout</div>
        <h1 className="text-4xl font-display font-bold text-primary mb-10">Payment</h1>

        {/* Delivery address - changeable */}
        <Card className="border-2 border-border/60 bg-white shadow-sm mb-10">
          <CardContent className="p-6">
            <h2 className="text-lg font-display font-semibold text-primary mb-3">Delivery address</h2>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your full delivery address..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Payment Options Card */}
          <Card className="border-2 border-border/60 bg-white shadow-sm">
            <CardContent className="p-8">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                {/* Credit Card Option */}
                <div>
                  <Label
                    className={`flex items-center gap-4 border-2 rounded-xl px-6 py-4 cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/40 hover:bg-secondary/20"
                    }`}
                  >
                    <RadioGroupItem value="card" className="text-primary" />
                    <span className="font-medium text-foreground">Credit Card</span>
                  </Label>
                  
                  {/* Card Details Form - Show when card is selected */}
                  {paymentMethod === "card" && (
                    <div className="mt-6 space-y-4 pl-10">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
                          maxLength={19}
                          className={`h-11 ${cardNumberInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          autoComplete="off"
                        />
                        {cardNumberInvalid && (
                          <p className="text-xs text-destructive">Enter 16 digits</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          type="text"
                          placeholder="John Doe"
                          value={cardDetails.cardName}
                          onChange={(e) => handleCardInputChange("cardName", e.target.value)}
                          className={`h-11 ${cardNameInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          autoComplete="off"
                        />
                        {cardNameInvalid && (
                          <p className="text-xs text-destructive">Name is required</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={(e) => handleCardInputChange("expiryDate", e.target.value)}
                            maxLength={5}
                            className={`h-11 ${expiryInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            autoComplete="off"
                          />
                          {expiryInvalid && (
                            <p className="text-xs text-destructive">Use MM/YY</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                            maxLength={3}
                            className={`h-11 ${cvvInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            autoComplete="off"
                          />
                          {cvvInvalid && (
                            <p className="text-xs text-destructive">Enter 3 digits</p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        After entering card details, click <span className="font-medium">Proceed</span> on the right to continue.
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery Option */}
                <Label
                  className={`flex items-center gap-4 border-2 rounded-xl px-6 py-4 cursor-pointer transition-all ${
                    paymentMethod === "cash"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-primary/40 hover:bg-secondary/20"
                  }`}
                >
                  <RadioGroupItem value="cash" className="text-primary" />
                  <span className="font-medium text-foreground">Cash on Delivery</span>
                </Label>

                {/* Gift Card Option */}
                <div>
                  <Label
                    className={`flex items-center gap-4 border-2 rounded-xl px-6 py-4 cursor-pointer transition-all ${
                      paymentMethod === "gift"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/40 hover:bg-secondary/20"
                    }`}
                  >
                    <RadioGroupItem value="gift" className="text-primary" />
                    <span className="font-medium text-foreground">Gift Card</span>
                  </Label>
                  
                  {/* Redeem Code Input - Show when gift card is selected */}
                  {paymentMethod === "gift" && (
                    <div className="mt-6 space-y-2 pl-10">
                      <Label htmlFor="giftCardCode">Redeem Code</Label>
                      <Input
                        id="giftCardCode"
                        type="text"
                        placeholder="Enter gift card code"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  )}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card className="border-2 border-border/60 bg-white shadow-sm">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-display font-bold text-primary">Order Summary</h2>
              <div className="space-y-4 text-base">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rs {(total / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-primary">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">Rs {(tax / 100).toLocaleString()}</span>
                </div>
                <div className="border-t border-border/60 pt-4 flex justify-between">
                  <span className="text-lg font-bold text-primary">Total</span>
                  <span className="text-lg font-bold text-primary">Rs {(grandTotal / 100).toLocaleString()}</span>
                </div>
              </div>

              {/* Final confirm modal for card/gift */}
              <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please review your payment details before confirming.
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Payment method</span>
                          <span className="font-medium">
                            {paymentMethod === "card"
                              ? "Credit Card"
                              : paymentMethod === "gift"
                                ? "Gift Card"
                                : "Cash on Delivery"}
                          </span>
                        </div>

                        {paymentMethod === "card" && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Card</span>
                              <span className="font-medium">
                                **** **** **** {maskedCardLast4() || "----"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Name</span>
                              <span className="font-medium">{cardDetails.cardName || "-"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Expiry</span>
                              <span className="font-medium">{cardDetails.expiryDate || "-"}</span>
                            </div>
                          </>
                        )}

                        {paymentMethod === "gift" && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Redeem code</span>
                            <span className="font-medium">{giftCardCode || "-"}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/60">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-semibold">
                            Rs {(grandTotal / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={createOrder.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={createOrder.isPending}
                      onClick={() => {
                        setIsConfirmOpen(false);
                        submitOrder();
                      }}
                    >
                      {createOrder.isPending ? "Processing..." : "Confirm"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                className="w-full rounded-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
                onClick={handleConfirmPayment}
                disabled={
                  createOrder.isPending ||
                  !deliveryAddress.trim() ||
                  (paymentMethod === "card" && !isCardDetailsValid()) ||
                  (paymentMethod === "gift" && !isGiftCardValid())
                }
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : paymentMethod === "cash" ? (
                  "Place Order"
                ) : (
                  "Proceed"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
