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

interface PropertyFiltersProps {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const propertyTypes = ["Any", "Apartment", "House", "Villa", "Townhouse", "Studio", "Land", "Commercial", "Office"];
const listingTypes = ["Any", "For Sale", "For Rent"];
const bedroomOptions = ["Any", "1", "2", "3", "4", "5", "6+"];
const bathroomOptions = ["Any", "1", "2", "3", "4+"];
const furnishingOptions = ["Any", "Furnished", "Semi-Furnished", "Unfurnished"];

const PropertyFilters = ({ filters, onChange }: PropertyFiltersProps) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium text-muted-foreground">Property Filters</h4>
      
      {/* Listing Type */}
      <div className="space-y-2">
        <Label className="text-sm">Listing Type</Label>
        <Select
          value={filters.listingType || "Any"}
          onValueChange={(value) => onChange("listingType", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {listingTypes.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label className="text-sm">Property Type</Label>
        <Select
          value={filters.propertyType || "Any"}
          onValueChange={(value) => onChange("propertyType", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label className="text-sm">Bedrooms</Label>
        <Select
          value={filters.bedrooms || "Any"}
          onValueChange={(value) => onChange("bedrooms", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {bedroomOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bathrooms */}
      <div className="space-y-2">
        <Label className="text-sm">Bathrooms</Label>
        <Select
          value={filters.bathrooms || "Any"}
          onValueChange={(value) => onChange("bathrooms", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {bathroomOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size Range */}
      <div className="space-y-2">
        <Label className="text-sm">Size (sqm)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9"
            value={filters.sizeMin || ""}
            onChange={(e) => onChange("sizeMin", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="h-9"
            value={filters.sizeMax || ""}
            onChange={(e) => onChange("sizeMax", e.target.value)}
          />
        </div>
      </div>

      {/* Furnishing */}
      <div className="space-y-2">
        <Label className="text-sm">Furnishing</Label>
        <Select
          value={filters.furnishing || "Any"}
          onValueChange={(value) => onChange("furnishing", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {furnishingOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Parking */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="parking"
          checked={filters.hasParking === "true"}
          onCheckedChange={(checked) => onChange("hasParking", checked ? "true" : "")}
        />
        <Label htmlFor="parking" className="text-sm cursor-pointer">
          Has Parking
        </Label>
      </div>
    </div>
  );
};

export default PropertyFilters;
