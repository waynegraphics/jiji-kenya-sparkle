import { useState, useRef, useEffect } from "react";
import { Search, BrainCircuit, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AISearchBarProps {
  className?: string;
}

const AISearchBar = ({ className = "" }: AISearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAiResult(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAISearch = async () => {
    if (!query.trim() || query.trim().length < 3) {
      toast.error("Please enter a more detailed search query");
      return;
    }

    setIsProcessing(true);
    setAiResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { query: query.trim() },
      });

      if (error) throw error;

      if (data?.fallback) {
        // AI couldn't parse, fall back to regular search
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        return;
      }

      if (data?.error === "unrelated") {
        toast.error("Please search for items, properties, or services on our marketplace");
        return;
      }

      // Show parsed result before navigating
      setAiResult(data);
    } catch (e) {
      console.error("AI search error:", e);
      // Fallback to regular search
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateWithFilters = () => {
    if (!aiResult) return;

    const params = new URLSearchParams();
    if (aiResult.keyword) params.set("q", String(aiResult.keyword));
    if (aiResult.category) params.set("category", String(aiResult.category));
    if (aiResult.location) params.set("location", String(aiResult.location));
    if (aiResult.price_min) params.set("minPrice", String(aiResult.price_min));
    if (aiResult.price_max) params.set("maxPrice", String(aiResult.price_max));
    if (aiResult.condition) params.set("condition", String(aiResult.condition));
    if (aiResult.make) params.set("make", String(aiResult.make));
    if (aiResult.model) params.set("model", String(aiResult.model));
    if (aiResult.brand) params.set("brand", String(aiResult.brand));
    if (aiResult.bedrooms) params.set("bedrooms", String(aiResult.bedrooms));
    if (aiResult.property_type) params.set("propertyType", String(aiResult.property_type));
    if (aiResult.listing_type) params.set("listingType", String(aiResult.listing_type));

    setAiResult(null);
    navigate(`/search?${params.toString()}`);
  };

  const formatPrice = (val: unknown) => {
    if (!val || typeof val !== "number") return "";
    return `KSh ${val.toLocaleString()}`;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
        <Input
          type="text"
          placeholder='Try: "Toyota Fielder 2012 under 1M in Nairobi"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
          className="pl-12 pr-24 h-12 bg-card text-card-foreground border-border text-base"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => { setQuery(""); setAiResult(null); }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={handleAISearch}
            disabled={isProcessing || !query.trim()}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* AI Parsed Result Preview */}
      {aiResult && (
        <div className="fixed md:absolute left-2 right-2 md:left-0 md:right-0 md:top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">AI understood your search</span>
            <Badge variant="secondary" className="text-xs">
              {Math.round((aiResult.confidence as number || 0) * 100)}% confident
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {aiResult.category && (
              <Badge variant="default">{String(aiResult.category).replace("-", " ")}</Badge>
            )}
            {aiResult.make && <Badge variant="outline">Make: {String(aiResult.make)}</Badge>}
            {aiResult.model && <Badge variant="outline">Model: {String(aiResult.model)}</Badge>}
            {aiResult.brand && <Badge variant="outline">Brand: {String(aiResult.brand)}</Badge>}
            {aiResult.location && <Badge variant="outline">📍 {String(aiResult.location)}</Badge>}
            {aiResult.condition && <Badge variant="outline">{String(aiResult.condition)}</Badge>}
            {aiResult.bedrooms && <Badge variant="outline">{String(aiResult.bedrooms)} bed</Badge>}
            {(aiResult.price_min || aiResult.price_max) && (
              <Badge variant="outline" className="text-primary">
                {aiResult.price_min ? formatPrice(aiResult.price_min) : "Any"} - {aiResult.price_max ? formatPrice(aiResult.price_max) : "Any"}
              </Badge>
            )}
            {aiResult.year_min && <Badge variant="outline">From {String(aiResult.year_min)}</Badge>}
            {aiResult.year_max && <Badge variant="outline">To {String(aiResult.year_max)}</Badge>}
          </div>

          <div className="flex gap-2">
            <Button onClick={navigateWithFilters} className="flex-1 gap-2">
              <Search className="h-4 w-4" /> View Results
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAiResult(null);
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              Regular Search
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearchBar;
