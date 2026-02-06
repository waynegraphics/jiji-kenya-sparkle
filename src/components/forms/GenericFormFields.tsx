import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenericFormFieldsProps {
  categorySlug: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

// Condition options shared across categories
const conditions = [
  { value: "brand_new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
];

// Electronics-specific options
const deviceTypes = [
  "Laptop", "Desktop Computer", "Monitor", "TV", "Camera", "Printer",
  "Gaming Console", "Audio Equipment", "Projector", "Smart Home Device", "Other"
];

const storageSizes = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "Other"];
const ramSizes = ["2GB", "4GB", "8GB", "16GB", "32GB", "64GB"];

// Phone-specific options
const phoneBrands = [
  "Apple", "Samsung", "Huawei", "Xiaomi", "OPPO", "Vivo", "OnePlus",
  "Google", "Nokia", "Tecno", "Infinix", "itel", "Realme", "Other"
];

// Fashion-specific options
const genders = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "kids_boys", label: "Boys" },
  { value: "kids_girls", label: "Girls" },
];

const clothingTypes = [
  "Shirts", "T-Shirts", "Dresses", "Pants/Trousers", "Jeans", "Shorts",
  "Skirts", "Suits", "Jackets", "Coats", "Sweaters", "Activewear",
  "Traditional Wear", "Swimwear", "Underwear", "Sleepwear", "Other"
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];

// Pet-specific options
const animalTypes = [
  "Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Guinea Pig",
  "Turtle", "Snake", "Livestock - Cow", "Livestock - Goat", "Livestock - Sheep",
  "Livestock - Chicken", "Other"
];

const GenericFormFields = ({ categorySlug, data, onChange, errors }: GenericFormFieldsProps) => {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  switch (categorySlug) {
    case "electronics":
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Device Type *</Label>
            <Select value={data.device_type as string} onValueChange={(v) => updateField("device_type", v)}>
              <SelectTrigger className={errors.device_type ? "border-destructive" : ""}>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Input
                value={data.brand as string || ""}
                onChange={(e) => updateField("brand", e.target.value)}
                placeholder="e.g., Apple, Samsung, HP"
              />
            </div>
            <div className="space-y-2">
              <Label>Model *</Label>
              <Input
                value={data.model as string || ""}
                onChange={(e) => updateField("model", e.target.value)}
                placeholder="e.g., MacBook Pro 14-inch"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Storage</Label>
              <Select value={data.storage as string} onValueChange={(v) => updateField("storage", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {storageSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>RAM</Label>
              <Select value={data.ram as string} onValueChange={(v) => updateField("ram", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {ramSizes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select value={data.condition as string} onValueChange={(v) => updateField("condition", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Has Warranty</Label>
              <p className="text-sm text-muted-foreground">Is warranty still valid?</p>
            </div>
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
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Select value={data.brand as string} onValueChange={(v) => updateField("brand", v)}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {phoneBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Model *</Label>
            <Input
              value={data.model as string || ""}
              onChange={(e) => updateField("model", e.target.value)}
              placeholder="e.g., iPhone 15 Pro Max"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Storage *</Label>
              <Select value={data.storage as string} onValueChange={(v) => updateField("storage", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {storageSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select value={data.condition as string} onValueChange={(v) => updateField("condition", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                value={data.color as string || ""}
                onChange={(e) => updateField("color", e.target.value)}
                placeholder="e.g., Space Black"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Unlocked</Label>
              <p className="text-sm text-muted-foreground">Is the device unlocked?</p>
            </div>
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
            <div className="space-y-2">
              <Label>Clothing Type *</Label>
              <Select value={data.clothing_type as string} onValueChange={(v) => updateField("clothing_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {clothingTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Size *</Label>
              <Select value={data.size as string} onValueChange={(v) => updateField("size", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={data.brand as string || ""} onChange={(e) => updateField("brand", e.target.value)} placeholder="e.g., Nike, Zara" />
            </div>
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select value={data.condition as string} onValueChange={(v) => updateField("condition", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {conditions.slice(0, 4).map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color *</Label>
              <Input value={data.color as string || ""} onChange={(e) => updateField("color", e.target.value)} placeholder="e.g., Blue, Red" />
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Input value={data.material as string || ""} onChange={(e) => updateField("material", e.target.value)} placeholder="e.g., Cotton, Polyester" />
            </div>
          </div>
        </div>
      );

    case "animals-pets":
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Animal Type *</Label>
              <Select value={data.animal_type as string} onValueChange={(v) => updateField("animal_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {animalTypes.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
            <div className="flex items-center justify-between">
              <Label>Vaccinated</Label>
              <Switch checked={data.is_vaccinated as boolean} onCheckedChange={(v) => updateField("is_vaccinated", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Neutered/Spayed</Label>
              <Switch checked={data.is_neutered as boolean} onCheckedChange={(v) => updateField("is_neutered", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Health Certificate Available</Label>
              <Switch checked={data.health_certificate as boolean} onCheckedChange={(v) => updateField("health_certificate", v)} />
            </div>
          </div>
        </div>
      );

    // Default fallback for categories without specific forms
    default:
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Item Type *</Label>
            <Input
              value={data.item_type as string || ""}
              onChange={(e) => updateField("item_type", e.target.value)}
              placeholder="What are you selling?"
            />
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
