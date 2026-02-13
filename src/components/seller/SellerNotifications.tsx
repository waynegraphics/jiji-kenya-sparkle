import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Bell,
  MessageSquare,
  FileText,
  Zap,
  Users,
  Package,
  CheckCheck,
  Star,
  Heart,
  Flag,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SellerNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  // Auto-mark all notifications as read when the page is opened
  useEffect(() => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, []);

  const getIcon = (type: string) => {
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
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'favorite':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'support':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case 'report':
        return <Flag className="h-5 w-5 text-destructive" />;
      case 'verification':
      case 'verification_update':
        return <ShieldCheck className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.related_type === 'message') {
      navigate('/messages');
    } else if (notification.related_type === 'listing' && notification.related_id) {
      navigate(`/listing/${notification.related_id}`);
    } else if (notification.related_type === 'follower') {
      navigate('/seller-dashboard/followers');
    } else if (notification.related_type === 'verification' || notification.type === 'verification_update') {
      navigate('/seller-dashboard/settings');
    } else if (notification.related_type === 'subscription') {
      navigate('/seller-dashboard/subscription');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">Stay updated on your activity</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'message' && !n.is_read).length}
                </p>
                <p className="text-sm text-muted-foreground">New Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'follower').length}
                </p>
                <p className="text-sm text-muted-foreground">Follower Alerts</p>
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
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted ${
                    notification.is_read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notification.created_at), "MMM dd, yyyy 'at' HH:mm")}
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
