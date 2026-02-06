import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicleMakes, useVehicleModels } from "@/hooks/useCategories";
import type { VehicleFormData } from "@/types/categories";
import { X } from "lucide-react";

interface VehicleFormFieldsProps {
  data: Partial<VehicleFormData>;
  onChange: (data: Partial<VehicleFormData>) => void;
  errors: Record<string, string>;
}

const vehicleTypes = [
  { value: "car", label: "Car" },
  { value: "motorcycle", label: "Motorcycle & Scooter" },
  { value: "truck", label: "Truck" },
  { value: "bus", label: "Bus & Minibus" },
  { value: "van", label: "Van" },
  { value: "trailer", label: "Trailer" },
  { value: "boat", label: "Boat & Watercraft" },
  { value: "heavy_equipment", label: "Heavy Equipment" },
];

const conditions = [
  { value: "brand_new", label: "Brand New" },
  { value: "foreign_used", label: "Foreign Used" },
  { value: "locally_used", label: "Locally Used" },
];

const transmissions = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "cvt", label: "CVT" },
  { value: "semi_automatic", label: "Semi-Automatic" },
];

const fuelTypes = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "lpg", label: "LPG" },
];

const drivetrains = [
  { value: "fwd", label: "Front-Wheel Drive (FWD)" },
  { value: "rwd", label: "Rear-Wheel Drive (RWD)" },
  { value: "awd", label: "All-Wheel Drive (AWD)" },
  { value: "4wd", label: "4-Wheel Drive (4WD)" },
];

const bodyTypes = [
  "Sedan", "Hatchback", "SUV", "Crossover", "Coupe", "Convertible",
  "Wagon", "Van", "Pickup", "Truck", "Minivan", "Sports Car"
];

const colors = [
  "Black", "White", "Silver", "Gray", "Red", "Blue", "Green",
  "Brown", "Beige", "Gold", "Orange", "Yellow", "Purple", "Pink"
];

const keyFeatures = [
  "Air Conditioning", "Power Steering", "Power Windows", "Central Locking",
  "Airbags", "ABS", "Cruise Control", "Leather Seats", "Sunroof",
  "Navigation System", "Bluetooth", "Backup Camera", "Parking Sensors",
  "Alloy Wheels", "Fog Lights", "Keyless Entry", "Push Start",
  "Heated Seats", "Apple CarPlay", "Android Auto"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

const VehicleFormFields = ({ data, onChange, errors }: VehicleFormFieldsProps) => {
  const { data: makes, isLoading: makesLoading } = useVehicleMakes();
  const { data: models, isLoading: modelsLoading } = useVehicleModels(data.make_id);
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(data.key_features || []);
  
  // Reset model when make changes
  useEffect(() => {
    if (data.make_id && models && !models.find(m => m.id === data.model_id)) {
      onChange({ ...data, model_id: undefined });
    }
  }, [data.make_id, models]);

  useEffect(() => {
    onChange({ ...data, key_features: selectedFeatures });
  }, [selectedFeatures]);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const isElectric = data.fuel_type === "electric";

  return (
    <div className="space-y-6">
      {/* Vehicle Type */}
      <div className="space-y-2">
        <Label>Vehicle Type *</Label>
        <Select
          value={data.vehicle_type}
          onValueChange={(value) => onChange({ ...data, vehicle_type: value as VehicleFormData['vehicle_type'] })}
        >
          <SelectTrigger className={errors.vehicle_type ? "border-destructive" : ""}>
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            {vehicleTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicle_type && <p className="text-sm text-destructive">{errors.vehicle_type}</p>}
      </div>

      {/* Make & Model Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Make / Brand *</Label>
          <Select
            value={data.make_id}
            onValueChange={(value) => onChange({ ...data, make_id: value, model_id: undefined })}
            disabled={makesLoading}
          >
            <SelectTrigger className={errors.make_id ? "border-destructive" : ""}>
              <SelectValue placeholder={makesLoading ? "Loading..." : "Select make"} />
            </SelectTrigger>
            <SelectContent>
              {makes?.map((make) => (
                <SelectItem key={make.id} value={make.id}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.make_id && <p className="text-sm text-destructive">{errors.make_id}</p>}
        </div>

        <div className="space-y-2">
          <Label>Model *</Label>
          <Select
            value={data.model_id}
            onValueChange={(value) => onChange({ ...data, model_id: value })}
            disabled={!data.make_id || modelsLoading}
          >
            <SelectTrigger className={errors.model_id ? "border-destructive" : ""}>
              <SelectValue placeholder={modelsLoading ? "Loading..." : "Select model"} />
            </SelectTrigger>
            <SelectContent>
              {models?.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.model_id && <p className="text-sm text-destructive">{errors.model_id}</p>}
        </div>
      </div>

      {/* Year & Condition Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Year of Manufacture *</Label>
          <Select
            value={data.year_of_manufacture?.toString()}
            onValueChange={(value) => onChange({ ...data, year_of_manufacture: parseInt(value) })}
          >
            <SelectTrigger className={errors.year_of_manufacture ? "border-destructive" : ""}>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.year_of_manufacture && <p className="text-sm text-destructive">{errors.year_of_manufacture}</p>}
        </div>

        <div className="space-y-2">
          <Label>Condition *</Label>
          <Select
            value={data.condition || ""}
            onValueChange={(value) => onChange({ ...data, condition: value as VehicleFormData['condition'] })}
          >
            <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
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
          {errors.condition && <p className="text-sm text-destructive">{errors.condition}</p>}
        </div>
      </div>

      {/* Trim */}
      <div className="space-y-2">
        <Label>Trim / Variant</Label>
        <Input
          value={data.trim || ""}
          onChange={(e) => onChange({ ...data, trim: e.target.value })}
          placeholder="e.g., Sport, Limited, Premium"
        />
      </div>

      {/* Colors Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Exterior Color *</Label>
          <Select
            value={data.exterior_color}
            onValueChange={(value) => onChange({ ...data, exterior_color: value })}
          >
            <SelectTrigger className={errors.exterior_color ? "border-destructive" : ""}>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Interior Color</Label>
          <Select
            value={data.interior_color}
            onValueChange={(value) => onChange({ ...data, interior_color: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transmission & Fuel Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Transmission *</Label>
          <Select
            value={data.transmission || ""}
            onValueChange={(value) => onChange({ ...data, transmission: value as VehicleFormData['transmission'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              {transmissions.map((trans) => (
                <SelectItem key={trans.value} value={trans.value}>
                  {trans.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fuel Type *</Label>
          <Select
            value={data.fuel_type || ""}
            onValueChange={(value) => onChange({ ...data, fuel_type: value as VehicleFormData['fuel_type'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map((fuel) => (
                <SelectItem key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drivetrain & Body Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Drivetrain</Label>
          <Select
            value={data.drivetrain || ""}
            onValueChange={(value) => onChange({ ...data, drivetrain: value as VehicleFormData['drivetrain'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select drivetrain" />
            </SelectTrigger>
            <SelectContent>
              {drivetrains.map((dt) => (
                <SelectItem key={dt.value} value={dt.value}>
                  {dt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Body Type</Label>
          <Select
            value={data.body_type || ""}
            onValueChange={(value) => onChange({ ...data, body_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select body type" />
            </SelectTrigger>
            <SelectContent>
              {bodyTypes.map((body) => (
                <SelectItem key={body} value={body}>
                  {body}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Engine Specs (hidden for electric) */}
      {!isElectric && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Engine Size (cc)</Label>
            <Input
              type="number"
              value={data.engine_size_cc || ""}
              onChange={(e) => onChange({ ...data, engine_size_cc: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 2000"
            />
          </div>

          <div className="space-y-2">
            <Label>Cylinders</Label>
            <Select
              value={data.cylinders?.toString() || ""}
              onValueChange={(value) => onChange({ ...data, cylinders: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 8, 10, 12].map((cyl) => (
                  <SelectItem key={cyl} value={cyl.toString()}>
                    {cyl} Cylinders
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Horsepower (hp)</Label>
            <Input
              type="number"
              value={data.horsepower || ""}
              onChange={(e) => onChange({ ...data, horsepower: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 180"
            />
          </div>
        </div>
      )}

      {/* Mileage, Seats, Doors Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Mileage (km)</Label>
          <Input
            type="number"
            value={data.mileage || ""}
            onChange={(e) => onChange({ ...data, mileage: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 50000"
          />
        </div>

        <div className="space-y-2">
          <Label>Seats</Label>
          <Select
            value={data.seats?.toString() || ""}
            onValueChange={(value) => onChange({ ...data, seats: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[2, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((s) => (
                <SelectItem key={s} value={s.toString()}>
                  {s} Seats
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Doors</Label>
          <Select
            value={data.doors?.toString() || ""}
            onValueChange={(value) => onChange({ ...data, doors: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5].map((d) => (
                <SelectItem key={d} value={d.toString()}>
                  {d} Doors
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* VIN / Chassis */}
      <div className="space-y-2">
        <Label>VIN / Chassis Number</Label>
        <Input
          value={data.vin_chassis || ""}
          onChange={(e) => onChange({ ...data, vin_chassis: e.target.value })}
          placeholder="Enter VIN or chassis number"
        />
      </div>

      {/* Registration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Registered Vehicle</Label>
            <p className="text-sm text-muted-foreground">Is this vehicle currently registered?</p>
          </div>
          <Switch
            checked={data.is_registered || false}
            onCheckedChange={(checked) => onChange({ ...data, is_registered: checked })}
          />
        </div>

        {data.is_registered && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input
                value={data.registration_number || ""}
                onChange={(e) => onChange({ ...data, registration_number: e.target.value })}
                placeholder="e.g., KBZ 123A"
              />
            </div>
            <div className="space-y-2">
              <Label>Registration Year</Label>
              <Select
                value={data.registration_year?.toString() || ""}
                onValueChange={(value) => onChange({ ...data, registration_year: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.slice(0, 20).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Exchange Possible */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Exchange Possible</Label>
          <p className="text-sm text-muted-foreground">Are you open to exchanging this vehicle?</p>
        </div>
        <Switch
          checked={data.exchange_possible || false}
          onCheckedChange={(checked) => onChange({ ...data, exchange_possible: checked })}
        />
      </div>

      {/* Key Features */}
      <div className="space-y-3">
        <Label>Key Features</Label>
        <div className="flex flex-wrap gap-2">
          {keyFeatures.map((feature) => (
            <Badge
              key={feature}
              variant={selectedFeatures.includes(feature) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleFeature(feature)}
            >
              {feature}
              {selectedFeatures.includes(feature) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedFeatures.length} features selected
        </p>
      </div>
    </div>
  );
};

export default VehicleFormFields;
