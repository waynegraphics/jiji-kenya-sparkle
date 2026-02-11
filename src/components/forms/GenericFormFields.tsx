import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface GenericFormFieldsProps {
  categorySlug: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

// Shared condition options
const conditions = [
  { value: "brand_new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
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
  "Nikon", "Epson", "Logitech", "Other"
];

// ── Phones ──
const phoneBrands = [
  "Apple", "Samsung", "Huawei", "Xiaomi", "OPPO", "Vivo", "OnePlus",
  "Google", "Nokia", "Tecno", "Infinix", "itel", "Realme", "Motorola",
  "Sony", "Nothing", "Other"
];
const storageSizes = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "Other"];
const ramSizes = ["1GB", "2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB"];

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

// Helper: Searchable select with "Other" manual input
const SearchableSelect = ({ label, value, options, onChange, required, error, placeholder }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
  required?: boolean; error?: string; placeholder?: string;
}) => {
  const [customValue, setCustomValue] = useState("");
  const [showCustom, setShowCustom] = useState(value === "__custom__" || (value && !options.includes(value) && value !== ""));

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
            onChange(v);
          }
        }}
      >
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
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
          className="mt-1"
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

const GenericFormFields = ({ categorySlug, data, onChange, errors }: GenericFormFieldsProps) => {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  switch (categorySlug) {
    case "electronics":
      return (
        <div className="space-y-6">
          <SearchableSelect label="Device Type" value={data.device_type as string || ""} options={deviceTypes}
            onChange={(v) => updateField("device_type", v)} required error={errors.device_type} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={electronicsBrands}
              onChange={(v) => updateField("brand", v)} required error={errors.brand} />
            <div className="space-y-2">
              <Label>Model *</Label>
              <Input value={data.model as string || ""} onChange={(e) => updateField("model", e.target.value)} placeholder="e.g., MacBook Pro 14-inch" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect label="Storage" value={data.storage as string || ""} options={storageSizes} onChange={(v) => updateField("storage", v)} />
            <SearchableSelect label="RAM" value={data.ram as string || ""} options={ramSizes} onChange={(v) => updateField("ram", v)} />
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} required />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Has Warranty</Label><p className="text-sm text-muted-foreground">Is warranty still valid?</p></div>
            <Switch checked={data.has_warranty as boolean} onCheckedChange={(v) => updateField("has_warranty", v)} />
          </div>
        </div>
      );

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
              onChange={(v) => updateField("brand", v)} required />
          </div>
          <div className="space-y-2">
            <Label>Model *</Label>
            <Input value={data.model as string || ""} onChange={(e) => updateField("model", e.target.value)} placeholder="e.g., iPhone 15 Pro Max" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect label="Storage" value={data.storage as string || ""} options={storageSizes}
              onChange={(v) => updateField("storage", v)} required />
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} required />
            <div className="space-y-2">
              <Label>Color</Label>
              <Input value={data.color as string || ""} onChange={(e) => updateField("color", e.target.value)} placeholder="e.g., Space Black" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Unlocked</Label><p className="text-sm text-muted-foreground">Is the device unlocked?</p></div>
            <Switch checked={data.is_unlocked as boolean ?? true} onCheckedChange={(v) => updateField("is_unlocked", v)} />
          </div>
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
              onChange={(v) => updateField("clothing_type", v)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect label="Size" value={data.size as string || ""} options={sizes}
              onChange={(v) => updateField("size", v)} required />
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={fashionBrands}
              onChange={(v) => updateField("brand", v)} />
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.slice(0, 4).map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <Input value={data.color as string || ""} onChange={(e) => updateField("color", e.target.value)} placeholder="e.g., Blue" />
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Input value={data.material as string || ""} onChange={(e) => updateField("material", e.target.value)} placeholder="e.g., Cotton" />
            </div>
          </div>
        </div>
      );

    case "animals-pets":
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Animal Type" value={data.animal_type as string || ""} options={animalTypes}
              onChange={(v) => updateField("animal_type", v)} required />
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
            onChange={(v) => updateField("product_type", v)} required error={errors.product_type} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={beautyBrands}
              onChange={(v) => updateField("brand", v)} />
            <SearchableSelect label="Skin Type" value={data.skin_type as string || ""} options={skinTypes}
              onChange={(v) => updateField("skin_type", v)} />
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
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.slice(0, 3).map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} />
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
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={furnitureBrands}
              onChange={(v) => updateField("brand", v)} />
            <SearchableSelect label="Material" value={data.material as string || ""} options={furnitureMaterials}
              onChange={(v) => updateField("material", v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} required />
            <div className="space-y-2">
              <Label>Dimensions</Label>
              <Input value={data.dimensions as string || ""} onChange={(e) => updateField("dimensions", e.target.value)} placeholder="e.g., 200cm x 150cm x 80cm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <Input value={data.color as string || ""} onChange={(e) => updateField("color", e.target.value)} placeholder="e.g., Brown" />
            </div>
            <div className="space-y-2">
              <Label>Style</Label>
              <Input value={data.style as string || ""} onChange={(e) => updateField("style", e.target.value)} placeholder="e.g., Modern, Classic" />
            </div>
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
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={kidsBrands}
              onChange={(v) => updateField("brand", v)} />
            <SearchableSelect label="Age Range" value={data.age_range as string || ""} options={ageRanges}
              onChange={(v) => updateField("age_range", v)} />
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
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.slice(0, 4).map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} required />
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
            onChange={(v) => updateField("service_type", v)} required error={errors.service_type} />
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
            onChange={(v) => updateField("product_type", v)} required error={errors.product_type} />
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
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={constructionBrands}
              onChange={(v) => updateField("brand", v)} />
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} />
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
            onChange={(v) => updateField("equipment_type", v)} required error={errors.equipment_type} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={equipmentBrands}
              onChange={(v) => updateField("brand", v)} />
            <div className="space-y-2">
              <Label>Model</Label>
              <Input value={data.model as string || ""} onChange={(e) => updateField("model", e.target.value)} placeholder="e.g., CAT 320" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} />
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
            onChange={(v) => updateField("item_type", v)} required error={errors.item_type} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect label="Brand" value={data.brand as string || ""} options={leisureBrands}
              onChange={(v) => updateField("brand", v)} />
            <SearchableSelect label="Condition" value={data.condition as string || ""} options={conditions.map(c => c.label)}
              onChange={(v) => {
                const cond = conditions.find(c => c.label === v);
                updateField("condition", cond ? cond.value : v);
              }} required />
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
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select value={data.condition as string} onValueChange={(v) => updateField("condition", v)}>
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
  }
};

export default GenericFormFields;
