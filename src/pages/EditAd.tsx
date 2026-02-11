import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocationSelector from "@/components/LocationSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useMainCategories, useSubCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { Loader2, X, ImagePlus, CheckCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { compressImage } from "@/lib/imageCompression";
import VehicleFormFields from "@/components/forms/VehicleFormFields";
import PropertyFormFields from "@/components/forms/PropertyFormFields";
import JobFormFields from "@/components/forms/JobFormFields";
import GenericFormFields from "@/components/forms/GenericFormFields";

const ACCEPTED_IMAGE_TYPES = ".jpg,.jpeg,.png,.heic,.heif";
const MAX_IMAGES = 10;

// Category-specific table mapping
const categoryTableMap: Record<string, string> = {
  vehicles: "vehicle_listings",
  property: "property_listings",
  jobs: "job_listings",
  electronics: "electronics_listings",
  "phones-tablets": "phone_listings",
  fashion: "fashion_listings",
  "furniture-appliances": "furniture_listings",
  "animals-pets": "pet_listings",
  "babies-kids": "kids_listings",
  services: "service_listings",
  "beauty-care": "beauty_listings",
  "beauty-health": "beauty_listings",
  "food-agriculture": "agriculture_listings",
  "repair-construction": "construction_listings",
  "commercial-equipment": "equipment_listings",
  "leisure-activities": "leisure_listings",
};

const EditAd = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: mainCategories } = useMainCategories();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({});

  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState("");
  const { data: subCategories } = useSubCategories(selectedMainCategoryId);
  const selectedMainCategory = mainCategories?.find(c => c.id === selectedMainCategoryId);
  const categorySlug = selectedMainCategory?.slug || "";

  const [baseFormData, setBaseFormData] = useState({
    title: "", description: "", price: "", location: "Nairobi",
    subCategoryId: "", isNegotiable: true,
  });

  const [categoryFormData, setCategoryFormData] = useState<Record<string, unknown>>({});
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isJobCategory = categorySlug === "jobs";

  useEffect(() => {
    if (!user || !id) { navigate("/"); return; }
    fetchListing();
  }, [user, id]);

  const fetchListing = async () => {
    try {
      const { data: listing, error } = await supabase
        .from("base_listings")
        .select(`*, main_categories(id, name, slug)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (listing.user_id !== user?.id) {
        toast.error("You don't have permission to edit this ad");
        navigate("/seller-dashboard/listings");
        return;
      }

      const catId = listing.main_category_id;
      setSelectedMainCategoryId(catId);
      setBaseFormData({
        title: listing.title,
        description: listing.description || "",
        price: listing.price.toString(),
        location: listing.location,
        subCategoryId: listing.sub_category_id || "",
        isNegotiable: listing.is_negotiable ?? true,
      });
      setExistingImages(listing.images?.filter(Boolean) || []);

      // Store original data for edit tracking
      setOriginalData({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
      });

      // Fetch category-specific data
      const slug = (listing as any).main_categories?.slug;
      if (slug && categoryTableMap[slug]) {
        const tableName = categoryTableMap[slug];
        const { data: catData } = await supabase
          .from(tableName as any)
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (catData) {
          const { id: _id, created_at: _ca, ...rest } = catData as any;
          setCategoryFormData(rest);
        }
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing");
      navigate("/seller-dashboard/listings");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: "Category & Location", icon: "📂" },
    { title: `${selectedMainCategory?.name || "Category"} Details`, icon: "📝" },
    ...(isJobCategory ? [] : [{ title: "Photos", icon: "📷" }]),
    { title: "Ad Details & Price", icon: "💰" },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalImages = existingImages.length + newImages.length;

    for (const file of Array.from(files)) {
      if (totalImages + newImages.length >= MAX_IMAGES) { toast.error(`Maximum ${MAX_IMAGES} images allowed`); break; }
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!["jpg", "jpeg", "png", "heic", "heif"].includes(ext) && !file.type.startsWith("image/")) {
        toast.error(`${file.name} — Supported formats: JPG, PNG, JPEG, HEIC`); continue;
      }
      if (file.size > 15 * 1024 * 1024) { toast.error(`${file.name} is too large. Max 15MB`); continue; }
      const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.8, maxSizeKB: 500 });
      setNewImages(prev => [...prev, { file: compressed, preview: URL.createObjectURL(compressed) }]);
    }
  };

  const removeExistingImage = (index: number) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index: number) => {
    setNewImages(prev => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const { file } of newImages) {
      const ext = file.name.split(".").pop();
      const name = `${user!.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
      const { error } = await supabase.storage.from("listings").upload(name, file);
      if (error) throw new Error("Failed to upload image");
      const { data } = supabase.storage.from("listings").getPublicUrl(name);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const getEditedFields = (): string[] => {
    const edited: string[] = [];
    if (baseFormData.title !== originalData.title) edited.push("title");
    if (baseFormData.description !== (originalData.description || "")) edited.push("description");
    if (parseFloat(baseFormData.price) !== originalData.price) edited.push("price");
    if (baseFormData.location !== originalData.location) edited.push("location");
    return edited;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseFormData.title.trim() || baseFormData.title.length < 5) {
      setErrors({ title: "Title must be at least 5 characters" });
      toast.error("Please fix errors"); return;
    }

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0 && !isJobCategory) {
      toast.error("Please add at least one image"); return;
    }

    setIsSubmitting(true);
    try {
      const newImageUrls = await uploadNewImages();
      const allImages = [...existingImages, ...newImageUrls];

      const editedFields = getEditedFields();
      const previousData: Record<string, unknown> = {};
      editedFields.forEach(f => { previousData[f] = originalData[f]; });

      const { error } = await supabase
        .from("base_listings")
        .update({
          title: baseFormData.title.trim(),
          description: baseFormData.description.trim() || null,
          price: isJobCategory ? 0 : parseFloat(baseFormData.price),
          location: baseFormData.location,
          sub_category_id: baseFormData.subCategoryId || null,
          is_negotiable: baseFormData.isNegotiable,
          images: allImages,
          status: "pending", // Edited ads go to pending review
          edited_fields: editedFields.length > 0 ? editedFields : null,
          previous_data: editedFields.length > 0 ? (previousData as any) : null,
        })
        .eq("id", id);

      if (error) throw error;

      // Update category-specific data
      if (categorySlug && categoryTableMap[categorySlug]) {
        const tableName = categoryTableMap[categorySlug];
        const { id: _, ...catUpdateData } = categoryFormData as any;
        await supabase.from(tableName as any).update(catUpdateData).eq("id", id);
      }

      toast.success("Ad updated and sent for review!");
      navigate("/seller-dashboard/listings");
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error("Failed to update ad. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryFields = () => {
    if (!categorySlug) return null;
    switch (categorySlug) {
      case "vehicles": return <VehicleFormFields data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
      case "property": return <PropertyFormFields data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
      case "jobs": return <JobFormFields data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
      default: return <GenericFormFields categorySlug={categorySlug} data={categoryFormData} onChange={setCategoryFormData} errors={errors} />;
    }
  };

  if (!user) return null;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
              <h2 className="text-lg font-semibold">Category</h2>
              <Select value={selectedMainCategoryId} onValueChange={setSelectedMainCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {mainCategories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {subCategories && subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label>Sub-Category</Label>
                  <Select value={baseFormData.subCategoryId} onValueChange={v => setBaseFormData(p => ({ ...p, subCategoryId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select sub-category (optional)" /></SelectTrigger>
                    <SelectContent>{subCategories.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
              <h2 className="text-lg font-semibold">Location</h2>
              <LocationSelector onLocationChange={(county, town) => {
                const loc = town ? `${county}, ${town}` : county;
                setBaseFormData(p => ({ ...p, location: loc }));
              }} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">{selectedMainCategory?.name} Details</h2>
            {renderCategoryFields()}
          </div>
        );
      case 2:
        if (isJobCategory) return renderAdDetails();
        return (
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-2">Photos</h2>
            <p className="text-sm text-muted-foreground mb-4">{totalImages}/{MAX_IMAGES} photos. Supported: JPG, PNG, JPEG, HEIC</p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {existingImages.map((url, i) => (
                <div key={`e-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">Cover</span>}
                  <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {newImages.map((img, i) => (
                <div key={`n-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {totalImages < MAX_IMAGES && (
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
      case 3:
        return renderAdDetails();
      default: return null;
    }
  };

  const renderAdDetails = () => (
    <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
      <h2 className="text-lg font-semibold">Ad Details</h2>
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={baseFormData.title} onChange={e => setBaseFormData(p => ({ ...p, title: e.target.value }))}
          maxLength={100} className={errors.title ? "border-destructive" : ""} />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={baseFormData.description} onChange={e => setBaseFormData(p => ({ ...p, description: e.target.value }))}
          rows={5} maxLength={2000} />
      </div>
      {!isJobCategory && (
        <>
          <div className="space-y-2">
            <Label>Price (KSh) *</Label>
            <Input type="number" value={baseFormData.price} onChange={e => setBaseFormData(p => ({ ...p, price: e.target.value }))}
              min={1} className={errors.price ? "border-destructive" : ""} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Negotiable</Label><p className="text-sm text-muted-foreground">Open to price negotiation?</p></div>
            <Switch checked={baseFormData.isNegotiable} onCheckedChange={v => setBaseFormData(p => ({ ...p, isNegotiable: v }))} />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Edit Ad</h1>

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

          <div className="flex justify-between gap-4">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(p => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}
            <div className="ml-auto">
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={() => setCurrentStep(p => p + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Save & Submit for Review</>}
                </Button>
              )}
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditAd;
