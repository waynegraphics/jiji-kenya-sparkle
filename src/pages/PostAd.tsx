import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionLimits, useIncrementAdsUsed } from "@/hooks/useSubscriptionLimits";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, X, ImagePlus, CheckCircle, AlertCircle, Package } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const categories = [
  { value: "vehicles", label: "Vehicles" },
  { value: "property", label: "Property" },
  { value: "phones", label: "Phones & Tablets" },
  { value: "fashion", label: "Fashion" },
  { value: "services", label: "Services" },
  { value: "jobs", label: "Jobs" },
  { value: "furniture", label: "Furniture" },
  { value: "pets", label: "Animals & Pets" },
  { value: "kids", label: "Babies & Kids" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "electronics", label: "Electronics" },
  { value: "health", label: "Health & Beauty" },
];

const conditions = [
  { value: "New", label: "Brand New" },
  { value: "Used", label: "Used" },
  { value: "Refurbished", label: "Refurbished" },
];

const locations = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Nyeri",
];

// Validation schema
const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  price: z.number().min(1, "Price must be at least 1").max(999999999, "Price too high"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Please select a location"),
  condition: z.string().min(1, "Please select a condition"),
});

const PostAd = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const incrementAdsUsed = useIncrementAdsUsed();
  
  // Subscription limits
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: profile?.location || "Nairobi",
    condition: "Used",
    isNegotiable: true,
    isUrgent: false,
  });

  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not logged in
  if (!user) {
    navigate("/");
    return null;
  }

  // Check if user can post in this category
  const canPostInCategory = (category: string) => {
    if (!limits?.hasActiveSubscription) return false;
    if (!limits.allowedCategories || limits.allowedCategories.length === 0) return true;
    return limits.allowedCategories.includes(category);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: { file: File; preview: string }[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file) => {
      if (images.length + newImages.length >= 8) {
        toast.error("Maximum 8 images allowed");
        return;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const { file } of images) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image");
      }

      const { data: urlData } = supabase.storage
        .from("listings")
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check subscription limits first
    if (!limits?.hasActiveSubscription) {
      toast.error("You need an active subscription to post ads");
      navigate("/pricing");
      return;
    }

    if (!limits.canPostAd) {
      toast.error(`You've reached your limit of ${limits.maxAds} ads. Please upgrade your plan.`);
      navigate("/pricing");
      return;
    }

    // Check category restriction
    if (!canPostInCategory(formData.category)) {
      toast.error("Your subscription doesn't allow posting in this category");
      return;
    }

    // Validate form
    const validationData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      location: formData.location,
      condition: formData.condition,
    };

    const result = listingSchema.safeParse(validationData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Create listing
      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          user_id: user!.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          category: formData.category as "electronics" | "fashion" | "furniture" | "health" | "jobs" | "kids" | "pets" | "phones" | "property" | "services" | "sports" | "vehicles",
          location: formData.location,
          condition: formData.condition,
          is_negotiable: formData.isNegotiable,
          is_urgent: formData.isUrgent,
          images: imageUrls,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Your ad has been posted!");
      navigate(`/listing/${listing.id}`);
    } catch (error) {
      console.error("Error posting ad:", error);
      toast.error("Failed to post ad. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Post Your Ad
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Photos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add up to 8 photos. The first image will be the cover.
            </p>

            <div className="grid grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={img.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {images.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Details Section */}
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold mb-4">Ad Details</h2>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., iPhone 14 Pro Max 256GB"
                maxLength={100}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, condition: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond.value} value={cond.value}>
                      {cond.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail..."
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/2000 characters
              </p>
            </div>
          </div>

          {/* Price & Location Section */}
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold mb-4">Price & Location</h2>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (KSh) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min={1}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            {/* Negotiable */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Negotiable</Label>
                <p className="text-sm text-muted-foreground">
                  Allow buyers to negotiate the price
                </p>
              </div>
              <Switch
                checked={formData.isNegotiable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isNegotiable: checked }))
                }
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options Section */}
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Mark as Urgent</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight your ad to get more visibility
                </p>
              </div>
              <Switch
                checked={formData.isUrgent}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isUrgent: checked }))
                }
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-primary hover:bg-jiji-green-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Post Ad
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default PostAd;