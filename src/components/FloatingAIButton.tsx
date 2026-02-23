import { useState, useRef, useEffect } from "react";
import { BrainCircuit, X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Don't close if clicking the FAB itself
        const fab = document.getElementById("ai-fab-button");
        if (fab && fab.contains(e.target as Node)) return;
        setIsOpen(false);
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
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        return;
      }
      if (data?.error === "unrelated") {
        toast.error("Please search for items, properties, or services on our marketplace");
        return;
      }
      setAiResult(data);
    } catch (e) {
      console.error("AI search error:", e);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
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
    setIsOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  const formatPrice = (val: unknown) => {
    if (!val || typeof val !== "number") return "";
    return `KSh ${val.toLocaleString()}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute bottom-16 right-0 w-[92vw] max-w-md bg-card border border-border rounded-2xl shadow-2xl mb-3 animate-in slide-in-from-bottom-4 fade-in duration-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold block leading-tight">AI Smart Search</span>
                <span className="text-[10px] text-muted-foreground">Describe what you're looking for</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* AI Result */}
          {aiResult && (
            <div className="px-4 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">AI understood your search</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {Math.round((aiResult.confidence as number || 0) * 100)}%
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {aiResult.category && (
                  <Badge variant="default" className="text-[10px]">{String(aiResult.category).replace("-", " ")}</Badge>
                )}
                {aiResult.make && <Badge variant="outline" className="text-[10px]">{String(aiResult.make)}</Badge>}
                {aiResult.model && <Badge variant="outline" className="text-[10px]">{String(aiResult.model)}</Badge>}
                {aiResult.brand && <Badge variant="outline" className="text-[10px]">{String(aiResult.brand)}</Badge>}
                {aiResult.location && <Badge variant="outline" className="text-[10px]">📍 {String(aiResult.location)}</Badge>}
                {aiResult.condition && <Badge variant="outline" className="text-[10px]">{String(aiResult.condition)}</Badge>}
                {(aiResult.price_min || aiResult.price_max) && (
                  <Badge variant="outline" className="text-[10px] text-primary">
                    {aiResult.price_min ? formatPrice(aiResult.price_min) : "Any"} – {aiResult.price_max ? formatPrice(aiResult.price_max) : "Any"}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={navigateWithFilters} className="flex-1 gap-1.5 h-8 text-xs">
                  <Search className="h-3 w-3" /> View Results
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    setAiResult(null);
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                    setIsOpen(false);
                  }}
                >
                  Regular
                </Button>
              </div>
            </div>
          )}

          {/* Input Area — chat-style bottom bar */}
          <div className="p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAISearch();
                  }
                }}
                placeholder='Try: "Toyota under 1M in Nairobi"'
                rows={2}
                className="flex-1 resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <Button
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0"
                onClick={handleAISearch}
                disabled={isProcessing || !query.trim()}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              Describe in natural language — include price, location, brand etc.
            </p>
          </div>
        </div>
      )}

      <Button
        id="ai-fab-button"
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isOpen ? <X className="h-6 w-6" /> : <BrainCircuit className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingAIButton;
