import { useState, useRef, useEffect } from "react";
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
import { useMainCategories, useSubCategories } from "@/hooks/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, X, ImagePlus, AlertCircle, Package, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Form components
import VehicleFormFields from "@/components/forms/VehicleFormFields";
import PropertyFormFields from "@/components/forms/PropertyFormFields";
import JobFormFields from "@/components/forms/JobFormFields";
import GenericFormFields from "@/components/forms/GenericFormFields";

const locations = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Malindi", "Kitale", "Garissa", "Nyeri",
];

const PostAd = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const incrementAdsUsed = useIncrementAdsUsed();
  
  // Subscription limits
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits();

  // Categories
  const { data: mainCategories, isLoading: categoriesLoading } = useMainCategories();
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>("");
  const { data: subCategories } = useSubCategories(selectedMainCategoryId);

  // Get the selected category object
  const selectedMainCategory = mainCategories?.find(c => c.id === selectedMainCategoryId);
  const categorySlug = selectedMainCategory?.slug || "";

  // Base form data
  const [baseFormData, setBaseFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: profile?.location || "Nairobi",
    subCategoryId: "",
    isNegotiable: true,
    isUrgent: false,
  });

  // Category-specific form data
  const [categoryFormData, setCategoryFormData] = useState<Record<string, unknown>>({});

  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset sub-category when main category changes
  useEffect(() => {
    setBaseFormData(prev => ({ ...prev, subCategoryId: "" }));
    setCategoryFormData({});
  }, [selectedMainCategoryId]);

  // Redirect if not logged in
  if (!user) {
    navigate("/");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: { file: File; preview: string }[] = [];
    const maxSize = 5 * 1024 * 1024;

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
      newImages.push({ file, preview: URL.createObjectURL(file) });
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
      const { error: uploadError } = await supabase.storage.from("listings").upload(fileName, file);
      if (uploadError) throw new Error("Failed to upload image");
      const { data: urlData } = supabase.storage.from("listings").getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check subscription limits
    if (!limits?.hasActiveSubscription) {
      toast.error("You need an active subscription to post ads");
      navigate("/pricing");
      return;
    }
    if (!limits.canPostAd) {
      toast.error(`You've reached your limit of ${limits.maxAds} ads`);
      navigate("/pricing");
      return;
    }

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!baseFormData.title.trim() || baseFormData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    if (!selectedMainCategoryId) {
      newErrors.category = "Please select a category";
    }
    if (!baseFormData.location) {
      newErrors.location = "Please select a location";
    }
    
    // Jobs don't need price
    const isJobCategory = categorySlug === "jobs";
    if (!isJobCategory && (!baseFormData.price || parseFloat(baseFormData.price) < 1)) {
      newErrors.price = "Price must be at least 1";
    }
    
    if (images.length === 0 && !isJobCategory) {
      toast.error("Please add at least one image");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images
      const imageUrls = await uploadImages();

      // Create base listing
      const { data: listing, error: baseError } = await supabase
        .from("base_listings")
        .insert({
          user_id: user!.id,
          main_category_id: selectedMainCategoryId,
          sub_category_id: baseFormData.subCategoryId || null,
          title: baseFormData.title.trim(),
          description: baseFormData.description.trim() || null,
          price: isJobCategory ? 0 : parseFloat(baseFormData.price),
          location: baseFormData.location,
          is_negotiable: baseFormData.isNegotiable,
          is_urgent: baseFormData.isUrgent,
          images: imageUrls,
        })
        .select()
        .single();

      if (baseError) throw baseError;

      // Insert category-specific data
      await insertCategorySpecificData(listing.id, categorySlug, categoryFormData);

      // Increment ads used
      await incrementAdsUsed();
      queryClient.invalidateQueries({ queryKey: ["subscription-limits"] });

      toast.success("Your ad has been posted!");
      navigate(`/listing/${listing.id}`);
    } catch (error) {
      console.error("Error posting ad:", error);
      toast.error("Failed to post ad. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertCategorySpecificData = async (
    listingId: string,
    slug: string,
    data: Record<string, unknown>
  ) => {
    switch (slug) {
      case "vehicles":
        await supabase.from("vehicle_listings").insert({
          id: listingId,
          vehicle_type: data.vehicle_type || "car",
          make_id: data.make_id || null,
          model_id: data.model_id || null,
          year_of_manufacture: data.year_of_manufacture || null,
          trim: data.trim || null,
          condition: data.condition || null,
          exterior_color: data.exterior_color || null,
          interior_color: data.interior_color || null,
          transmission: data.transmission || null,
          fuel_type: data.fuel_type || null,
          drivetrain: data.drivetrain || null,
          engine_size_cc: data.engine_size_cc || null,
          cylinders: data.cylinders || null,
          horsepower: data.horsepower || null,
          mileage: data.mileage || null,
          body_type: data.body_type || null,
          seats: data.seats || null,
          doors: data.doors || null,
          vin_chassis: data.vin_chassis || null,
          is_registered: data.is_registered || false,
          registration_number: data.registration_number || null,
          registration_year: data.registration_year || null,
          exchange_possible: data.exchange_possible || false,
          key_features: data.key_features || null,
        });
        break;

      case "property":
        await supabase.from("property_listings").insert({
          id: listingId,
          property_type: data.property_type || "apartment",
          listing_type: data.listing_type || "for_sale",
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          is_furnished: data.is_furnished || false,
          furnishing_type: data.furnishing_type || null,
          size_sqm: data.size_sqm || null,
          plot_size_sqm: data.plot_size_sqm || null,
          floor_number: data.floor_number || null,
          total_floors: data.total_floors || null,
          parking_spaces: data.parking_spaces || null,
          year_built: data.year_built || null,
          amenities: data.amenities || null,
          nearby_facilities: data.nearby_facilities || null,
          agency_fee: data.agency_fee || null,
          service_charge: data.service_charge || null,
        });
        break;

      case "jobs":
        await supabase.from("job_listings").insert({
          id: listingId,
          job_title: data.job_title || baseFormData.title,
          job_type: data.job_type || "full_time",
          industry: data.industry || "Other",
          experience_level: data.experience_level || null,
          min_experience_years: data.min_experience_years || null,
          education_level: data.education_level || null,
          salary_min: data.salary_min || null,
          salary_max: data.salary_max || null,
          salary_period: data.salary_period || null,
          is_salary_negotiable: data.is_salary_negotiable ?? true,
          company_name: data.company_name || "Company",
          company_logo: data.company_logo || null,
          company_website: data.company_website || null,
          application_method: data.application_method || null,
          application_email: data.application_email || null,
          application_url: data.application_url || null,
          application_deadline: data.application_deadline || null,
          required_skills: data.required_skills || null,
          benefits: data.benefits || null,
          is_remote: data.is_remote || false,
        });
        break;

      case "electronics":
        await supabase.from("electronics_listings").insert({
          id: listingId,
          device_type: data.device_type || "Other",
          brand: data.brand || "Unknown",
          model: data.model || "Unknown",
          storage: data.storage || null,
          ram: data.ram || null,
          screen_size: data.screen_size || null,
          processor: data.processor || null,
          condition: data.condition || null,
          has_warranty: data.has_warranty || false,
          warranty_duration: data.warranty_duration || null,
          accessories_included: data.accessories_included || null,
        });
        break;

      case "phones-tablets":
        await supabase.from("phone_listings").insert({
          id: listingId,
          device_type: data.device_type || "smartphone",
          brand: data.brand || "Unknown",
          model: data.model || "Unknown",
          storage: data.storage || null,
          ram: data.ram || null,
          condition: data.condition || null,
          has_warranty: data.has_warranty || false,
          warranty_duration: data.warranty_duration || null,
          color: data.color || null,
          is_unlocked: data.is_unlocked ?? true,
          accessories_included: data.accessories_included || null,
        });
        break;

      case "fashion":
        await supabase.from("fashion_listings").insert({
          id: listingId,
          gender: data.gender || "unisex",
          clothing_type: data.clothing_type || "Other",
          size: data.size || null,
          material: data.material || null,
          brand: data.brand || null,
          condition: data.condition || null,
          color: data.color || null,
          occasion: data.occasion || null,
        });
        break;

      case "furniture-appliances":
        await supabase.from("furniture_listings").insert({
          id: listingId,
          item_type: data.item_type || "Other",
          brand: data.brand || null,
          material: data.material || null,
          condition: data.condition || null,
          dimensions: data.dimensions || null,
          color: data.color || null,
          style: data.style || null,
          assembly_required: data.assembly_required || false,
        });
        break;

      case "animals-pets":
        await supabase.from("pet_listings").insert({
          id: listingId,
          animal_type: data.animal_type || "Other",
          breed: data.breed || null,
          age_months: data.age_months || null,
          gender: data.gender || null,
          is_vaccinated: data.is_vaccinated || false,
          is_neutered: data.is_neutered || false,
          health_certificate: data.health_certificate || false,
          includes: data.includes || null,
        });
        break;

      case "babies-kids":
        await supabase.from("kids_listings").insert({
          id: listingId,
          item_type: data.item_type || "Other",
          brand: data.brand || null,
          age_range: data.age_range || null,
          gender: data.gender || null,
          condition: data.condition || null,
          safety_certified: data.safety_certified || false,
        });
        break;

      case "services":
        await supabase.from("service_listings").insert({
          id: listingId,
          service_type: data.service_type || "Other",
          availability: data.availability || null,
          pricing_model: data.pricing_model || null,
          experience_years: data.experience_years || null,
          is_certified: data.is_certified || false,
          certifications: data.certifications || null,
          service_area: data.service_area || null,
          languages: data.languages || null,
        });
        break;

      default:
        // For categories without specific tables, we can skip
        break;
    }
  };

  const renderCategorySpecificFields = () => {
    if (!categorySlug) return null;

    switch (categorySlug) {
      case "vehicles":
        return (
          <VehicleFormFields
            data={categoryFormData}
            onChange={setCategoryFormData}
            errors={errors}
          />
        );
      case "property":
        return (
          <PropertyFormFields
            data={categoryFormData}
            onChange={setCategoryFormData}
            errors={errors}
          />
        );
      case "jobs":
        return (
          <JobFormFields
            data={categoryFormData}
            onChange={setCategoryFormData}
            errors={errors}
          />
        );
      case "electronics":
      case "phones-tablets":
      case "fashion":
      case "animals-pets":
        return (
          <GenericFormFields
            categorySlug={categorySlug}
            data={categoryFormData}
            onChange={setCategoryFormData}
            errors={errors}
          />
        );
      default:
        return (
          <GenericFormFields
            categorySlug={categorySlug}
            data={categoryFormData}
            onChange={setCategoryFormData}
            errors={errors}
          />
        );
    }
  };

  const isJobCategory = categorySlug === "jobs";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Post Your Ad
        </h1>

        {/* Subscription Status Banner */}
        {limitsLoading ? (
          <div className="mb-6 bg-muted rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/3"></div>
          </div>
        ) : !limits?.hasActiveSubscription ? (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Active Subscription</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span>You need an active subscription to post ads.</span>
              <Link to="/pricing">
                <Button size="sm" variant="default">
                  <Package className="h-4 w-4 mr-2" />
                  Get a Subscription
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        ) : !limits.canPostAd ? (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ad Limit Reached</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span>You've used all {limits.maxAds} ads in your {limits.subscriptionName} plan.</span>
              <Link to="/pricing">
                <Button size="sm" variant="default">Upgrade Plan</Button>
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{limits.subscriptionName} - Ads Usage</span>
              <span className="text-sm text-muted-foreground">{limits.adsUsed} / {limits.maxAds} used</span>
            </div>
            <Progress value={(limits.adsUsed / limits.maxAds) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{limits.adsRemaining} ads remaining</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold mb-4">Select Category</h2>

            {/* Main Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={selectedMainCategoryId}
                onValueChange={setSelectedMainCategoryId}
                disabled={categoriesLoading}
              >
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            {/* Sub-Category */}
            {subCategories && subCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Sub-Category</Label>
                <Select
                  value={baseFormData.subCategoryId}
                  onValueChange={(value) => setBaseFormData(prev => ({ ...prev, subCategoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Category-Specific Fields */}
          {selectedMainCategoryId && (
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {selectedMainCategory?.name} Details
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </h2>
              {renderCategorySpecificFields()}
            </div>
          )}

          {/* Images Section */}
          {!isJobCategory && (
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Photos</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add up to 8 photos. The first image will be the cover.
              </p>

              <div className="grid grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
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
          )}

          {/* Basic Details Section */}
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold mb-4">Ad Details</h2>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={baseFormData.title}
                onChange={(e) => setBaseFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title"
                maxLength={100}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              <p className="text-xs text-muted-foreground">{baseFormData.title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={baseFormData.description}
                onChange={(e) => setBaseFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your item in detail..."
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">{baseFormData.description.length}/2000 characters</p>
            </div>
          </div>

          {/* Price & Location Section */}
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-semibold mb-4">Price & Location</h2>

            {/* Price (not for jobs) */}
            {!isJobCategory && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KSh) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={baseFormData.price}
                    onChange={(e) => setBaseFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    min={1}
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                {/* Negotiable */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Negotiable</Label>
                    <p className="text-sm text-muted-foreground">Are you open to price negotiation?</p>
                  </div>
                  <Switch
                    checked={baseFormData.isNegotiable}
                    onCheckedChange={(checked) => setBaseFormData(prev => ({ ...prev, isNegotiable: checked }))}
                  />
                </div>
              </>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label>Location *</Label>
              <Select
                value={baseFormData.location}
                onValueChange={(value) => setBaseFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger className={errors.location ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            {/* Urgent */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Mark as Urgent</Label>
                <p className="text-sm text-muted-foreground">Highlight your ad as urgent</p>
              </div>
              <Switch
                checked={baseFormData.isUrgent}
                onCheckedChange={(checked) => setBaseFormData(prev => ({ ...prev, isUrgent: checked }))}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || !limits?.canPostAd}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Ad"
            )}
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default PostAd;