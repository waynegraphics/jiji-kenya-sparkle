import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, FileText, ShieldCheck, MessageSquare, Flag, Users, Briefcase, Package, Star, Heart, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, React.ElementType> = {
  listing: FileText,
  verification: ShieldCheck,
  verification_update: ShieldCheck,
  support: MessageSquare,
  report: Flag,
  career: Briefcase,
  message: MessageSquare,
  follower: Users,
  subscription: Package,
  review: Star,
  favorite: Heart,
};

const AdminNotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications-db", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    },
    refetchInterval: 15000,
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const getLink = (n: any) => {
    switch (n.type) {
      case 'listing': return "/apa/dashboard/listings";
      case 'verification':
      case 'verification_update': return "/apa/dashboard/verifications";
      case 'support': return n.related_type === 'contact' ? `/apa/dashboard/support?tab=contacts&contactId=${n.related_id}` : n.related_type === 'ticket' ? "/apa/dashboard/support" : "/apa/dashboard/support";
      case 'report': return "/apa/dashboard/reports";
      case 'message': return "/messages";
      case 'follower': return "/apa/dashboard/users";
      case 'subscription': return "/apa/dashboard/users";
      case 'review': return "/apa/dashboard/users";
      default: return "/apa/dashboard";
    }
  };

  const handleClick = async (n: any) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      queryClient.invalidateQueries({ queryKey: ["admin-notifications-db"] });
    }
    setOpen(false);
    navigate(getLink(n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications-db"] });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative px-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] bg-destructive text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Notifications</h3>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs gap-1">
              <CheckCheck className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">All caught up! 🎉</div>
          ) : (
            <div className="divide-y">
              {notifications.map((item: any) => {
                const Icon = iconMap[item.type] || Bell;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item)}
                    className={`w-full flex items-start gap-3 p-3 hover:bg-muted/50 text-left transition-colors ${!item.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        {!item.is_read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationCenter;
