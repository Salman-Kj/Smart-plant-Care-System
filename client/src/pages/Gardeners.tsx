import { useGardeners } from "@/hooks/use-gardeners";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Search, Filter, Loader2, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Gardener } from "@shared/schema";

type SortOption = "rating-desc" | "rating-asc" | "price-desc" | "price-asc" | "experience-desc" | "name-asc";

export default function GardenersPage() {
  const { gardeners, isLoading } = useGardeners();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");
  const [filterAvailable, setFilterAvailable] = useState<"all" | "available" | "busy">("all");
  const [filterRating, setFilterRating] = useState<"all" | "4+" | "4.5+">("all");

  const filteredAndSortedGardeners = useMemo(() => {
    let filtered = [...gardeners];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.experience?.toLowerCase().includes(query)
      );
    }

    // Availability filter
    if (filterAvailable === "available") {
      filtered = filtered.filter((g) => g.available);
    } else if (filterAvailable === "busy") {
      filtered = filtered.filter((g) => !g.available);
    }

    // Rating filter
    if (filterRating === "4+") {
      filtered = filtered.filter((g) => (g.rating ?? 0) >= 4);
    } else if (filterRating === "4.5+") {
      filtered = filtered.filter((g) => (g.rating ?? 0) >= 4.5);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-asc":
          return (a.rating || 0) - (b.rating || 0);
        case "price-desc":
          return b.hourlyRate - a.hourlyRate;
        case "price-asc":
          return a.hourlyRate - b.hourlyRate;
        case "experience-desc":
          const expA = parseInt(a.experience?.toString() || "0");
          const expB = parseInt(b.experience?.toString() || "0");
          return expB - expA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [gardeners, searchQuery, sortBy, filterAvailable, filterRating]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Hire Expert Gardeners</h1>
        <p className="text-muted-foreground text-lg">
          Professional help for your garden maintenance, landscaping, or plant health consultations.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or experience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
              <SelectItem value="rating-asc">Rating: Low to High</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="experience-desc">Experience: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={filterAvailable} onValueChange={(v) => setFilterAvailable(v as typeof filterAvailable)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={(v) => setFilterRating(v as typeof filterRating)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Star className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4+">4+ Stars</SelectItem>
              <SelectItem value="4.5+">4.5+ Stars</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || filterAvailable !== "all" || filterRating !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterAvailable("all");
                setFilterRating("all");
              }}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredAndSortedGardeners.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedGardeners.length} of {gardeners.length} gardeners
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedGardeners.length === 0 ? (
        // Empty State
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {gardeners.length === 0 ? "No Gardeners Available" : "No Gardeners Found"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {gardeners.length === 0
              ? "We're currently updating our gardener database. Please check back soon!"
              : "Try adjusting your search or filter criteria."}
          </p>
          {(searchQuery || filterAvailable !== "all" || filterRating !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterAvailable("all");
                setFilterRating("all");
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        // Gardeners Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGardeners.map((gardener) => (
            <GardenerCard key={gardener.id} gardener={gardener} />
          ))}
        </div>
      )}
    </div>
  );
}

function GardenerCard({ gardener }: { gardener: Gardener }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const reviewsCount = 18 + (gardener.id % 5) * 6;
  const experienceText = gardener.experience?.toString().toLowerCase().includes("year")
    ? gardener.experience
    : `${gardener.experience} years`;

  return (
    <div className="bg-card rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center h-full">
      <div className="relative mb-6">
        <img
          src={gardener.imageUrl || "/placeholder-gardener.jpg"}
          alt={gardener.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(gardener.name) + "&background=22c55e&color=fff";
          }}
        />
        {gardener.available && (
          <div
            className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"
            title="Available"
          />
        )}
      </div>

      <h3 className="text-xl font-bold font-display mb-1">{gardener.name}</h3>
      <p className="text-primary font-medium text-sm mb-4">{experienceText} Experience</p>

      <div className="flex items-center gap-1 mb-6 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900">
        <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
        <span className="font-bold text-orange-700 dark:text-orange-300">{gardener.rating || 5}.0</span>
        <span className="text-orange-400 text-xs">({reviewsCount} reviews)</span>
      </div>

      <div className="w-full grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-secondary/30 p-3 rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Rate</p>
          <p className="font-bold">Rs {gardener.hourlyRate}/hr</p>
        </div>
        <div className="bg-secondary/30 p-3 rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Location</p>
          <p className="font-bold text-xs">Karachi, Pakistan</p>
        </div>
      </div>
      <div
        className={`mb-6 text-xs font-medium px-3 py-1 rounded-full border ${
          gardener.available
            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
        }`}
      >
        {gardener.available ? "Available" : "Busy"}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={(event) => {
              if (!user) {
                event.preventDefault();
                toast({
                  title: "Login Required",
                  description: "Please login to hire a gardener",
                  variant: "destructive",
                });
                return;
              }
              setIsOpen(true);
            }}
          >
            Hire Now
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hire {gardener.name}</DialogTitle>
          </DialogHeader>
          <HireForm
            gardener={gardener}
            onSuccess={() => {
              setIsOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HireForm({ gardener, onSuccess }: { gardener: Gardener; onSuccess: () => void }) {
  const { hireGardener } = useGardeners();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hours, setHours] = useState(2);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // Pakistani phone validation
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, "");
    // Pakistani formats: 03XX-XXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX, 03XXXXXXXXX
    const patterns = [
      /^03\d{9}$/, // 03XXXXXXXXX
      /^\+923\d{9}$/, // +923XXXXXXXXX
      /^923\d{9}$/, // 923XXXXXXXXX
    ];
    return patterns.some((pattern) => pattern.test(cleaned));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: "" }));
    }
    // Reset time if date is today and time is in the past
    if (value === today && time) {
      const now = new Date();
      const [selectedHour, selectedMinute] = time.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(selectedHour, selectedMinute, 0, 0);
      if (selectedTime < now) {
        setTime("");
      }
    }
  };

  const handleTimeChange = (value: string) => {
    setTime(value);
    if (errors.time) {
      setErrors((prev) => ({ ...prev, time: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to hire a gardener",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Please enter a valid Pakistani phone number (e.g., 03XX-XXXXXXX)";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    } else if (address.trim().length < 10) {
      newErrors.address = "Please provide a complete address";
    }

    if (!date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(date);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (selectedDate < todayDate) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    if (!time) {
      newErrors.time = "Please select a time";
    } else if (date === today) {
      const now = new Date();
      const [selectedHour, selectedMinute] = time.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(selectedHour, selectedMinute, 0, 0);
      if (selectedTime < now) {
        newErrors.time = "Time cannot be in the past";
      }
    }

    if (hours < 1 || hours > 8) {
      newErrors.hours = "Duration must be between 1 and 8 hours";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setErrors({});
    const dateTime = `${date}T${time}`;
    hireGardener.mutate(
      {
        id: gardener.id,
        dateTime,
        date,
        hours,
        message: message.trim() || undefined,
        userName: user.fullName || user.username,
        userEmail: user.email || "",
        userPhone: phone.trim(),
        userAddress: address.trim(),
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Booking Confirmed!",
            description: `Your booking with ${gardener.name} has been confirmed. Total cost: Rs ${gardener.hourlyRate * hours}`,
            duration: 5000,
          });
          onSuccess();
          // Redirect to bookings page after 1.5 seconds
          setTimeout(() => {
            setLocation("/my-bookings");
          }, 1500);
        },
        onError: (error: Error) => {
          toast({
            title: "Booking Failed",
            description: error.message || "Failed to confirm booking. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const totalCost = gardener.hourlyRate * hours;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={user?.fullName || user?.username || ""} readOnly className="bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={today}
            max={maxDateStr}
            required
            className={errors.date ? "border-destructive" : ""}
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">
            Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            required
            className={errors.time ? "border-destructive" : ""}
          />
          {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hours">
            Duration (Hours) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="hours"
            type="number"
            min={1}
            max={8}
            value={hours}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 8) {
                setHours(val);
              }
            }}
            required
            className={errors.hours ? "border-destructive" : ""}
          />
          {errors.hours && <p className="text-xs text-destructive">{errors.hours}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="03XX-XXXXXXX"
            required
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone ? (
            <p className="text-xs text-destructive">{errors.phone}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Pakistani format: 03XX-XXXXXXX</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Address / Location <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (errors.address) {
              setErrors((prev) => ({ ...prev, address: "" }));
            }
          }}
          placeholder="Enter your complete address..."
          required
          rows={3}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a note for the gardener..."
          rows={3}
        />
      </div>

      <div className="bg-secondary/20 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Rate per hour</span>
          <span className="font-semibold">Rs {gardener.hourlyRate}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Duration</span>
          <span className="font-semibold">{hours} {hours === 1 ? "hour" : "hours"}</span>
        </div>
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="font-bold text-lg">Total Cost</span>
          <span className="font-bold text-xl text-primary">Rs {totalCost}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={hireGardener.isPending}>
        {hireGardener.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming Booking...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirm Booking
          </>
        )}
      </Button>
    </form>
  );
}
