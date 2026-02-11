import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocationSelector from "@/components/LocationSelector";
import SellerVerificationForm from "@/components/SellerVerificationForm";
import RegistrationFeeCheckout from "@/components/RegistrationFeeCheckout";
import { useSellerVerification } from "@/hooks/useSellerVerification";
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

// locations now handled by LocationSelector

const PostAd = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const incrementAdsUsed = useIncrementAdsUsed();
  const { data: verification, isLoading: verificationLoading } = useSellerVerification();
  const [registrationFeePaid, setRegistrationFeePaid] = useState(false);
  const [feeCheckLoading, setFeeCheckLoading] = useState(true);
  
  // Check if registration fee has been paid
  useEffect(() => {
    const checkFee = async () => {
      if (!user) return;
      // Check if user has any completed payment transaction for registration
      const { data } = await supabase
        .from("payment_transactions")
        .select("id")
        .eq("user_id", user.id)
        .is("subscription_id", null)
        .is("addon_purchase_id", null)
        .eq("status", "completed")
        .limit(1);
      
      setRegistrationFeePaid(!!(data && data.length > 0));
      setFeeCheckLoading(false);
    };
    checkFee();
  }, [user]);
  
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

  // Redirect if not logged in (wait for auth to load first)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        await supabase.from("vehicle_listings").insert([{
          id: listingId,
          vehicle_type: (data.vehicle_type as string) || "car",
          make_id: (data.make_id as string) || null,
          model_id: (data.model_id as string) || null,
          year_of_manufacture: (data.year_of_manufacture as number) || null,
          trim: (data.trim as string) || null,
          condition: (data.condition as string) || null,
          exterior_color: (data.exterior_color as string) || null,
          interior_color: (data.interior_color as string) || null,
          transmission: (data.transmission as string) || null,
          fuel_type: (data.fuel_type as string) || null,
          drivetrain: (data.drivetrain as string) || null,
          engine_size_cc: (data.engine_size_cc as number) || null,
          cylinders: (data.cylinders as number) || null,
          horsepower: (data.horsepower as number) || null,
          mileage: (data.mileage as number) || null,
          body_type: (data.body_type as string) || null,
          seats: (data.seats as number) || null,
          doors: (data.doors as number) || null,
          vin_chassis: (data.vin_chassis as string) || null,
          is_registered: (data.is_registered as boolean) || false,
          registration_number: (data.registration_number as string) || null,
          registration_year: (data.registration_year as number) || null,
          exchange_possible: (data.exchange_possible as boolean) || false,
          key_features: (data.key_features as string[]) || null,
        }]);
        break;

      case "property":
        await supabase.from("property_listings").insert([{
          id: listingId,
          property_type: (data.property_type as string) || "apartment",
          listing_type: (data.listing_type as string) || "for_sale",
          bedrooms: (data.bedrooms as number) || null,
          bathrooms: (data.bathrooms as number) || null,
          is_furnished: (data.is_furnished as boolean) || false,
          furnishing_type: (data.furnishing_type as string) || null,
          size_sqm: (data.size_sqm as number) || null,
          plot_size_sqm: (data.plot_size_sqm as number) || null,
          floor_number: (data.floor_number as number) || null,
          total_floors: (data.total_floors as number) || null,
          parking_spaces: (data.parking_spaces as number) || null,
          year_built: (data.year_built as number) || null,
          amenities: (data.amenities as string[]) || null,
          nearby_facilities: (data.nearby_facilities as string[]) || null,
          agency_fee: (data.agency_fee as string) || null,
          service_charge: (data.service_charge as number) || null,
        }]);
        break;

      case "jobs":
        await supabase.from("job_listings").insert([{
          id: listingId,
          job_title: (data.job_title as string) || baseFormData.title,
          job_type: (data.job_type as string) || "full_time",
          industry: (data.industry as string) || "Other",
          experience_level: (data.experience_level as string) || null,
          min_experience_years: (data.min_experience_years as number) || null,
          education_level: (data.education_level as string) || null,
          salary_min: (data.salary_min as number) || null,
          salary_max: (data.salary_max as number) || null,
          salary_period: (data.salary_period as string) || null,
          is_salary_negotiable: (data.is_salary_negotiable as boolean) ?? true,
          company_name: (data.company_name as string) || "Company",
          company_logo: (data.company_logo as string) || null,
          company_website: (data.company_website as string) || null,
          application_method: (data.application_method as string) || null,
          application_email: (data.application_email as string) || null,
          application_url: (data.application_url as string) || null,
          application_deadline: (data.application_deadline as string) || null,
          required_skills: (data.required_skills as string[]) || null,
          benefits: (data.benefits as string[]) || null,
          is_remote: (data.is_remote as boolean) || false,
        }]);
        break;

      case "electronics":
        await supabase.from("electronics_listings").insert([{
          id: listingId,
          device_type: (data.device_type as string) || "Other",
          brand: (data.brand as string) || "Unknown",
          model: (data.model as string) || "Unknown",
          storage: (data.storage as string) || null,
          ram: (data.ram as string) || null,
          screen_size: (data.screen_size as string) || null,
          processor: (data.processor as string) || null,
          condition: (data.condition as string) || null,
          has_warranty: (data.has_warranty as boolean) || false,
          warranty_duration: (data.warranty_duration as string) || null,
          accessories_included: (data.accessories_included as string[]) || null,
        }]);
        break;

      case "phones-tablets":
        await supabase.from("phone_listings").insert([{
          id: listingId,
          device_type: (data.device_type as string) || "smartphone",
          brand: (data.brand as string) || "Unknown",
          model: (data.model as string) || "Unknown",
          storage: (data.storage as string) || null,
          ram: (data.ram as string) || null,
          condition: (data.condition as string) || null,
          has_warranty: (data.has_warranty as boolean) || false,
          warranty_duration: (data.warranty_duration as string) || null,
          color: (data.color as string) || null,
          is_unlocked: (data.is_unlocked as boolean) ?? true,
          accessories_included: (data.accessories_included as string[]) || null,
        }]);
        break;

      case "fashion":
        await supabase.from("fashion_listings").insert([{
          id: listingId,
          gender: (data.gender as string) || "unisex",
          clothing_type: (data.clothing_type as string) || "Other",
          size: (data.size as string) || null,
          material: (data.material as string) || null,
          brand: (data.brand as string) || null,
          condition: (data.condition as string) || null,
          color: (data.color as string) || null,
          occasion: (data.occasion as string) || null,
        }]);
        break;

      case "furniture-appliances":
        await supabase.from("furniture_listings").insert([{
          id: listingId,
          item_type: (data.item_type as string) || "Other",
          brand: (data.brand as string) || null,
          material: (data.material as string) || null,
          condition: (data.condition as string) || null,
          dimensions: (data.dimensions as string) || null,
          color: (data.color as string) || null,
          style: (data.style as string) || null,
          assembly_required: (data.assembly_required as boolean) || false,
        }]);
        break;

      case "animals-pets":
        await supabase.from("pet_listings").insert([{
          id: listingId,
          animal_type: (data.animal_type as string) || "Other",
          breed: (data.breed as string) || null,
          age_months: (data.age_months as number) || null,
          gender: (data.gender as string) || null,
          is_vaccinated: (data.is_vaccinated as boolean) || false,
          is_neutered: (data.is_neutered as boolean) || false,
          health_certificate: (data.health_certificate as boolean) || false,
          includes: (data.includes as string[]) || null,
        }]);
        break;

      case "babies-kids":
        await supabase.from("kids_listings").insert([{
          id: listingId,
          item_type: (data.item_type as string) || "Other",
          brand: (data.brand as string) || null,
          age_range: (data.age_range as string) || null,
          gender: (data.gender as string) || null,
          condition: (data.condition as string) || null,
          safety_certified: (data.safety_certified as boolean) || false,
        }]);
        break;

      case "services":
        await supabase.from("service_listings").insert([{
          id: listingId,
          service_type: (data.service_type as string) || "Other",
          availability: (data.availability as string) || null,
          pricing_model: (data.pricing_model as string) || null,
          experience_years: (data.experience_years as number) || null,
          is_certified: (data.is_certified as boolean) || false,
          certifications: (data.certifications as string[]) || null,
          service_area: (data.service_area as string[]) || null,
          languages: (data.languages as string[]) || null,
        }]);
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

        {/* Seller Verification Check */}
        {!verificationLoading && verification?.status !== "approved" && (
          <div className="mb-6">
            <SellerVerificationForm />
            <p className="text-center text-sm text-muted-foreground mt-4">
              You must complete seller verification before posting listings.
            </p>
          </div>
        )}

        {/* Registration Fee Check - show after verification is approved */}
        {verification?.status === "approved" && !feeCheckLoading && !registrationFeePaid && (
          <div className="mb-6">
            <RegistrationFeeCheckout onPaymentSuccess={() => setRegistrationFeePaid(true)} />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Pay the one-time registration fee to start posting listings.
            </p>
          </div>
        )}

        {(verification?.status !== "approved" || (!registrationFeePaid && !feeCheckLoading)) && !verificationLoading ? null : (
          <>
        
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
              <LocationSelector
                onLocationChange={(county, town) => {
                  const loc = town ? `${county}, ${town}` : county;
                  setBaseFormData(prev => ({ ...prev, location: loc }));
                }}
              />
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PostAd;