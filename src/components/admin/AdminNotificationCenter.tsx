import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, FileText, ShieldCheck, MessageSquare, Flag, Users, Briefcase } from "lucide-react";
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

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  link: string;
}

const AdminNotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications-feed"],
    queryFn: async () => {
      const items: NotificationItem[] = [];

      const [
        { data: recentListings },
        { data: recentVerifications },
        { data: recentSupport },
        { data: recentReports },
        { data: recentApplications },
      ] = await Promise.all([
        supabase.from("base_listings").select("id, title, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
        supabase.from("seller_verifications").select("id, created_at, user_id").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_submissions").select("id, name, subject, created_at").eq("status", "new").order("created_at", { ascending: false }).limit(5),
        supabase.from("reports").select("id, reason, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
        supabase.from("career_applications").select("id, full_name, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(3),
      ]);

      recentListings?.forEach((l) =>
        items.push({
          id: `listing-${l.id}`,
          type: "listing",
          title: "New listing pending review",
          description: l.title,
          time: l.created_at,
          icon: FileText,
          link: "/apa/dashboard/listings",
        })
      );

      recentVerifications?.forEach((v) =>
        items.push({
          id: `verif-${v.id}`,
          type: "verification",
          title: "Verification request",
          description: "A seller needs identity verification",
          time: v.created_at,
          icon: ShieldCheck,
          link: "/apa/dashboard/verifications",
        })
      );

      recentSupport?.forEach((s) =>
        items.push({
          id: `support-${s.id}`,
          type: "support",
          title: "Support message",
          description: `${s.name}: ${s.subject}`,
          time: s.created_at,
          icon: MessageSquare,
          link: `/apa/dashboard/support?tab=contacts&contactId=${s.id}`,
        })
      );

      recentReports?.forEach((r) =>
        items.push({
          id: `report-${r.id}`,
          type: "report",
          title: "New report",
          description: r.reason,
          time: r.created_at,
          icon: Flag,
          link: "/apa/dashboard/reports",
        })
      );

      recentApplications?.forEach((a) =>
        items.push({
          id: `career-${a.id}`,
          type: "career",
          title: "Job application",
          description: a.full_name,
          time: a.created_at,
          icon: Briefcase,
          link: "/apa/dashboard/careers",
        })
      );

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items.slice(0, 20);
    },
    refetchInterval: 30000,
  });

  const totalCount = notifications.length;

  const handleClick = (link: string) => {
    setOpen(false);
    navigate(link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative px-2">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] bg-destructive text-destructive-foreground">
              {totalCount > 99 ? "99+" : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <p className="text-xs text-muted-foreground">{totalCount} items need attention</p>
        </div>
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">All caught up! 🎉</div>
          ) : (
            <div className="divide-y">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.link)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 text-left transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationCenter;
