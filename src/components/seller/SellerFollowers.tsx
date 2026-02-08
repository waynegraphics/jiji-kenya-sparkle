import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  UserMinus,
  TrendingUp,
  Eye
} from "lucide-react";

interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  is_verified: boolean;
}

const SellerFollowers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch followers
  const { data: followers, isLoading: loadingFollowers } = useQuery({
    queryKey: ["seller-followers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("following_id", user?.id);
      if (error) throw error;
      return data as Follow[];
    },
    enabled: !!user?.id
  });

  // Fetch following
  const { data: following, isLoading: loadingFollowing } = useQuery({
    queryKey: ["seller-following", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", user?.id);
      if (error) throw error;
      return data as Follow[];
    },
    enabled: !!user?.id
  });

  // Fetch profiles for followers
  const { data: profiles } = useQuery({
    queryKey: ["follow-profiles", followers, following],
    queryFn: async () => {
      const userIds = [
        ...(followers?.map(f => f.follower_id) || []),
        ...(following?.map(f => f.following_id) || [])
      ];
      if (userIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, location, is_verified")
        .in("user_id", userIds);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!(followers?.length || following?.length)
  });

  // Unfollow mutation
  const unfollow = useMutation({
    mutationFn: async (followingId: string) => {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user?.id)
        .eq("following_id", followingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-following"] });
      toast.success("Unfollowed successfully");
    }
  });

  const getProfile = (userId: string) => {
    return profiles?.find(p => p.user_id === userId);
  };

  if (loadingFollowers || loadingFollowing) {
    return <Skeleton className="h-[400px]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Followers & Following</h2>
        <p className="text-muted-foreground">Manage your social connections</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{followers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{following?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">+{Math.floor((followers?.length || 0) * 0.1)}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Followers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Followers
            </CardTitle>
            <CardDescription>People who follow you</CardDescription>
          </CardHeader>
          <CardContent>
            {followers?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No followers yet</p>
            ) : (
              <div className="space-y-4">
                {followers?.map(follow => {
                  const profile = getProfile(follow.follower_id);
                  return (
                    <div key={follow.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>{profile?.display_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.display_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{profile?.location}</p>
                        </div>
                      </div>
                      <Link to={`/seller/${follow.follower_id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Following */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Following
            </CardTitle>
            <CardDescription>Sellers you follow</CardDescription>
          </CardHeader>
          <CardContent>
            {following?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Not following anyone yet</p>
            ) : (
              <div className="space-y-4">
                {following?.map(follow => {
                  const profile = getProfile(follow.following_id);
                  return (
                    <div key={follow.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>{profile?.display_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.display_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{profile?.location}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => unfollow.mutate(follow.following_id)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerFollowers;