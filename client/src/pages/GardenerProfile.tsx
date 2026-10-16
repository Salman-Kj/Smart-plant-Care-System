import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, DollarSign, Image as ImageIcon, CheckCircle2, Sparkles, Phone, Briefcase } from "lucide-react";
import { GardenerLayout } from "@/components/gardener/GardenerLayout";

export default function GardenerProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    experience: "",
    hourlyRate: "",
    imageUrl: "",
    phone: "",
    bio: "",
    paymentMethod: "",
    paymentDetail: "",
    accountTitle: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || user.role !== "gardener") {
      setLocation("/auth");
      return;
    }
    // Pre-fill with user data if available
    if (user.fullName) setFormData((prev) => ({ ...prev, name: user.fullName || "" }));
    if (user.phone) setFormData((prev) => ({ ...prev, phone: user.phone || "" }));
  }, [user, setLocation]);

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, "");
    const patterns = [/^03\d{9}$/, /^\+923\d{9}$/, /^923\d{9}$/];
    return patterns.some((pattern) => pattern.test(cleaned));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required";
    } else {
      const expNum = parseInt(formData.experience);
      if (isNaN(expNum) || expNum < 0 || expNum > 50) {
        newErrors.experience = "Please enter a valid experience (0-50 years)";
      }
    }

    if (!formData.hourlyRate.trim()) {
      newErrors.hourlyRate = "Hourly rate is required";
    } else {
      const rate = parseInt(formData.hourlyRate);
      if (isNaN(rate) || rate < 200 || rate > 10000) {
        newErrors.hourlyRate = "Hourly rate must be between Rs 200 and Rs 10,000";
      }
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Pakistani phone number (e.g., 03XX-XXXXXXX)";
    }

    if (formData.imageUrl && !formData.imageUrl.match(/^https?:\/\/.+/)) {
      newErrors.imageUrl = "Please enter a valid image URL";
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

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/gardener/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          experience: `${formData.experience} years`,
          hourlyRate: parseInt(formData.hourlyRate),
          imageUrl: formData.imageUrl.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=22c55e&color=fff&size=200`,
          phone: formData.phone.trim() || null,
          bio: formData.bio.trim() || null,
          paymentMethod: formData.paymentMethod.trim() || null,
          paymentDetail: formData.paymentDetail.trim() || null,
          accountTitle: formData.accountTitle.trim() || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create gardener profile");
      }

      toast({
        title: "Profile Created!",
        description: "Your gardener profile has been created successfully. You can now start accepting bookings.",
        duration: 5000,
      });

      setTimeout(() => {
        setLocation("/gardener/dashboard");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "gardener") {
    return null;
  }

  return (
    <GardenerLayout title="Profile Setup" subtitle="Complete your gardener profile to start accepting bookings">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Complete Your Gardener Profile</CardTitle>
                <CardDescription className="mt-1">
                  Fill in your details to start accepting bookings from customers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Preview */}
              {formData.imageUrl && (
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="Enter your full name"
                    className={errors.name ? "border-destructive pl-11 h-11" : "pl-11 h-11"}
                    required
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-base font-semibold">
                    Experience (Years) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, experience: e.target.value }));
                        if (errors.experience) setErrors((prev) => ({ ...prev, experience: "" }));
                      }}
                      placeholder="e.g., 5"
                      className={errors.experience ? "border-destructive pl-11 h-11" : "pl-11 h-11"}
                      required
                    />
                  </div>
                  {errors.experience && <p className="text-xs text-destructive mt-1">{errors.experience}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-base font-semibold">
                    Hourly Rate (Rs) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="200"
                      max="10000"
                      value={formData.hourlyRate}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }));
                        if (errors.hourlyRate) setErrors((prev) => ({ ...prev, hourlyRate: "" }));
                      }}
                      placeholder="e.g., 1500"
                      className={errors.hourlyRate ? "border-destructive pl-11 h-11" : "pl-11 h-11"}
                      required
                    />
                  </div>
                  {errors.hourlyRate ? (
                    <p className="text-xs text-destructive mt-1">{errors.hourlyRate}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Between Rs 200 - Rs 10,000</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    placeholder="03XX-XXXXXXX"
                    className={errors.phone ? "border-destructive pl-11 h-11" : "pl-11 h-11"}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Pakistani format: 03XX-XXXXXXX (optional)</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-base font-semibold">
                  Profile Image URL
                </Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
                      if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: "" }));
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={errors.imageUrl ? "border-destructive pl-11 h-11" : "pl-11 h-11"}
                  />
                </div>
                {errors.imageUrl && <p className="text-xs text-destructive mt-1">{errors.imageUrl}</p>}
                <p className="text-xs text-muted-foreground mt-1">Leave empty to use auto-generated avatar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold">
                  Bio / Description
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell customers about your gardening experience, specialties, and what makes you unique..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Optional: Describe your skills, experience, and specialties</p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="text-base font-semibold">Payment details (for payouts)</div>
                <p className="text-xs text-muted-foreground">Admin will use this to pay you after completed jobs. Optional.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment method</Label>
                    <select
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="bank">Bank</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDetail">Account / Mobile number</Label>
                    <Input
                      id="paymentDetail"
                      value={formData.paymentDetail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paymentDetail: e.target.value }))}
                      placeholder="e.g. 03001234567 or IBAN"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountTitle">Account title (for bank)</Label>
                  <Input
                    id="accountTitle"
                    value={formData.accountTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accountTitle: e.target.value }))}
                    placeholder="Name on bank account"
                    className="h-10 max-w-md"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Create Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </GardenerLayout>
  );
}
