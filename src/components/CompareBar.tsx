import { useNavigate } from "react-router-dom";
import { useCompareStore } from "@/hooks/useCompareStore";
import { Button } from "@/components/ui/button";
import { X, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const CompareBar = () => {
  const { items, removeItem, clearAll } = useCompareStore();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-2xl rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover border" />
            <button
              onClick={() => removeItem(item.id)}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        {Array.from({ length: 3 - items.length }).map((_, i) => (
          <div key={`empty-${i}`} className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30" />
        ))}
      </div>
      <div className="flex items-center gap-2 ml-2">
        <Button size="sm" onClick={() => navigate("/compare")} disabled={items.length < 2}>
          <BarChart3 className="h-4 w-4 mr-1" />Compare ({items.length})
        </Button>
        <Button size="sm" variant="ghost" onClick={clearAll} className="text-muted-foreground">
          Clear
        </Button>
      </div>
    </div>
  );
};

export default CompareBar;
