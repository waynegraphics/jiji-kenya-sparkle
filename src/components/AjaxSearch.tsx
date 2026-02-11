import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useMainCategories } from "@/hooks/useCategories";

interface SearchResult {
  id: string;
  title: string;
  price: number;
  main_category_id: string;
  sub_category_id: string | null;
  images: string[];
}

interface GroupedResults {
  categoryName: string;
  categorySlug: string;
  count: number;
  items: SearchResult[];
}

interface AjaxSearchProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

const AjaxSearch = ({ className = "", inputClassName = "", placeholder = "Search for anything..." }: AjaxSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GroupedResults[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: categories } = useMainCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("base_listings")
          .select("id, title, price, main_category_id, sub_category_id, images")
          .eq("status", "active")
          .ilike("title", `%${query.trim()}%`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error || !data) {
          setResults([]);
          setIsOpen(false);
          return;
        }

        // Group by category
        const grouped: Record<string, { items: SearchResult[]; count: number }> = {};
        data.forEach((item) => {
          const catId = item.main_category_id;
          if (!grouped[catId]) grouped[catId] = { items: [], count: 0 };
          grouped[catId].items.push(item);
          grouped[catId].count++;
        });

        // Also get total counts per category for this search
        const categoryIds = Object.keys(grouped);
        const countPromises = categoryIds.map(async (catId) => {
          const { count } = await supabase
            .from("base_listings")
            .select("id", { count: "exact", head: true })
            .eq("status", "active")
            .eq("main_category_id", catId)
            .ilike("title", `%${query.trim()}%`);
          return { catId, count: count || grouped[catId].count };
        });

        const counts = await Promise.all(countPromises);
        counts.forEach(({ catId, count }) => {
          if (grouped[catId]) grouped[catId].count = count;
        });

        const groupedResults: GroupedResults[] = categoryIds
          .map((catId) => {
            const cat = categories?.find((c) => c.id === catId);
            return {
              categoryName: cat?.name || "Other",
              categorySlug: cat?.slug || "",
              count: grouped[catId].count,
              items: grouped[catId].items.slice(0, 3),
            };
          })
          .sort((a, b) => b.count - a.count);

        setResults(groupedResults);
        setIsOpen(groupedResults.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, categories]);

  const handleSubmit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className={`pl-12 pr-10 h-12 bg-card text-card-foreground border-border text-base ${inputClassName}`}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
          ) : (
            <>
              {results.map((group) => (
                <div key={group.categorySlug} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query.trim())}&category=${group.categorySlug}`);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-semibold text-sm text-foreground">
                      {group.categoryName}
                    </span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {group.count} {group.count === 1 ? "ad" : "ads"}
                    </span>
                  </button>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/listing/${item.id}`);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <img
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt=""
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-xs font-semibold text-primary">{formatPrice(item.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-muted/30 transition-colors"
              >
                See all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AjaxSearch;
