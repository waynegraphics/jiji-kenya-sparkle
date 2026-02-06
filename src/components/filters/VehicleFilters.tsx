import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface VehicleFiltersProps {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const transmissionOptions = ["Any", "Automatic", "Manual", "CVT", "Semi-Automatic"];
const fuelOptions = ["Any", "Petrol", "Diesel", "Electric", "Hybrid", "LPG"];
const conditionOptions = ["Any", "Brand New", "Foreign Used", "Locally Used"];
const bodyTypes = ["Any", "Sedan", "SUV", "Hatchback", "Pickup", "Van", "Coupe", "Convertible", "Wagon"];

const VehicleFilters = ({ filters, onChange }: VehicleFiltersProps) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium text-muted-foreground">Vehicle Filters</h4>
      
      {/* Transmission */}
      <div className="space-y-2">
        <Label className="text-sm">Transmission</Label>
        <Select
          value={filters.transmission || "Any"}
          onValueChange={(value) => onChange("transmission", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {transmissionOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <Label className="text-sm">Fuel Type</Label>
        <Select
          value={filters.fuelType || "Any"}
          onValueChange={(value) => onChange("fuelType", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {fuelOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-sm">Condition</Label>
        <Select
          value={filters.condition || "Any"}
          onValueChange={(value) => onChange("condition", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {conditionOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body Type */}
      <div className="space-y-2">
        <Label className="text-sm">Body Type</Label>
        <Select
          value={filters.bodyType || "Any"}
          onValueChange={(value) => onChange("bodyType", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {bodyTypes.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Range */}
      <div className="space-y-2">
        <Label className="text-sm">Year Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="From"
            className="h-9"
            value={filters.yearFrom || ""}
            onChange={(e) => onChange("yearFrom", e.target.value)}
          />
          <Input
            type="number"
            placeholder="To"
            className="h-9"
            value={filters.yearTo || ""}
            onChange={(e) => onChange("yearTo", e.target.value)}
          />
        </div>
      </div>

      {/* Mileage Range */}
      <div className="space-y-2">
        <Label className="text-sm">Mileage (KM)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9"
            value={filters.mileageMin || ""}
            onChange={(e) => onChange("mileageMin", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="h-9"
            value={filters.mileageMax || ""}
            onChange={(e) => onChange("mileageMax", e.target.value)}
          />
        </div>
      </div>

      {/* Exchange Possible */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="exchange"
          checked={filters.exchangePossible === "true"}
          onCheckedChange={(checked) => onChange("exchangePossible", checked ? "true" : "")}
        />
        <Label htmlFor="exchange" className="text-sm cursor-pointer">
          Exchange Possible
        </Label>
      </div>
    </div>
  );
};

export default VehicleFilters;
