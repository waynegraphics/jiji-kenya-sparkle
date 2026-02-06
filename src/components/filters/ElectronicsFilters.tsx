import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ElectronicsFiltersProps {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const conditionOptions = ["Any", "Brand New", "Like New", "Good", "Fair"];
const brands = ["Any", "Samsung", "LG", "Sony", "Apple", "HP", "Dell", "Lenovo", "Asus", "Other"];
const deviceTypes = ["Any", "TV", "Laptop", "Desktop", "Camera", "Gaming Console", "Audio", "Other"];

const ElectronicsFilters = ({ filters, onChange }: ElectronicsFiltersProps) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium text-muted-foreground">Electronics Filters</h4>
      
      {/* Device Type */}
      <div className="space-y-2">
        <Label className="text-sm">Device Type</Label>
        <Select
          value={filters.deviceType || "Any"}
          onValueChange={(value) => onChange("deviceType", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {deviceTypes.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label className="text-sm">Brand</Label>
        <Select
          value={filters.brand || "Any"}
          onValueChange={(value) => onChange("brand", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((opt) => (
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

      {/* Has Warranty */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="warranty"
          checked={filters.hasWarranty === "true"}
          onCheckedChange={(checked) => onChange("hasWarranty", checked ? "true" : "")}
        />
        <Label htmlFor="warranty" className="text-sm cursor-pointer">
          Has Warranty
        </Label>
      </div>
    </div>
  );
};

export default ElectronicsFilters;
