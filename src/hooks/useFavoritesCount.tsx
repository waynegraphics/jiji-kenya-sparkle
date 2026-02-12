import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useFavoritesCount = () => {
  const { user } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setFavoritesCount(0);
      return;
    }

    const fetchFavoritesCount = async () => {
      const { count } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setFavoritesCount(count || 0);
    };

    fetchFavoritesCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("favorites-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchFavoritesCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return favoritesCount;
};
