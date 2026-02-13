import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useDynamicFormFields, type DynamicFormField } from "@/hooks/useDynamicFormFields";

interface GenericFormFieldsProps {
  categorySlug: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

// Shared condition options per category context
const generalConditions = [
  { value: "brand_new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
];

// Colors palette (comprehensive)
const colorOptions = [
  "Black", "White", "Silver", "Gray", "Red", "Blue", "Navy", "Green",
  "Dark Green", "Brown", "Beige", "Gold", "Rose Gold", "Orange", "Yellow",
  "Purple", "Pink", "Teal", "Cyan", "Maroon", "Burgundy", "Cream",
  "Ivory", "Champagne", "Bronze", "Copper", "Coral", "Lavender",
  "Mint", "Olive", "Peach", "Turquoise", "Wine Red", "Charcoal",
  "Space Gray", "Midnight Blue", "Forest Green", "Sky Blue", "Other"
];

// ── Electronics ──
const deviceTypes = [
  "Laptop", "Desktop Computer", "Monitor", "TV", "Camera", "Printer",
  "Gaming Console", "Audio Equipment", "Projector", "Smart Home Device",
  "Router/Networking", "UPS/Power Supply", "Other"
];
const electronicsBrands = [
  "Apple", "Samsung", "HP", "Dell", "Lenovo", "LG", "Sony", "Asus",
  "Acer", "Microsoft", "Hisense", "TCL", "JBL", "Bose", "Canon",
  "Nikon", "Epson", "Logitech", "BenQ", "ViewSonic", "AOC", "Philips",
  "Panasonic", "Sharp", "Toshiba", "MSI", "Razer", "Other"
];
const screenResolutions = [
  "HD (1366x768)", "Full HD (1920x1080)", "QHD / 2K (2560x1440)",
  "4K UHD (3840x2160)", "5K (5120x2880)", "8K (7680x4320)",
  "WQXGA (2560x1600)", "UWQHD (3440x1440)", "Other"
];
const refreshRates = [
  "60Hz", "75Hz", "100Hz", "120Hz", "144Hz", "165Hz", "240Hz", "360Hz", "Other"
];
const panelTypes = [
  "IPS", "VA", "TN", "OLED", "AMOLED", "Mini-LED", "QLED", "Nano IPS", "Other"
];
const operatingSystems = [
  "Windows 11", "Windows 10", "macOS", "Chrome OS", "Linux / Ubuntu",
  "FreeDOS (No OS)", "Other"
];
const graphicsCards = [
  "Integrated Graphics", "NVIDIA GeForce GTX 1650", "NVIDIA GeForce GTX 1660",
  "NVIDIA GeForce RTX 3050", "NVIDIA GeForce RTX 3060", "NVIDIA GeForce RTX 3070",
  "NVIDIA GeForce RTX 3080", "NVIDIA GeForce RTX 4050", "NVIDIA GeForce RTX 4060",
  "NVIDIA GeForce RTX 4070", "NVIDIA GeForce RTX 4080", "NVIDIA GeForce RTX 4090",
  "NVIDIA GeForce RTX 5070", "NVIDIA GeForce RTX 5080", "NVIDIA GeForce RTX 5090",
  "AMD Radeon RX 6600", "AMD Radeon RX 6700", "AMD Radeon RX 7600",
  "AMD Radeon RX 7700", "AMD Radeon RX 7800", "AMD Radeon RX 7900",
  "Apple M1", "Apple M2", "Apple M3", "Apple M4", "Other"
];
const processorOptions = [
  "Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9",
  "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9",
  "Intel Celeron", "Intel Pentium", "AMD Ryzen 3", "AMD Ryzen 5",
  "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1", "Apple M1 Pro", "Apple M1 Max",
  "Apple M2", "Apple M2 Pro", "Apple M2 Max", "Apple M3", "Apple M3 Pro",
  "Apple M3 Max", "Apple M4", "Apple M4 Pro", "Apple M4 Max",
  "Qualcomm Snapdragon", "MediaTek", "Other"
];

// ── Phones ──
const phoneBrands = [
  "Apple", "Samsung", "Huawei", "Xiaomi", "OPPO", "Vivo", "OnePlus",
  "Google", "Nokia", "Tecno", "Infinix", "itel", "Realme", "Motorola",
  "Sony", "Nothing", "Other"
];
const storageSizes = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "Other"];
const ramSizes = ["1GB", "2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB", "128GB"];

// ── Fashion ──
const genders = [
  { value: "men", label: "Men" }, { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" }, { value: "kids_boys", label: "Boys" },
  { value: "kids_girls", label: "Girls" },
];
const clothingTypes = [
  "Shirts", "T-Shirts", "Dresses", "Pants/Trousers", "Jeans", "Shorts",
  "Skirts", "Suits", "Jackets", "Coats", "Sweaters", "Activewear",
  "Traditional Wear", "Swimwear", "Underwear", "Sleepwear", "Shoes",
  "Handbags", "Watches", "Jewelry", "Accessories", "Other"
];
const fashionBrands = [
  "Nike", "Adidas", "Puma", "Zara", "H&M", "Gucci", "Louis Vuitton",
  "Balenciaga", "New Balance", "Reebok", "Timberland", "Levi's",
  "Calvin Klein", "Tommy Hilfiger", "Massimo Dutti", "Under Armour", "Other"
];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size", "28", "30", "32", "34", "36", "38", "40", "42", "44"];
const fashionMaterials = [
  "Cotton", "Polyester", "Silk", "Wool", "Linen", "Denim", "Leather",
  "Suede", "Nylon", "Satin", "Chiffon", "Cashmere", "Velvet", "Fleece",
  "Spandex", "Rayon", "Other"
];
const fashionOccasions = [
  "Casual", "Formal", "Business", "Sport/Athletic", "Party/Evening",
  "Wedding", "Traditional/Cultural", "Beach", "Outdoor", "Other"
];

// ── Animals & Pets ──
const animalTypes = [
  "Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Guinea Pig",
  "Turtle", "Snake", "Livestock - Cow", "Livestock - Goat", "Livestock - Sheep",
  "Livestock - Chicken", "Donkey", "Horse", "Camel", "Other"
];

// ── Beauty & Health ──
const beautyProductTypes = [
  "Body Care", "Facial Care", "Hair Care", "Skincare", "Makeup",
  "Fragrances/Perfumes", "Nail Care", "Oral Care", "Men's Grooming",
  "Supplements", "Medical Devices", "Fitness Equipment", "Other"
];
const beautyBrands = [
  "Nivea", "Garnier", "L'Oréal", "Dove", "Vaseline", "MAC", "Maybelline",
  "NYX", "The Ordinary", "CeraVe", "Neutrogena", "Clinique", "Shea Moisture",
  "Black Opal", "Revlon", "Bio-Oil", "Oriflame", "Avon", "Mary Kay",
  "Fair & Lovely", "Dark & Lovely", "Other"
];
const skinTypes = ["All Skin Types", "Oily", "Dry", "Combination", "Sensitive", "Normal"];

// ── Furniture & Appliances ──
const furnitureItemTypes = [
  "Sofa/Couch", "Bed/Mattress", "Dining Table", "Office Desk", "Chair",
  "Wardrobe/Cabinet", "Bookshelf", "TV Stand", "Coffee Table", "Kitchen Appliance",
  "Washing Machine", "Refrigerator", "Microwave", "Air Conditioner", "Fan",
  "Iron/Press", "Blender", "Gas Cooker", "Electric Oven", "Water Dispenser", "Other"
];
const furnitureBrands = [
  "IKEA", "Samsung", "LG", "Hotpoint", "Ramtons", "Von", "Bruhm",
  "Mika", "Beko", "Hisense", "Vitron", "Nunix", "Roch", "Other"
];
const furnitureMaterials = [
  "Wood", "Metal", "Plastic", "Glass", "Leather", "Fabric", "Bamboo",
  "MDF/Chipboard", "Stainless Steel", "Other"
];
const furnitureStyles = [
  "Modern", "Classic", "Contemporary", "Minimalist", "Rustic", "Industrial",
  "Mid-Century", "Scandinavian", "Traditional", "Bohemian", "Other"
];

// ── Babies & Kids ──
const kidsItemTypes = [
  "Clothing", "Shoes", "Toys", "Stroller/Pram", "Car Seat", "Crib/Cot",
  "High Chair", "Baby Carrier", "Diapers", "Feeding Supplies", "School Supplies",
  "Books", "Games", "Outdoor Play", "Other"
];
const kidsBrands = [
  "Pampers", "Huggies", "Carter's", "Disney", "Fisher-Price", "Chicco",
  "Graco", "Lego", "Barbie", "Hot Wheels", "Baby Einstein", "Other"
];
const ageRanges = [
  "0-3 months", "3-6 months", "6-12 months", "1-2 years", "2-3 years",
  "3-5 years", "5-8 years", "8-12 years", "12+ years"
];

// ── Services ──
const serviceTypes = [
  "Cleaning", "Plumbing", "Electrical", "Painting", "Moving/Transport",
  "Catering", "Photography", "Web Development", "Graphic Design",
  "Tutoring", "Beauty/Salon", "Mechanic", "Carpentry", "Landscaping",
  "Security", "Event Planning", "Legal Services", "Accounting",
  "Marketing", "IT Support", "Other"
];
const pricingModels = [
  { value: "hourly", label: "Per Hour" }, { value: "daily", label: "Per Day" },
  { value: "fixed", label: "Fixed Price" }, { value: "negotiable", label: "Negotiable" },
  { value: "free_quote", label: "Free Quote" },
];

// ── Agriculture ──
const agriProductTypes = [
  "Fruits", "Vegetables", "Cereals/Grains", "Seeds", "Seedlings",
  "Livestock Feed", "Fertilizers", "Pesticides", "Farm Tools",
  "Dairy Products", "Honey", "Flowers", "Herbs/Spices", "Other"
];
const agriUnits = ["Kg", "Tonnes", "Bags", "Crates", "Litres", "Pieces", "Bundles"];

// ── Construction ──
const constructionItemTypes = [
  "Cement", "Steel/Iron Sheets", "Timber", "Sand", "Ballast",
  "Bricks/Blocks", "Tiles", "Paint", "Plumbing Materials", "Electrical Materials",
  "Roofing Materials", "Glass", "Doors", "Windows", "Tools", "Other"
];
const constructionBrands = [
  "Bamburi Cement", "Mabati Rolling Mills", "East African Cables",
  "Crown Paints", "Basco Paints", "Kansai Plascon", "Duracoat",
  "Steel Structures", "Other"
];

// ── Equipment ──
const equipmentTypes = [
  "Generator", "Compressor", "Welding Machine", "Drilling Machine",
  "Concrete Mixer", "Excavator", "Forklift", "Crane", "Pump",
  "Agricultural Equipment", "Medical Equipment", "Restaurant Equipment",
  "Salon Equipment", "Gym Equipment", "Other"
];
const equipmentBrands = [
  "Caterpillar", "Honda", "Yamaha", "Bosch", "Makita", "DeWalt",
  "Husqvarna", "John Deere", "Komatsu", "Other"
];

// ── Leisure / Sports ──
const leisureItemTypes = [
  "Bicycle", "Gym Equipment", "Sports Gear", "Musical Instrument",
  "Camping Equipment", "Board Games", "Books", "Video Games",
  "Outdoor Furniture", "Swimming Pool Equipment", "Other"
];
const leisureBrands = [
  "Nike", "Adidas", "Puma", "Wilson", "Fender", "Yamaha", "Sony",
  "Nintendo", "PlayStation", "Xbox", "Other"
];

// ── Helper: determine which fields are relevant per device type ──
const electronicsFieldVisibility = (deviceType: string) => {
  const dt = (deviceType || "").toLowerCase();
  const isComputer = ["laptop", "desktop computer"].includes(dt);
  const isMonitor = dt === "monitor";
  const isTV = dt === "tv";
  const isScreen = isMonitor || isTV;
  const isCamera = dt === "camera";
  const isPrinter = dt === "printer";
  const isConsole = dt === "gaming console";
  const isAudio = dt === "audio equipment";
  const isProjector = dt === "projector";
  const isNetwork = ["router/networking", "smart home device", "ups/power supply"].includes(dt);

  return {
    showStorage: isComputer || isConsole,
    showRam: isComputer,
    showProcessor: isComputer,
    showScreenSize: isComputer || isScreen || isProjector,
    showScreenResolution: isComputer || isScreen || isProjector || isCamera,
    showRefreshRate: isComputer || isScreen,
    showPanelType: isScreen || isComputer,
    showOS: isComputer || isConsole,
    showGraphicsCard: isComputer,
    showGenericSpecs: isCamera || isPrinter || isAudio || isNetwork || !deviceType,
  };
};

// Helper: Searchable select with "Other" manual input and search filtering
const SearchableSelect = ({ label, value, options, onChange, required, error, placeholder, categorySlug, fieldName }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
  required?: boolean; error?: string; placeholder?: string;
  categorySlug?: string; fieldName?: string;
}) => {
  const [customValue, setCustomValue] = useState("");
  const [showCustom, setShowCustom] = useState(value === "__custom__" || (!!value && !options.includes(value) && value !== ""));
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Fetch approved custom values for this field
  const { data: approvedCustom } = useQuery({
    queryKey: ["custom-field-values", categorySlug, fieldName],
    queryFn: async () => {
      if (!categorySlug || !fieldName) return [];
      const { data } = await supabase
        .from("custom_field_values")
        .select("field_value")
        .eq("category_slug", categorySlug)
        .eq("field_name", fieldName)
        .eq("status", "approved");
      return data?.map(d => d.field_value) || [];
    },
    enabled: !!categorySlug && !!fieldName,
    staleTime: 1000 * 60 * 10,
  });

  const allOptions = [...options, ...(approvedCustom?.filter(v => !options.includes(v)) || [])];
  const filteredOptions = searchTerm
    ? allOptions.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    : allOptions;

  const submitCustomValue = async (val: string) => {
    if (!user || !categorySlug || !fieldName || !val.trim()) return;
    if (allOptions.includes(val.trim())) return;
    try {
      await supabase.from("custom_field_values").upsert({
        category_slug: categorySlug,
        field_name: fieldName,
        field_value: val.trim(),
        submitted_by: user.id,
        status: "pending",
      }, { onConflict: "category_slug,field_name,field_value" });
    } catch {}
  };

  return (
    <div className="space-y-2">
      <Label>{label}{required ? " *" : ""}</Label>
      <Select
        value={showCustom ? "__custom__" : value || ""}
        onValueChange={(v) => {
          if (v === "__custom__") {
            setShowCustom(true);
            onChange(customValue || "");
          } else {
            setShowCustom(false);
            setSearchTerm("");
            onChange(v);
          }
        }}
      >
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {allOptions.length > 8 && (
            <div className="px-2 pb-2 sticky top-0 bg-popover">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchTerm(e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
          )}
          {filteredOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
          {filteredOptions.length === 0 && searchTerm && (
            <p className="text-sm text-muted-foreground px-2 py-1">No results found</p>
          )}
          <SelectItem value="__custom__">✏️ Enter manually...</SelectItem>
        </SelectContent>
      </Select>
      {showCustom && (
        <Input
          placeholder={`Type your ${label.toLowerCase()}`}
          value={customValue || (value !== "__custom__" ? value : "")}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={() => {
            const val = customValue || value;
            if (val && val !== "__custom__") submitCustomValue(val);
          }}
          className="mt-1"
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

// Helper: Condition select that properly maps values
const ConditionSelect = ({ value, onChange, required, error, conditionOptions }: {
  value: string; onChange: (v: string) => void; required?: boolean; error?: string;
  conditionOptions?: typeof generalConditions;
}) => {
  const options = conditionOptions || generalConditions;
  return (
    <div className="space-y-2">
      <Label>Condition{required ? " *" : ""}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Select condition" />
        </SelectTrigger>
        <SelectContent>
          {options.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

// Dynamic fields renderer for admin-defined custom fields
const DynamicFieldsSection = ({ categorySlug, data, updateField }: { categorySlug: string; data: Record<string, unknown>; updateField: (f: string, v: unknown) => void }) => {
  const { data: dynamicFields } = useDynamicFormFields(categorySlug);
  if (!dynamicFields || dynamicFields.length === 0) return null;
  return (
    <div className="space-y-4 pt-4 border-t">
      <Label className="text-sm font-semibold text-muted-foreground">Additional Details</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dynamicFields.map(f => {
          const val = (data[`dyn_${f.field_name}`] as string) || "";
          switch (f.field_type) {
            case "select":
              return (
                <div key={f.id} className="space-y-2">
                  <Label>{f.field_label}{f.is_required ? " *" : ""}</Label>
                  <Select value={val} onValueChange={v => updateField(`dyn_${f.field_name}`, v)}>
                    <SelectTrigger><SelectValue placeholder={f.placeholder || `Select ${f.field_label.toLowerCase()}`} /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {f.help_text && <p className="text-xs text-muted-foreground">{f.help_text}</p>}
                </div>
              );
            case "checkbox":
              return (
                <div key={f.id} className="flex items-center gap-2 pt-6">
                  <Checkbox checked={val === "true"} onCheckedChange={v => updateField(`dyn_${f.field_name}`, v ? "true" : "false")} />
                  <Label>{f.field_label}</Label>
                </div>
              );
            case "number":
              return (
                <div key={f.id} className="space-y-2">
                  <Label>{f.field_label}{f.is_required ? " *" : ""}</Label>
                  <Input type="number" value={val} onChange={e => updateField(`dyn_${f.field_name}`, e.target.value)} placeholder={f.placeholder || ""} />
                  {f.help_text && <p className="text-xs text-muted-foreground">{f.help_text}</p>}
                </div>
              );
            default:
              return (
                <div key={f.id} className="space-y-2">
                  <Label>{f.field_label}{f.is_required ? " *" : ""}</Label>
                  <Input value={val} onChange={e => updateField(`dyn_${f.field_name}`, e.target.value)} placeholder={f.placeholder || ""} />
                  {f.help_text && <p className="text-xs text-muted-foreground">{f.help_text}</p>}
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};

const GenericFormFields = ({ categorySlug, data, onChange, errors }: GenericFormFieldsProps) => {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  switch (categorySlug) {
    case "electronics": {
      const deviceType = (data.device_type as string) || "";
      const vis = electronicsFieldVisibility(deviceType);
      return (
        <div className="space-y-6">
          <SearchableSelect label="Device Type" value={deviceType} options={deviceTypes}
            onChange={(v) => updateField("device_type", v)} required error={errors.device_type}
            categorySlug={categorySlug} fieldName="device_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={electronicsBrands}
              onChange={(v) => updateField("brand", v)} required error={errors.brand}
              categorySlug={categorySlug} fieldName="brand" />
            <div className="space-y-2">
              <Label>Model *</Label>
              <Input value={data.model as string || ""} onChange={(e) => updateField("model", e.target.value)}
                placeholder={deviceType === "Monitor" ? "e.g., Dell U2723QE" : deviceType === "TV" ? "e.g., Samsung QN85B" : "e.g., MacBook Pro 14-inch"} />
            </div>
          </div>

          <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} required error={errors.condition} />

          {/* Screen specs */}
          {vis.showScreenSize && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Screen Size</Label>
                <Input value={data.screen_size as string || ""} onChange={(e) => updateField("screen_size", e.target.value)}
                  placeholder='e.g., 27", 15.6"' />
              </div>
              {vis.showScreenResolution && (
                <SearchableSelect label="Screen Resolution" value={data.screen_resolution as string || ""} options={screenResolutions}
                  onChange={(v) => updateField("screen_resolution", v)} categorySlug={categorySlug} fieldName="screen_resolution" />
              )}
            </div>
          )}

          {(vis.showRefreshRate || vis.showPanelType) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vis.showRefreshRate && (
                <SearchableSelect label="Refresh Rate" value={data.refresh_rate as string || ""} options={refreshRates}
                  onChange={(v) => updateField("refresh_rate", v)} categorySlug={categorySlug} fieldName="refresh_rate" />
              )}
              {vis.showPanelType && (
                <SearchableSelect label="Panel Type" value={data.panel_type as string || ""} options={panelTypes}
                  onChange={(v) => updateField("panel_type", v)} categorySlug={categorySlug} fieldName="panel_type" />
              )}
            </div>
          )}

          {/* Computer specs */}
          {vis.showProcessor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect label="Processor" value={data.processor as string || ""} options={processorOptions}
                onChange={(v) => updateField("processor", v)} categorySlug={categorySlug} fieldName="processor" />
              <SearchableSelect label="Graphics Card" value={data.graphics_card as string || ""} options={graphicsCards}
                onChange={(v) => updateField("graphics_card", v)} categorySlug={categorySlug} fieldName="graphics_card" />
            </div>
          )}

          {(vis.showStorage || vis.showRam) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vis.showStorage && (
                <SearchableSelect label="Storage" value={data.storage as string || ""} options={storageSizes}
                  onChange={(v) => updateField("storage", v)} categorySlug={categorySlug} fieldName="storage" />
              )}
              {vis.showRam && (
                <SearchableSelect label="RAM" value={data.ram as string || ""} options={ramSizes}
                  onChange={(v) => updateField("ram", v)} categorySlug={categorySlug} fieldName="ram" />
              )}
            </div>
          )}

          {vis.showOS && (
            <SearchableSelect label="Operating System" value={data.operating_system as string || ""} options={operatingSystems}
              onChange={(v) => updateField("operating_system", v)} categorySlug={categorySlug} fieldName="operating_system" />
          )}

          <div className="flex items-center justify-between">
            <div><Label>Has Warranty</Label><p className="text-sm text-muted-foreground">Is warranty still valid?</p></div>
            <Switch checked={data.has_warranty as boolean} onCheckedChange={(v) => updateField("has_warranty", v)} />
          </div>
          {data.has_warranty && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Warranty Duration</Label>
              <Input value={data.warranty_duration as string || ""} onChange={(e) => updateField("warranty_duration", e.target.value)}
                placeholder="e.g., 6 months, 1 year" />
            </div>
          )}
        </div>
      );
    }

    case "phones-tablets":
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Device Type *</Label>
              <Select value={data.device_type as string} onValueChange={(v) => updateField("device_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="smartwatch">Smartwatch</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={phoneBrands}
              onChange={(v) => updateField("brand", v)} required categorySlug={categorySlug} fieldName="brand" />
          </div>
          <div className="space-y-2">
            <Label>Model *</Label>
            <Input value={data.model as string || ""} onChange={(e) => updateField("model", e.target.value)} placeholder="e.g., iPhone 15 Pro Max" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Storage" value={data.storage as string || ""} options={storageSizes}
              onChange={(v) => updateField("storage", v)} required categorySlug={categorySlug} fieldName="storage" />
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} required error={errors.condition} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Color" value={data.color as string || ""} options={colorOptions}
              onChange={(v) => updateField("color", v)} categorySlug={categorySlug} fieldName="color" />
            <SearchableSelect label="RAM" value={data.ram as string || ""} options={ramSizes}
              onChange={(v) => updateField("ram", v)} categorySlug={categorySlug} fieldName="ram" />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Unlocked</Label><p className="text-sm text-muted-foreground">Is the device unlocked?</p></div>
            <Switch checked={data.is_unlocked as boolean ?? true} onCheckedChange={(v) => updateField("is_unlocked", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Has Warranty</Label><p className="text-sm text-muted-foreground">Is warranty still valid?</p></div>
            <Switch checked={data.has_warranty as boolean} onCheckedChange={(v) => updateField("has_warranty", v)} />
          </div>
          {data.has_warranty && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Warranty Duration</Label>
              <Input value={data.warranty_duration as string || ""} onChange={(e) => updateField("warranty_duration", e.target.value)}
                placeholder="e.g., 6 months, 1 year" />
            </div>
          )}
        </div>
      );

    case "fashion":
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select value={data.gender as string} onValueChange={(v) => updateField("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {genders.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <SearchableSelect label="Clothing Type" value={data.clothing_type as string || ""} options={clothingTypes}
              onChange={(v) => updateField("clothing_type", v)} required categorySlug={categorySlug} fieldName="clothing_type" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect label="Size" value={data.size as string || ""} options={sizes}
              onChange={(v) => updateField("size", v)} required categorySlug={categorySlug} fieldName="size" />
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={fashionBrands}
              onChange={(v) => updateField("brand", v)} categorySlug={categorySlug} fieldName="brand" />
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} required error={errors.condition}
              conditionOptions={generalConditions.slice(0, 4)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Color" value={data.color as string || ""} options={colorOptions}
              onChange={(v) => updateField("color", v)} categorySlug={categorySlug} fieldName="color" />
            <SearchableSelect label="Material" value={data.material as string || ""} options={fashionMaterials}
              onChange={(v) => updateField("material", v)} categorySlug={categorySlug} fieldName="material" />
          </div>
          <SearchableSelect label="Occasion" value={data.occasion as string || ""} options={fashionOccasions}
            onChange={(v) => updateField("occasion", v)} categorySlug={categorySlug} fieldName="occasion" />
        </div>
      );

    case "animals-pets":
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Animal Type" value={data.animal_type as string || ""} options={animalTypes}
              onChange={(v) => updateField("animal_type", v)} required categorySlug={categorySlug} fieldName="animal_type" />
            <div className="space-y-2">
              <Label>Breed</Label>
              <Input value={data.breed as string || ""} onChange={(e) => updateField("breed", e.target.value)} placeholder="e.g., German Shepherd" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age (months)</Label>
              <Input type="number" value={data.age_months as number || ""} onChange={(e) => updateField("age_months", parseInt(e.target.value))} placeholder="e.g., 6" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={data.gender as string} onValueChange={(v) => updateField("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Label>Vaccinated</Label><Switch checked={data.is_vaccinated as boolean} onCheckedChange={(v) => updateField("is_vaccinated", v)} /></div>
            <div className="flex items-center justify-between"><Label>Neutered/Spayed</Label><Switch checked={data.is_neutered as boolean} onCheckedChange={(v) => updateField("is_neutered", v)} /></div>
            <div className="flex items-center justify-between"><Label>Health Certificate</Label><Switch checked={data.health_certificate as boolean} onCheckedChange={(v) => updateField("health_certificate", v)} /></div>
          </div>
        </div>
      );

    case "beauty-health":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Product Type" value={data.product_type as string || ""} options={beautyProductTypes}
            onChange={(v) => updateField("product_type", v)} required error={errors.product_type} categorySlug={categorySlug} fieldName="product_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={beautyBrands}
              onChange={(v) => updateField("brand", v)} categorySlug={categorySlug} fieldName="brand" />
            <SearchableSelect label="Skin Type" value={data.skin_type as string || ""} options={skinTypes}
              onChange={(v) => updateField("skin_type", v)} categorySlug={categorySlug} fieldName="skin_type" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Usage Type</Label>
              <Select value={data.usage_type as string || ""} onValueChange={(v) => updateField("usage_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Use</SelectItem>
                  <SelectItem value="professional">Professional/Salon</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)}
              conditionOptions={generalConditions.slice(0, 3)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Organic/Natural</Label><p className="text-sm text-muted-foreground">Is this product organic or natural?</p></div>
            <Switch checked={data.is_organic as boolean} onCheckedChange={(v) => updateField("is_organic", v)} />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input type="date" value={data.expiry_date as string || ""} onChange={(e) => updateField("expiry_date", e.target.value)} />
          </div>
        </div>
      );

    case "furniture-appliances":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Item Type" value={data.item_type as string || ""} options={furnitureItemTypes}
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} categorySlug={categorySlug} fieldName="item_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={furnitureBrands}
              onChange={(v) => updateField("brand", v)} categorySlug={categorySlug} fieldName="brand" />
            <SearchableSelect label="Material" value={data.material as string || ""} options={furnitureMaterials}
              onChange={(v) => updateField("material", v)} categorySlug={categorySlug} fieldName="material" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} required error={errors.condition} />
            <SearchableSelect label="Color" value={data.color as string || ""} options={colorOptions}
              onChange={(v) => updateField("color", v)} categorySlug={categorySlug} fieldName="color" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dimensions</Label>
              <Input value={data.dimensions as string || ""} onChange={(e) => updateField("dimensions", e.target.value)} placeholder="e.g., 200cm x 150cm x 80cm" />
            </div>
            <SearchableSelect label="Style" value={data.style as string || ""} options={furnitureStyles}
              onChange={(v) => updateField("style", v)} categorySlug={categorySlug} fieldName="style" />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Assembly Required</Label><p className="text-sm text-muted-foreground">Does this need assembly?</p></div>
            <Switch checked={data.assembly_required as boolean} onCheckedChange={(v) => updateField("assembly_required", v)} />
          </div>
        </div>
      );

    case "babies-kids":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Item Type" value={data.item_type as string || ""} options={kidsItemTypes}
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} categorySlug={categorySlug} fieldName="item_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={kidsBrands}
              onChange={(v) => updateField("brand", v)} categorySlug={categorySlug} fieldName="brand" />
            <SearchableSelect label="Age Range" value={data.age_range as string || ""} options={ageRanges}
              onChange={(v) => updateField("age_range", v)} categorySlug={categorySlug} fieldName="age_range" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={data.gender as string || ""} onValueChange={(v) => updateField("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="boy">Boy</SelectItem>
                  <SelectItem value="girl">Girl</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} required error={errors.condition}
              conditionOptions={generalConditions.slice(0, 4)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Safety Certified</Label><p className="text-sm text-muted-foreground">Has safety certifications?</p></div>
            <Switch checked={data.safety_certified as boolean} onCheckedChange={(v) => updateField("safety_certified", v)} />
          </div>
        </div>
      );

    case "services":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Service Type" value={data.service_type as string || ""} options={serviceTypes}
            onChange={(v) => updateField("service_type", v)} required error={errors.service_type} categorySlug={categorySlug} fieldName="service_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pricing Model</Label>
              <Select value={data.pricing_model as string || ""} onValueChange={(v) => updateField("pricing_model", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {pricingModels.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input type="number" value={data.experience_years as number || ""} onChange={(e) => updateField("experience_years", parseInt(e.target.value))} placeholder="e.g., 5" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={data.availability as string || ""} onValueChange={(v) => updateField("availability", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="weekends">Weekends Only</SelectItem>
                <SelectItem value="on_call">On Call</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Certified Professional</Label><p className="text-sm text-muted-foreground">Do you hold relevant certifications?</p></div>
            <Switch checked={data.is_certified as boolean} onCheckedChange={(v) => updateField("is_certified", v)} />
          </div>
        </div>
      );

    case "agriculture":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Product Type" value={data.product_type as string || ""} options={agriProductTypes}
            onChange={(v) => updateField("product_type", v)} required error={errors.product_type} categorySlug={categorySlug} fieldName="product_type" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={data.quantity as number || ""} onChange={(e) => updateField("quantity", parseFloat(e.target.value))} placeholder="e.g., 100" />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={data.unit as string || ""} onValueChange={(v) => updateField("unit", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {agriUnits.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum Order</Label>
              <Input type="number" value={data.minimum_order as number || ""} onChange={(e) => updateField("minimum_order", parseFloat(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Origin</Label>
            <Input value={data.origin as string || ""} onChange={(e) => updateField("origin", e.target.value)} placeholder="e.g., Nakuru, Kenya" />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Organic</Label><p className="text-sm text-muted-foreground">Is this product organic?</p></div>
            <Switch checked={data.is_organic as boolean} onCheckedChange={(v) => updateField("is_organic", v)} />
          </div>
          <div className="space-y-2">
            <Label>Harvest Date</Label>
            <Input type="date" value={data.harvest_date as string || ""} onChange={(e) => updateField("harvest_date", e.target.value)} />
          </div>
        </div>
      );

    case "construction":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Item Type" value={data.item_type as string || ""} options={constructionItemTypes}
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} categorySlug={categorySlug} fieldName="item_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={constructionBrands}
              onChange={(v) => updateField("brand", v)} categorySlug={categorySlug} fieldName="brand" />
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Material Type</Label>
              <Input value={data.material_type as string || ""} onChange={(e) => updateField("material_type", e.target.value)} placeholder="e.g., Portland Cement" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={data.quantity as number || ""} onChange={(e) => updateField("quantity", parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={data.unit as string || ""} onValueChange={(v) => updateField("unit", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["Bags", "Tonnes", "Pieces", "Sheets", "Metres", "Feet", "Litres"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case "equipment":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Equipment Type" value={data.equipment_type as string || ""} options={equipmentTypes}
            onChange={(v) => updateField("equipment_type", v)} required error={errors.equipment_type} categorySlug={categorySlug} fieldName="equipment_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={equipmentBrands}
              onChange={(v) => updateField("brand", v)} categorySlug={categorySlug} fieldName="brand" />
            <div className="space-y-2">
              <Label>Model</Label>
              <Input value={data.model as string || ""} onChange={(e) => updateField("model", e.target.value)} placeholder="e.g., CAT 320" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} />
            <div className="space-y-2">
              <Label>Year</Label>
              <Input type="number" value={data.year as number || ""} onChange={(e) => updateField("year", parseInt(e.target.value))} placeholder="e.g., 2020" />
            </div>
            <div className="space-y-2">
              <Label>Hours Used</Label>
              <Input type="number" value={data.hours_used as number || ""} onChange={(e) => updateField("hours_used", parseInt(e.target.value))} placeholder="e.g., 5000" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Power Source</Label>
              <Select value={data.power_source as string || ""} onValueChange={(v) => updateField("power_source", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input value={data.capacity as string || ""} onChange={(e) => updateField("capacity", e.target.value)} placeholder="e.g., 5KVA, 2 Tonnes" />
            </div>
          </div>
        </div>
      );

    case "leisure":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Item Type" value={data.item_type as string || ""} options={leisureItemTypes}
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} categorySlug={categorySlug} fieldName="item_type" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={leisureBrands}
              onChange={(v) => updateField("brand", v)} categorySlug={categorySlug} fieldName="brand" />
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} required error={errors.condition} />
          </div>
        </div>
      );

    // Default fallback
    default:
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Item Type *</Label>
            <Input value={data.item_type as string || ""} onChange={(e) => updateField("item_type", e.target.value)} placeholder="What are you selling?" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={data.brand as string || ""} onChange={(e) => updateField("brand", e.target.value)} placeholder="Brand name" />
            </div>
            <ConditionSelect value={data.condition as string || ""} onChange={(v) => updateField("condition", v)} />
          </div>
          <DynamicFieldsSection categorySlug={categorySlug} data={data} updateField={updateField} />
        </div>
      );
  }
};

export default GenericFormFields;
