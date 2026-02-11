import { useState, useMemo } from "react";
import { MapPin, Search, ChevronRight, X } from "lucide-react";
import { useCounties } from "@/hooks/useKenyaLocations";
import { useCountyAdCounts } from "@/hooks/useCountyAdCounts";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocationPopupProps {
  onSelect: (county: string) => void;
  selectedCounty?: string;
}

const LocationPopup = ({ onSelect, selectedCounty }: LocationPopupProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: counties = [] } = useCounties();
  const { data: adData } = useCountyAdCounts();
  const { counts = {}, total = 0 } = adData || {};

  const grouped = useMemo(() => {
    const filtered = counties.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    const groups: Record<string, typeof counties> = {};
    filtered.forEach((c) => {
      const letter = c.name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return groups;
  }, [counties, search]);

  const letters = Object.keys(grouped).sort();

  // Distribute into 3 columns
  const allItems: { type: "letter" | "county"; letter?: string; county?: (typeof counties)[0] }[] = [];
  letters.forEach((letter) => {
    allItems.push({ type: "letter", letter });
    grouped[letter].forEach((county) => {
      allItems.push({ type: "county", county, letter });
    });
  });

  const third = Math.ceil(allItems.length / 3);
  const columns = [
    allItems.slice(0, third),
    allItems.slice(third, third * 2),
    allItems.slice(third * 2),
  ];

  const handleSelect = (countyName: string) => {
    onSelect(countyName);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-card hover:bg-muted transition-colors rounded-lg px-4 py-2.5 text-sm font-medium text-foreground border border-border"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="truncate max-w-[140px]">
          {selectedCounty || "All Kenya"}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold text-foreground">
              All Kenya
              <span className="text-muted-foreground font-normal ml-2 text-sm">
                • {total.toLocaleString()} Ads
              </span>
            </DialogTitle>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find county..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* County Grid */}
          <ScrollArea className="max-h-[65vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 p-2">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className={colIdx < 2 ? "md:border-r border-border" : ""}>
                  {col.map((item, idx) => {
                    if (item.type === "letter") {
                      return (
                        <div
                          key={`l-${item.letter}`}
                          className="px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider"
                        >
                          {item.letter}
                        </div>
                      );
                    }
                    const county = item.county!;
                    const count = counts[county.name] || 0;
                    return (
                      <button
                        key={county.id}
                        onClick={() => handleSelect(county.name)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/60 transition-colors rounded-md group"
                      >
                        <span className="text-foreground group-hover:text-primary transition-colors">
                          {county.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          {count > 0 && (
                            <span>
                              {count.toLocaleString()} ads
                            </span>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationPopup;
