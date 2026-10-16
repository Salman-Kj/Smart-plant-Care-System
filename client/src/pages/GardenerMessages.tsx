import { useState } from "react";
import { GardenerLayout } from "@/components/gardener/GardenerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Search, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGardenerBookings } from "@/hooks/use-gardener-bookings";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function GardenerMessages() {
  const { user } = useAuth();
  const { bookings } = useGardenerBookings();
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  // Get unique bookings with users
  const chatBookings = bookings
    .filter((b) => b.status === "accepted" || b.status === "pending" || b.status === "completed")
    .reduce((acc: any[], booking) => {
      if (!acc.find((u) => u.bookingId === booking.id)) {
        acc.push({
          bookingId: booking.id,
          userId: booking.userId,
          gardenerId: booking.gardenerId,
          userName: booking.userName || "Unknown User",
          userPhone: booking.userPhone,
          status: booking.status,
        });
      }
      return acc;
    }, []);

  const filteredBookings = chatBookings.filter((booking) =>
    booking.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBookingData = chatBookings.find((b) => b.bookingId === selectedBooking);

  // Fetch messages for selected booking
  const { data: messages = [] } = useQuery({
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
    refetchInterval: 3000, // Poll every 3 seconds for new messages
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
      toast({ title: "Message Sent", description: "Your message has been sent." });
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [api.messages.getForBooking.path, selectedBooking] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedBooking) {
      return;
    }
    
    // Validate that booking exists in the list
    if (!selectedBookingData) {
      toast({ 
        title: "Error", 
        description: "Selected booking is invalid. Please select a valid conversation.",
        variant: "destructive" 
      });
      return;
    }
    
    sendMessage.mutate({ bookingId: selectedBooking, content: message });
  };

  return (
    <GardenerLayout title="Messages" subtitle="Communicate with your clients">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No conversations found
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <Card
                  key={booking.bookingId}
                  className={`cursor-pointer transition-colors ${
                    selectedBooking === booking.bookingId
                      ? "border-primary bg-primary/5"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => {
                    setSelectedBooking(booking.bookingId);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {booking.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-sm truncate">
                            {booking.userName}
                          </div>
                          <Badge variant={booking.status === "accepted" ? "default" : "secondary"} className="ml-2 text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {booking.userPhone || "No phone"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedBooking ? (
            <>
              {/* Chat Header */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {selectedBookingData?.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{selectedBookingData?.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedBookingData?.userPhone || "No phone"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="flex-1 flex flex-col mb-4">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.senderId === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Message Input */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim() || sendMessage.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Select a conversation</p>
                <p>Choose a client from the list to start messaging</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </GardenerLayout>
  );
}
