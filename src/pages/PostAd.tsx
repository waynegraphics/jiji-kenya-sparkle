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
import { Loader2, X, ImagePlus, AlertCircle, Package, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { generateListingUrl } from "@/lib/slugify";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { compressImage } from "@/lib/imageCompression";

// Form components
import VehicleFormFields from "@/components/forms/VehicleFormFields";
import PropertyFormFields from "@/components/forms/PropertyFormFields";
import JobFormFields from "@/components/forms/JobFormFields";
import GenericFormFields from "@/components/forms/GenericFormFields";
import SellerAIAssistant from "@/components/SellerAIAssistant";

const ACCEPTED_IMAGE_TYPES = ".jpg,.jpeg,.png,.heic,.heif";
const MAX_IMAGES = 10;

interface PostAdProps {
  inDashboard?: boolean;
}

const PostAd = ({ inDashboard = false }: PostAdProps = {}) => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const incrementAdsUsed = useIncrementAdsUsed();
  const { data: verification, isLoading: verificationLoading } = useSellerVerification();
  const [registrationFeePaid, setRegistrationFeePaid] = useState(false);
  const [feeCheckLoading, setFeeCheckLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const checkFee = async () => {
      if (!user) return;
      
      // First check if fee is 0 — if so, skip payment requirement
      const { data: feeData } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "seller_registration_fee")
        .maybeSingle();
      
      const feeAmount = feeData ? parseInt(feeData.value) : 0;
      if (feeAmount === 0) {
        setRegistrationFeePaid(true);
        setFeeCheckLoading(false);
        return;
      }

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
  
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits();
  const { data: mainCategories, isLoading: categoriesLoading } = useMainCategories();
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>("");
  const { data: subCategories } = useSubCategories(selectedMainCategoryId);
  const selectedMainCategory = mainCategories?.find(c => c.id === selectedMainCategoryId);
  const categorySlug = selectedMainCategory?.slug || "";

  const [baseFormData, setBaseFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: profile?.location || "Nairobi",
    subCategoryId: "",
    isNegotiable: true,
  });

  const [categoryFormData, setCategoryFormData] = useState<Record<string, unknown>>({});
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setBaseFormData(prev => ({ ...prev, subCategoryId: "" }));
    setCategoryFormData({});
  }, [selectedMainCategoryId]);

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

  const isJobCategory = categorySlug === "jobs";

  // Multi-step definitions
  const steps = [
    { title: "Ad Info", icon: "📝" },
    { title: "Category & Location", icon: "📂" },
    { title: `${selectedMainCategory?.name || "Category"} Details`, icon: "⚙️" },
    ...(isJobCategory ? [] : [{ title: "Photos", icon: "📷" }]),
    { title: "Pricing", icon: "💰" },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: { file: File; preview: string }[] = [];

    for (const file of Array.from(files)) {
      if (images.length + newImages.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        break;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const validExts = ["jpg", "jpeg", "png", "heic", "heif"];
      if (!validExts.includes(ext) && !file.type.startsWith("image/")) {
        toast.error(`${file.name} — Supported formats: JPG, PNG, JPEG, HEIC`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 15MB`);
        continue;
      }
      const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.8, maxSizeKB: 500 });
      newImages.push({ file: compressed, preview: URL.createObjectURL(compressed) });
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) compressed & added`);
    }
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
    // Upload all images in parallel for much faster performance
    const uploadPromises = images.map(async ({ file }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("listings").upload(fileName, file);
      if (uploadError) throw new Error("Failed to upload image");
      const { data: urlData } = supabase.storage.from("listings").getPublicUrl(fileName);
      return urlData.publicUrl;
    });
    
    return Promise.all(uploadPromises);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      if (!baseFormData.title.trim() || baseFormData.title.length < 5)
        newErrors.title = "Title must be at least 5 characters";
    }
    
    if (step === 1) {
      if (!selectedMainCategoryId) newErrors.category = "Please select a category";
      if (!baseFormData.location) newErrors.location = "Please select a location";
    }
    
    if (step === steps.length - 1) {
      if (!isJobCategory && (!baseFormData.price || parseFloat(baseFormData.price) < 1))
        newErrors.price = "Price must be at least 1";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before continuing");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    if (!limits?.isAdminBypass) {
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
    }

    if (images.length === 0 && !isJobCategory) {
      toast.error("Please add at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images and create listing in parallel for faster submission
      const [imageUrls, listingResult] = await Promise.all([
        uploadImages(),
        // Pre-create listing with placeholder images, we'll update with real URLs
        supabase
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
            images: [], // Will update after upload
            status: "pending", // All new listings require verification
          })
          .select()
          .single()
      ]);

      const { data: listing, error: baseError } = listingResult;
      if (baseError) throw baseError;

      // Update listing with image URLs and insert category data in parallel
      await Promise.all([
        supabase
          .from("base_listings")
          .update({ images: imageUrls })
          .eq("id", listing.id),
        insertCategorySpecificData(listing.id, categorySlug, categoryFormData),
        incrementAdsUsed()
      ]);

      queryClient.invalidateQueries({ queryKey: ["subscription-limits"] });

      toast.success("Your ad has been submitted for review. It will go live once approved.");
      if (inDashboard) {
        navigate("/seller-dashboard/listings");
      } else {
        const url = categorySlug 
          ? generateListingUrl(listing.id, categorySlug, baseFormData.title.trim())
          : `/listing/${listing.id}`;
        navigate(url);
      }
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
          screen_resolution: (data.screen_resolution as string) || null,
          refresh_rate: (data.refresh_rate as string) || null,
          panel_type: (data.panel_type as string) || null,
          operating_system: (data.operating_system as string) || null,
          graphics_card: (data.graphics_card as string) || null,
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
      case "beauty-health":
        await supabase.from("beauty_listings").insert([{
          id: listingId,
          product_type: (data.product_type as string) || "Other",
          brand: (data.brand as string) || null,
          skin_type: (data.skin_type as string) || null,
          usage_type: (data.usage_type as string) || null,
          condition: (data.condition as string) || null,
          is_organic: (data.is_organic as boolean) || false,
          expiry_date: (data.expiry_date as string) || null,
        }]);
        break;
      case "agriculture":
        await supabase.from("agriculture_listings").insert([{
          id: listingId,
          product_type: (data.product_type as string) || "Other",
          quantity: (data.quantity as number) || null,
          unit: (data.unit as string) || null,
          origin: (data.origin as string) || null,
          is_organic: (data.is_organic as boolean) || false,
          harvest_date: (data.harvest_date as string) || null,
          minimum_order: (data.minimum_order as number) || null,
          certifications: (data.certifications as string[]) || null,
        }]);
        break;
      case "construction":
        await supabase.from("construction_listings").insert([{
          id: listingId,
          item_type: (data.item_type as string) || "Other",
          brand: (data.brand as string) || null,
          condition: (data.condition as string) || null,
          material_type: (data.material_type as string) || null,
          quantity: (data.quantity as number) || null,
          unit: (data.unit as string) || null,
        }]);
        break;
      case "equipment":
        await supabase.from("equipment_listings").insert([{
          id: listingId,
          equipment_type: (data.equipment_type as string) || "Other",
          brand: (data.brand as string) || null,
          model: (data.model as string) || null,
          condition: (data.condition as string) || null,
          year: (data.year as number) || null,
          hours_used: (data.hours_used as number) || null,
          power_source: (data.power_source as string) || null,
          capacity: (data.capacity as string) || null,
        }]);
        break;
      case "leisure":
        await supabase.from("leisure_listings").insert([{
          id: listingId,
          item_type: (data.item_type as string) || "Other",
          brand: (data.brand as string) || null,
          condition: (data.condition as string) || null,
          includes: (data.includes as string[]) || null,
        }]);
        break;
      default:
        break;
    }
  };

  const renderCategorySpecificFields = () => {
    if (!categorySlug) return null;
    switch (categorySlug) {
      case "vehicles":
        return <VehicleFormFields data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
      case "property":
        return <PropertyFormFields data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
      case "jobs":
        return <JobFormFields data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
      default:
        return <GenericFormFields categorySlug={categorySlug} data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Title & Description first
        return (
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">What are you listing?</h2>
              <SellerAIAssistant
                category={selectedMainCategory?.name || categorySlug || "General"}
                title={baseFormData.title}
                description={baseFormData.description}
                price={baseFormData.price}
                location={baseFormData.location}
                categoryFields={categoryFormData}
                onApplyTitle={(t) => setBaseFormData(prev => ({ ...prev, title: t }))}
                onApplyDescription={(d) => setBaseFormData(prev => ({ ...prev, description: d }))}
                onApplyPrice={(p) => setBaseFormData(prev => ({ ...prev, price: p }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={baseFormData.title}
                onChange={(e) => setBaseFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title" maxLength={100}
                className={errors.title ? "border-destructive" : ""} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              <p className="text-xs text-muted-foreground">{baseFormData.title.length}/100 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={baseFormData.description}
                onChange={(e) => setBaseFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your item in detail..." rows={5} maxLength={2000} />
              <p className="text-xs text-muted-foreground">{baseFormData.description.length}/2000 characters</p>
            </div>
          </div>
        );

      case 1: // Category & Location
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
              <h2 className="text-lg font-semibold">Select Category</h2>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={selectedMainCategoryId} onValueChange={setSelectedMainCategoryId} disabled={categoriesLoading}>
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              {subCategories && subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label>Sub-Category</Label>
                  <Select value={baseFormData.subCategoryId} onValueChange={(value) => setBaseFormData(prev => ({ ...prev, subCategoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sub-category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
              <h2 className="text-lg font-semibold">Location</h2>
              <LocationSelector
                onLocationChange={(county, town) => {
                  const loc = town ? `${county}, ${town}` : county;
                  setBaseFormData(prev => ({ ...prev, location: loc }));
                }}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>
          </div>
        );

      case 2: // Category-specific fields
        return (
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {selectedMainCategory?.name} Details
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </h2>
            {selectedMainCategoryId ? renderCategorySpecificFields() : (
              <p className="text-muted-foreground">Please select a category first.</p>
            )}
          </div>
        );

      case 3: // Photos (or Pricing for jobs)
        if (isJobCategory) {
          return renderPricingStep();
        }
        return (
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-2">Photos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add up to {MAX_IMAGES} photos. Supported formats: JPG, PNG, JPEG, HEIC. The first image will be the cover.
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={img.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                  )}
                  <button type="button" onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </button>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_TYPES} multiple onChange={handleImageUpload} className="hidden" />
          </div>
        );

      case 4: // Pricing (non-jobs)
        return renderPricingStep();

      default:
        return null;
    }
  };

  const renderPricingStep = () => (
    <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
      <h2 className="text-lg font-semibold mb-4">Pricing</h2>

      {!isJobCategory && (
        <>
          <div className="space-y-2">
            <Label htmlFor="price">Price (KSh) *</Label>
            <Input id="price" type="number" value={baseFormData.price}
              onChange={(e) => setBaseFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0" min={1} className={errors.price ? "border-destructive" : ""} />
            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Negotiable</Label>
              <p className="text-sm text-muted-foreground">Are you open to price negotiation?</p>
            </div>
            <Switch checked={baseFormData.isNegotiable}
              onCheckedChange={(checked) => setBaseFormData(prev => ({ ...prev, isNegotiable: checked }))} />
          </div>
        </>
      )}
    </div>
  );

  const formContent = (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Post Your Ad</h1>

      {/* Seller Verification Check */}
      {!limits?.isAdminBypass && !verificationLoading && verification?.status !== "approved" && (
        <div className="mb-6">
          <SellerVerificationForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            You must complete seller verification before posting listings.
          </p>
        </div>
      )}

      {!limits?.isAdminBypass && verification?.status === "approved" && !feeCheckLoading && !registrationFeePaid && (
        <div className="mb-6">
          <RegistrationFeeCheckout onPaymentSuccess={() => setRegistrationFeePaid(true)} />
          <p className="text-center text-sm text-muted-foreground mt-4">
            Pay the one-time registration fee to start posting listings.
          </p>
        </div>
      )}

      {(!limits?.isAdminBypass && ((verification?.status !== "approved" || (!registrationFeePaid && !feeCheckLoading)) && !verificationLoading)) ? null : (
        <>
          {/* Subscription Status Banner */}
          {limits?.isAdminBypass ? (
            <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Admin — Unlimited Posting</span>
              </div>
            </div>
          ) : limitsLoading ? (
            <div className="mb-6 bg-muted rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted-foreground/20 rounded w-1/3"></div>
            </div>
          ) : !limits?.hasActiveSubscription ? (
            <Alert className="mb-6 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Active Subscription</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span>You need an active subscription to post ads.</span>
                <Link to="/pricing"><Button size="sm" variant="default"><Package className="h-4 w-4 mr-2" />Get a Subscription</Button></Link>
              </AlertDescription>
            </Alert>
          ) : !limits.canPostAd ? (
            <Alert className="mb-6 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ad Limit Reached</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span>You've used all {limits.maxAds} ads in your {limits.subscriptionName} plan.</span>
                <Link to="/pricing"><Button size="sm" variant="default">Upgrade Plan</Button></Link>
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

          {/* Step Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center">
                  <button type="button" onClick={() => i < currentStep && setCurrentStep(i)}
                    className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-2 py-1 rounded-full transition-colors ${
                      i === currentStep ? "bg-primary text-primary-foreground" :
                      i < currentStep ? "bg-primary/20 text-primary cursor-pointer" :
                      "bg-muted text-muted-foreground"
                    }`}>
                    {i < currentStep ? <Check className="h-3 w-3" /> : <span>{step.icon}</span>}
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                  {i < steps.length - 1 && <div className={`w-4 sm:w-8 h-0.5 mx-1 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}
              <div className="ml-auto">
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" size="lg" disabled={isSubmitting || (!limits?.isAdminBypass && !limits?.canPostAd)}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...</> : "Post Ad"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </>
      )}
    </>
  );

  if (inDashboard) {
    return <div className="space-y-6">{formContent}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 max-w-3xl">
        {formContent}
      </main>
      <Footer />
    </div>
  );
};

export default PostAd;
