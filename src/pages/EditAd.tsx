import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { toast } from "sonner";
import { Loader2, X, ImagePlus, CheckCircle } from "lucide-react";
import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";

type Listing = Tables<"listings">;

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

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  price: z.number().min(1, "Price must be at least 1").max(999999999, "Price too high"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Please select a location"),
  condition: z.string().min(1, "Please select a condition"),
});

const EditAd = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "Nairobi",
    condition: "Used",
    isNegotiable: true,
    isUrgent: false,
  });

  // Existing images from the listing
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // New images to upload
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (id) {
      fetchListing();
    }
  }, [user, id, navigate]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check ownership
      if (data.user_id !== user?.id) {
        toast.error("You don't have permission to edit this ad");
        navigate("/my-ads");
        return;
      }

      setListing(data);
      setFormData({
        title: data.title,
        description: data.description || "",
        price: data.price.toString(),
        category: data.category,
        location: data.location,
        condition: data.condition || "Used",
        isNegotiable: data.is_negotiable ?? true,
        isUrgent: data.is_urgent ?? false,
      });
      setExistingImages(data.images || []);
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing");
      navigate("/my-ads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = existingImages.length + newImages.length;
    const maxSize = 5 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (totalImages + newImages.length >= 8) {
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

      setNewImages((prev) => [
        ...prev,
        { file, preview: URL.createObjectURL(file) },
      ]);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => {
      const newArr = [...prev];
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[index].preview);
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const { file } of newImages) {
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

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images
      const newImageUrls = await uploadNewImages();
      const allImages = [...existingImages, ...newImageUrls];

      // Update listing
      const { error } = await supabase
        .from("listings")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          category: formData.category as Listing["category"],
          location: formData.location,
          condition: formData.condition,
          is_negotiable: formData.isNegotiable,
          is_urgent: formData.isUrgent,
          images: allImages,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Ad updated successfully!");
      navigate(`/listing/${id}`);
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error("Failed to update ad. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Edit Ad
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Photos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {totalImages}/8 photos. The first image will be the cover.
            </p>

            <div className="grid grid-cols-4 gap-3">
              {/* Existing images */}
              {existingImages.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && newImages.length === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* New images */}
              {newImages.map((img, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={img.preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add button */}
              {totalImages < 8 && (
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
            </div>

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
            </div>

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
            </div>
          </div>

          {/* Price & Location */}
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold mb-4">Price & Location</h2>

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

          {/* Options */}
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
              className="flex-1 bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/my-ads")}
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

export default EditAd;
