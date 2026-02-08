import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  XCircle,
  Zap,
  Users,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  type: 'message' | 'listing' | 'subscription' | 'follower' | 'addon';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

const SellerNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ["unread-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, sender_id")
        .eq("receiver_id", user?.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch recent subscription
  const { data: subscription } = useQuery({
    queryKey: ["recent-subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_subscriptions")
        .select("*, subscription_packages(name)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0];
    },
    enabled: !!user?.id
  });

  // Fetch recent followers
  const { data: recentFollowers } = useQuery({
    queryKey: ["recent-followers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("id, created_at, follower_id")
        .eq("following_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Build notifications list
  useEffect(() => {
    const notifs: Notification[] = [];

    // Message notifications
    unreadMessages?.forEach(msg => {
      notifs.push({
        id: `msg-${msg.id}`,
        type: 'message',
        title: 'New Message',
        description: msg.content.substring(0, 50) + '...',
        timestamp: new Date(msg.created_at),
        isRead: false,
        link: '/messages'
      });
    });

    // Subscription notification
    if (subscription) {
      notifs.push({
        id: `sub-${subscription.id}`,
        type: 'subscription',
        title: subscription.status === 'active' ? 'Subscription Active' : 'Subscription Update',
        description: `Your ${subscription.subscription_packages?.name} plan is ${subscription.status}`,
        timestamp: new Date(subscription.created_at),
        isRead: true
      });
    }

    // Follower notifications
    recentFollowers?.forEach(follow => {
      notifs.push({
        id: `follow-${follow.id}`,
        type: 'follower',
        title: 'New Follower',
        description: 'Someone started following you',
        timestamp: new Date(follow.created_at),
        isRead: true,
        link: '/seller-dashboard/followers'
      });
    });

    // Sort by timestamp
    notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setNotifications(notifs);
  }, [unreadMessages, subscription, recentFollowers]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'listing':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'subscription':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'follower':
        return <Users className="h-5 w-5 text-orange-500" />;
      case 'addon':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">Stay updated on your activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{unreadMessages?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{recentFollowers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">New Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{notifications.filter(n => !n.isRead).length}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                You'll see updates about messages, listings, and more here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    notification.isRead ? 'bg-background' : 'bg-primary/5 border-primary/20'
                  } ${notification.link ? 'hover:bg-muted cursor-pointer' : ''}`}
                  onClick={() => notification.link && (window.location.href = notification.link)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(notification.timestamp, "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerNotifications;