import { useState, useEffect } from "react";
import { useCounties, useTowns } from "@/hooks/useKenyaLocations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
  onLocationChange: (county: string, town?: string) => void;
  defaultCounty?: string;
  defaultTown?: string;
  /** Pass a county name (e.g. "Nairobi") to auto-resolve the county ID */
  defaultCountyName?: string;
  /** Pass a town name (e.g. "Westlands") to auto-resolve the town slug */
  defaultTownName?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const LocationSelector = ({
  onLocationChange,
  defaultCounty,
  defaultTown,
  defaultCountyName,
  defaultTownName,
  showLabel = true,
  compact = false,
}: LocationSelectorProps) => {
  const { data: counties = [] } = useCounties();
  const [selectedCountyId, setSelectedCountyId] = useState<string>(defaultCounty || "");
  const { data: towns = [] } = useTowns(selectedCountyId);
  const [selectedTown, setSelectedTown] = useState(defaultTown || "");
  const [resolvedOnce, setResolvedOnce] = useState(false);

  // Auto-resolve county name to ID when counties load
  useEffect(() => {
    if (resolvedOnce || !defaultCountyName || counties.length === 0) return;
    const match = counties.find(
      (c) => c.name.toLowerCase() === defaultCountyName.toLowerCase()
    );
    if (match) {
      setSelectedCountyId(match.id);
      setResolvedOnce(true);
    }
  }, [counties, defaultCountyName, resolvedOnce]);

  // Auto-resolve town name to slug when towns load
  useEffect(() => {
    if (!defaultTownName || towns.length === 0) return;
    const match = towns.find(
      (t) => t.name.toLowerCase() === defaultTownName.toLowerCase()
    );
    if (match) {
      setSelectedTown(match.slug);
    }
  }, [towns, defaultTownName]);

  const handleCountyChange = (countyId: string) => {
    setSelectedCountyId(countyId);
    setSelectedTown("");
    const county = counties.find((c) => c.id === countyId);
    if (county) {
      onLocationChange(county.name);
    }
  };

  const handleTownChange = (townSlug: string) => {
    setSelectedTown(townSlug);
    const county = counties.find((c) => c.id === selectedCountyId);
    const town = towns.find((t) => t.slug === townSlug);
    if (county && town) {
      onLocationChange(county.name, town.name);
    }
  };

  return (
    <div className={compact ? "flex gap-2" : "space-y-3"}>
      <div className={compact ? "flex-1" : ""}>
        {showLabel && <Label className="mb-1 block">County</Label>}
        <Select value={selectedCountyId} onValueChange={handleCountyChange}>
          <SelectTrigger className={compact ? "h-9" : ""}>
            <SelectValue placeholder="Select County" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {counties.map((county) => (
              <SelectItem key={county.id} value={county.id}>
                {county.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCountyId && towns.length > 0 && (
        <div className={compact ? "flex-1" : ""}>
          {showLabel && <Label className="mb-1 block">Area/Town</Label>}
          <Select value={selectedTown} onValueChange={handleTownChange}>
            <SelectTrigger className={compact ? "h-9" : ""}>
              <SelectValue placeholder="Select Area" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {towns.map((town) => (
                <SelectItem key={town.id} value={town.slug}>
                  {town.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
