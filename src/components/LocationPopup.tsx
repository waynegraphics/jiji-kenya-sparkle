import { useState, useMemo } from "react";
import { MapPin, Search, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useCounties, useTowns } from "@/hooks/useKenyaLocations";
import { useCountyAdCounts } from "@/hooks/useCountyAdCounts";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface LocationPopupProps {
  onSelect: (county: string, town?: string) => void;
  selectedCounty?: string;
  selectedTown?: string;
}

const LocationPopup = ({ onSelect, selectedCounty, selectedTown }: LocationPopupProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [drillCountyId, setDrillCountyId] = useState<string | null>(null);
  const [drillCountyName, setDrillCountyName] = useState("");
  const { data: counties = [] } = useCounties();
  const { data: adData } = useCountyAdCounts();
  const { counts = {}, total = 0 } = adData || {};
  const { data: towns = [] } = useTowns(drillCountyId || undefined);

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

  const handleCountyClick = (countyId: string, countyName: string) => {
    setDrillCountyId(countyId);
    setDrillCountyName(countyName);
    setSearch("");
  };

  const handleSelectCountyOnly = () => {
    onSelect(drillCountyName);
    resetAndClose();
  };

  const handleSelectTown = (townName: string) => {
    onSelect(drillCountyName, townName);
    resetAndClose();
  };

  const handleSelectAllKenya = () => {
    onSelect("");
    resetAndClose();
  };

  const resetAndClose = () => {
    setOpen(false);
    setDrillCountyId(null);
    setDrillCountyName("");
    setSearch("");
  };

  const goBack = () => {
    setDrillCountyId(null);
    setDrillCountyName("");
    setSearch("");
  };

  const displayLabel = selectedTown
    ? `${selectedCounty}, ${selectedTown}`
    : selectedCounty || "All Kenya";

  const filteredTowns = towns.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-card hover:bg-muted transition-colors rounded-lg px-4 py-2.5 text-sm font-medium text-foreground border border-border"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="truncate max-w-[160px]">{displayLabel}</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 max-h-[85vh] [&>button]:hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {drillCountyId && (
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={goBack}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <DialogTitle className="text-base font-semibold text-foreground truncate">
                {drillCountyId ? drillCountyName : "All Kenya"}
                <span className="text-muted-foreground font-normal ml-2 text-sm">
                  {!drillCountyId && `• ${total.toLocaleString()} Ads`}
                </span>
              </DialogTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto sm:hidden" onClick={resetAndClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative flex-1 sm:w-52 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={drillCountyId ? "Find area..." : "Find county..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 h-9 text-sm"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={resetAndClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="max-h-[65vh]">
            {drillCountyId ? (
              /* Towns view */
              <div className="p-3">
                <button
                  onClick={handleSelectCountyOnly}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors rounded-lg border border-border mb-3"
                >
                  <MapPin className="h-4 w-4" />
                  All {drillCountyName}
                  {counts[drillCountyName] ? (
                    <span className="text-muted-foreground text-xs ml-auto">
                      {counts[drillCountyName].toLocaleString()} ads
                    </span>
                  ) : null}
                </button>

                {filteredTowns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    {filteredTowns.map((town) => (
                      <button
                        key={town.id}
                        onClick={() => handleSelectTown(town.name)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors rounded-md group"
                      >
                        <span className="text-foreground group-hover:text-primary transition-colors">
                          {town.name}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    {search ? "No areas match your search" : "No areas available"}
                  </p>
                )}
              </div>
            ) : (
              /* Counties view */
              <div className="p-2">
                <button
                  onClick={handleSelectAllKenya}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors rounded-lg mb-1"
                >
                  <MapPin className="h-4 w-4" />
                  All Kenya
                  <span className="text-muted-foreground text-xs ml-auto">
                    {total.toLocaleString()} ads
                  </span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className={colIdx < 2 ? "md:border-r border-border" : ""}>
                      {col.map((item) => {
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
                            onClick={() => handleCountyClick(county.id, county.name)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/60 transition-colors rounded-md group"
                          >
                            <span className="text-foreground group-hover:text-primary transition-colors">
                              {county.name}
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              {count > 0 && <span>{count.toLocaleString()} ads</span>}
                              <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationPopup;
