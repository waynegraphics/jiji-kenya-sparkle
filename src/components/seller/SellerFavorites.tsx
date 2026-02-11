import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Heart, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SellerFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("*, listing:listings(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFavorites(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchFavorites(); }, [user]);

  const removeFavorite = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites(prev => prev.filter(f => f.id !== id));
    toast.success("Removed from favorites");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Favorites</h2>
      {favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">Browse listings and save your favorites!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <Card key={fav.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                <div className="w-32 h-28 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/listing/${fav.listing?.id}`)}>
                  <img src={fav.listing?.images?.[0] || "/placeholder.svg"} alt={fav.listing?.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1 cursor-pointer hover:text-primary" onClick={() => navigate(`/listing/${fav.listing?.id}`)}>
                      {fav.listing?.title}
                    </h4>
                    <p className="text-primary font-bold text-sm mt-1">KES {fav.listing?.price?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{fav.listing?.location}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="self-end text-destructive" onClick={() => removeFavorite(fav.id)}>
                    <Trash2 className="h-3 w-3 mr-1" />Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerFavorites;
