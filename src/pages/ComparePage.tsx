import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCompareStore } from "@/hooks/useCompareStore";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, BarChart3 } from "lucide-react";

const ComparePage = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearAll } = useCompareStore();
  const [details, setDetails] = useState<Record<string, Record<string, any>>>({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (items.length === 0) return;
      const slug = items[0].categorySlug;
      if (!slug) return;

      const tableMap: Record<string, string> = {
        vehicles: "vehicle_listings", property: "property_listings", jobs: "job_listings",
        electronics: "electronics_listings", "phones-tablets": "phone_listings",
        fashion: "fashion_listings", "furniture-appliances": "furniture_listings",
        "animals-pets": "pet_listings", "babies-kids": "kids_listings",
        "beauty-care": "beauty_listings", services: "service_listings",
        "commercial-equipment": "equipment_listings", "food-agriculture": "agriculture_listings",
        "leisure-activities": "leisure_listings", "repair-construction": "construction_listings",
      };
      const table = tableMap[slug];
      if (!table) return;

      const ids = items.map(i => i.id);
      const { data } = await supabase.from(table as any).select("*").in("id", ids);
      if (data) {
        const map: Record<string, Record<string, any>> = {};
        (data as any[]).forEach(d => { map[d.id] = d; });
        setDetails(map);
      }
    };
    fetchDetails();
  }, [items]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);

  // Collect all unique spec keys
  const allKeys = new Set<string>();
  Object.values(details).forEach(d => {
    Object.keys(d).forEach(k => {
      if (!["id", "created_at"].includes(k)) allKeys.add(k);
    });
  });

  const formatKey = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (Array.isArray(val)) return val.join(", ") || "—";
    return String(val);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Compare Listings</h1>
            <Badge variant="secondary">{items.length}/3</Badge>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No items to compare</h2>
            <p className="text-muted-foreground mb-6">Add up to 3 listings from the same category to compare them side by side</p>
            <Button onClick={() => navigate("/")}>Browse Listings</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Header row with images */}
              <thead>
                <tr>
                  <th className="text-left p-3 bg-muted/50 rounded-tl-xl min-w-[140px] text-sm font-semibold text-muted-foreground">
                    Feature
                  </th>
                  {items.map((item) => (
                    <th key={item.id} className="p-3 bg-muted/50 min-w-[200px] last:rounded-tr-xl">
                      <div className="relative">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                        <p className="text-sm font-semibold line-clamp-2 text-foreground">{item.title}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price row */}
                <tr className="border-b">
                  <td className="p-3 text-sm font-medium text-muted-foreground">Price</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-3 text-sm font-bold text-primary">{formatPrice(item.price)}</td>
                  ))}
                </tr>
                {/* Location row */}
                <tr className="border-b bg-muted/20">
                  <td className="p-3 text-sm font-medium text-muted-foreground">Location</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-3 text-sm">{item.location}</td>
                  ))}
                </tr>
                {/* Spec rows */}
                {Array.from(allKeys).map((key, idx) => (
                  <tr key={key} className={`border-b ${idx % 2 === 0 ? "" : "bg-muted/20"}`}>
                    <td className="p-3 text-sm font-medium text-muted-foreground">{formatKey(key)}</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-3 text-sm">{formatValue(details[item.id]?.[key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ComparePage;
