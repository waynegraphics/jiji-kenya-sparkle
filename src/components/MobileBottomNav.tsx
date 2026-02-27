import { Home, Heart, PlusCircle, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useFavoritesCount } from "@/hooks/useFavoritesCount";
import { cn } from "@/lib/utils";
import { useState } from "react";
import AuthModal from "./AuthModal";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const unreadCount = useUnreadMessages();
  const favoritesCount = useFavoritesCount();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleNav = (path: string, requiresAuth = false) => {
    if (requiresAuth && !user) {
      openAuthModal("login");
      return;
    }
    navigate(path);
  };

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      active: pathname === "/",
      badge: 0,
    },
    {
      icon: Heart,
      label: "Saved",
      path: "/favorites",
      active: pathname === "/favorites",
      badge: favoritesCount,
      requiresAuth: true,
    },
    {
      icon: PlusCircle,
      label: "Sell",
      path: "/seller-dashboard/post-ad",
      active: pathname.includes("post-ad"),
      badge: 0,
      isSell: true,
      requiresAuth: true,
    },
    {
      icon: MessageCircle,
      label: "Messages",
      path: "/seller-dashboard/messages",
      active: pathname.includes("messages"),
      badge: unreadCount,
      requiresAuth: true,
    },
    {
      icon: User,
      label: "Profile",
      path: "/seller-dashboard",
      active: pathname.startsWith("/seller-dashboard") && !pathname.includes("messages") && !pathname.includes("post-ad"),
      badge: 0,
      requiresAuth: true,
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.path, item.requiresAuth)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors relative min-w-[56px]",
                item.isSell
                  ? "text-secondary"
                  : item.active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    item.isSell && "h-7 w-7",
                    item.active && "scale-110"
                  )}
                  strokeWidth={item.active ? 2.5 : 2}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  item.active ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default MobileBottomNav;
