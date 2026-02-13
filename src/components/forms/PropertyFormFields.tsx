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
import type { PropertyFormData } from "@/types/categories";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface PropertyFormFieldsProps {
  data: Partial<PropertyFormData>;
  onChange: (data: Partial<PropertyFormData>) => void;
  errors: Record<string, string>;
}

const propertyTypes = [
  { value: "apartment", label: "Apartment / Flat" },
  { value: "house", label: "House" },
  { value: "land", label: "Land / Plot" },
  { value: "commercial", label: "Commercial Property" },
  { value: "office", label: "Office Space" },
  { value: "warehouse", label: "Warehouse" },
  { value: "shop", label: "Shop / Retail Space" },
  { value: "room", label: "Room / Bedsitter" },
];

const listingTypes = [
  { value: "for_sale", label: "For Sale" },
  { value: "for_rent", label: "For Rent" },
  { value: "short_stay", label: "Short Stay / Airbnb" },
];

const furnishingTypes = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi-Furnished" },
  { value: "fully_furnished", label: "Fully Furnished" },
];

const amenitiesList = [
  "Swimming Pool", "Gym", "Parking", "Security", "CCTV", "Elevator",
  "Backup Generator", "Borehole", "Garden", "Balcony", "Terrace",
  "Storage Room", "Staff Quarters", "Playground", "Clubhouse",
  "Internet Ready", "Cable TV Ready", "Air Conditioning", "Fireplace"
];

const nearbyFacilitiesList = [
  "Schools", "Hospitals", "Shopping Malls", "Public Transport", "Banks",
  "Restaurants", "Supermarkets", "Parks", "Churches", "Mosques",
  "Police Station", "Fire Station", "Gym", "Beach", "Highway Access"
];

const PropertyFormFields = ({ data, onChange, errors }: PropertyFormFieldsProps) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(data.amenities || []);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(data.nearby_facilities || []);

  useEffect(() => {
    onChange({ ...data, amenities: selectedAmenities, nearby_facilities: selectedFacilities });
  }, [selectedAmenities, selectedFacilities]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const isLand = data.property_type === "land";
  const isCommercial = ["commercial", "office", "warehouse", "shop"].includes(data.property_type || "");
  const showBedrooms = !isLand && !isCommercial;
  const isRental = data.listing_type === "for_rent" || data.listing_type === "short_stay";

  return (
    <div className="space-y-6">
      {/* Property Type & Listing Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Property Type *</Label>
          <Select
            value={data.property_type}
            onValueChange={(value) => onChange({ ...data, property_type: value as PropertyFormData['property_type'] })}
          >
            <SelectTrigger className={errors.property_type ? "border-destructive" : ""}>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.property_type && <p className="text-sm text-destructive">{errors.property_type}</p>}
        </div>

        <div className="space-y-2">
          <Label>Listing Type *</Label>
          <Select
            value={data.listing_type}
            onValueChange={(value) => onChange({ ...data, listing_type: value as PropertyFormData['listing_type'] })}
          >
            <SelectTrigger className={errors.listing_type ? "border-destructive" : ""}>
              <SelectValue placeholder="Select listing type" />
            </SelectTrigger>
            <SelectContent>
              {listingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.listing_type && <p className="text-sm text-destructive">{errors.listing_type}</p>}
        </div>
      </div>

      {/* Bedrooms & Bathrooms (only for residential) */}
      {showBedrooms && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Bedrooms *</Label>
            <Select
              value={data.bedrooms?.toString() || ""}
              onValueChange={(value) => onChange({ ...data, bedrooms: parseInt(value) })}
            >
              <SelectTrigger className={errors.bedrooms ? "border-destructive" : ""}>
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Studio</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Bedroom{num > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bathrooms *</Label>
            <Select
              value={data.bathrooms?.toString() || ""}
              onValueChange={(value) => onChange({ ...data, bathrooms: parseInt(value) })}
            >
              <SelectTrigger className={errors.bathrooms ? "border-destructive" : ""}>
                <SelectValue placeholder="Select bathrooms" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Bathroom{num > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isLand ? "Plot Size (sqm)" : "Size (sqm)"}</Label>
          <Input
            type="number"
            value={isLand ? (data.plot_size_sqm || "") : (data.size_sqm || "")}
            onChange={(e) => onChange({ 
              ...data, 
              [isLand ? "plot_size_sqm" : "size_sqm"]: parseFloat(e.target.value) || undefined 
            })}
            placeholder="e.g., 150"
          />
        </div>

        {!isLand && (
          <div className="space-y-2">
            <Label>Plot Size (sqm)</Label>
            <Input
              type="number"
              value={data.plot_size_sqm || ""}
              onChange={(e) => onChange({ ...data, plot_size_sqm: parseFloat(e.target.value) || undefined })}
              placeholder="e.g., 500"
            />
          </div>
        )}
      </div>

      {/* Furnished (not for land/commercial without furnishing) */}
      {!isLand && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Furnished</Label>
              <p className="text-sm text-muted-foreground">Is the property furnished?</p>
            </div>
            <Switch
              checked={data.is_furnished || false}
              onCheckedChange={(checked) => onChange({ ...data, is_furnished: checked })}
            />
          </div>

          {data.is_furnished && (
            <div className="pl-4 border-l-2 border-primary/20 space-y-2">
              <Label>Furnishing Level</Label>
              <Select
                value={data.furnishing_type || ""}
                onValueChange={(value) => onChange({ ...data, furnishing_type: value as PropertyFormData['furnishing_type'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select furnishing level" />
                </SelectTrigger>
                <SelectContent>
                  {furnishingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Floor & Parking (not for land) */}
      {!isLand && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Floor Number</Label>
            <Input
              type="number"
              value={data.floor_number || ""}
              onChange={(e) => onChange({ ...data, floor_number: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 3"
            />
          </div>

          <div className="space-y-2">
            <Label>Total Floors</Label>
            <Input
              type="number"
              value={data.total_floors || ""}
              onChange={(e) => onChange({ ...data, total_floors: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 10"
            />
          </div>

          <div className="space-y-2">
            <Label>Parking Spaces</Label>
            <Select
              value={data.parking_spaces?.toString() || ""}
              onValueChange={(value) => onChange({ ...data, parking_spaces: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Parking</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Space{num > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Year Built */}
      <div className="space-y-2">
        <Label>Year Built</Label>
        <Input
          type="number"
          value={data.year_built || ""}
          onChange={(e) => onChange({ ...data, year_built: parseInt(e.target.value) || undefined })}
          placeholder="e.g., 2020"
          min={1900}
          max={new Date().getFullYear()}
        />
      </div>

      {/* Rental-specific fields */}
      {isRental && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Agency Fee</Label>
            <Input
              value={data.agency_fee || ""}
              onChange={(e) => onChange({ ...data, agency_fee: e.target.value })}
              placeholder="e.g., 1 month rent"
            />
          </div>

          <div className="space-y-2">
            <Label>Service Charge (monthly)</Label>
            <Input
              type="number"
              value={data.service_charge || ""}
              onChange={(e) => onChange({ ...data, service_charge: parseFloat(e.target.value) || undefined })}
              placeholder="e.g., 5000"
            />
          </div>
        </div>
      )}

      {/* Amenities */}
      {!isLand && (
        <div className="space-y-3">
          <Label>Amenities</Label>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((amenity) => (
              <Badge
                key={amenity}
                variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleAmenity(amenity)}
              >
                {amenity}
                {selectedAmenities.includes(amenity) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Facilities */}
      <div className="space-y-3">
        <Label>Nearby Facilities</Label>
        <div className="flex flex-wrap gap-2">
          {nearbyFacilitiesList.map((facility) => (
            <Badge
              key={facility}
              variant={selectedFacilities.includes(facility) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleFacility(facility)}
            >
              {facility}
              {selectedFacilities.includes(facility) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyFormFields;
