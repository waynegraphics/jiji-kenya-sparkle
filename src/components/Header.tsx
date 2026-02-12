import logo from "@/assets/logo.png";
import {
  Search, MapPin, Menu, User, ChevronDown, Plus, LogOut,
  MessageCircle, LayoutDashboard, X, Bell, Heart, Settings,
  FileText, Store, ShieldCheck, Grid3X3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMainCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import AjaxSearch from "./AjaxSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadMessages();
  const { notifications, unreadCount: notifCount, markAsRead, markAllAsRead } = useNotifications();

  const totalBadge = unreadCount + notifCount;
  const { data: categories = [] } = useMainCategories();

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isSeller = profile?.account_type === "seller";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="APA Bazaar Market" className="h-10 md:h-12 w-auto" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-primary hover:bg-primary/10"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden lg:flex items-center gap-2">
                {loading ? (
                  <div className="w-20 h-10 bg-muted animate-pulse rounded" />
                ) : user ? (
                  <>
                    {/* Notification Bell */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-primary hover:bg-primary/10">
                          <Bell className="h-5 w-5" />
                          {notifCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                              {notifCount > 9 ? "9+" : notifCount}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80 p-0">
                        <div className="flex items-center justify-between p-3 border-b">
                          <h4 className="font-semibold text-sm">Notifications</h4>
                          {notifCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <ScrollArea className="max-h-72">
                          {notifications.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm py-8">No notifications yet</p>
                          ) : (
                            notifications.slice(0, 10).map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`px-3 py-2.5 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                                  !notif.is_read ? "bg-primary/5" : ""
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>

                    {/* Messages */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-primary hover:bg-primary/10"
                      onClick={() => navigate("/messages")}
                    >
                      <MessageCircle className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>

                    {/* User Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 px-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden xl:inline font-medium text-sm max-w-[100px] truncate">
                            {profile?.display_name || "Account"}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold">{profile?.display_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {isSeller ? "Seller Account" : "Customer Account"}
                              {profile?.is_verified && (
                                <ShieldCheck className="inline h-3 w-3 ml-1 text-primary" />
                              )}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => navigate("/seller-dashboard")}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate("/my-ads")}>
                          <FileText className="h-4 w-4 mr-2" />
                          My Ads
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate("/messages")} className="justify-between">
                          <span className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Messages
                          </span>
                          {unreadCount > 0 && (
                            <Badge className="bg-secondary text-secondary-foreground text-[10px] h-5 min-w-[20px]">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate("/favorites")}>
                          <Heart className="h-4 w-4 mr-2" />
                          Favorites
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => navigate("/profile")}>
                          <Settings className="h-4 w-4 mr-2" />
                          Profile Settings
                        </DropdownMenuItem>

                        {!isSeller && (
                          <DropdownMenuItem onClick={() => {
                            // Navigate to become seller
                            navigate("/seller-dashboard");
                          }}>
                            <Store className="h-4 w-4 mr-2" />
                            Become a Seller
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-primary hover:bg-primary/10 font-medium"
                    onClick={() => openAuthModal("login")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/10 font-medium hidden xl:inline-flex"
                  onClick={() => navigate("/pricing")}
                >
                  Pricing
                </Button>

                <Button
                  className="bg-secondary hover:bg-jiji-orange-hover text-secondary-foreground font-semibold"
                  onClick={() => user ? navigate("/post-ad") : openAuthModal("register")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  SELL
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          {isMobileSearchOpen && (
            <div className="md:hidden pb-3 animate-fade-in">
              <AjaxSearch inputClassName="h-10" />
            </div>
          )}

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden pb-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                {user ? (
                  <>
                    {/* User info */}
                    <div className="flex items-center gap-3 p-3 mb-2 bg-muted/50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{profile?.display_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {isSeller ? "Seller" : "Customer"}
                        </p>
                      </div>
                    </div>

                    <Button variant="ghost" className="justify-between text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/seller-dashboard"); setIsMenuOpen(false); }}>
                      <span className="flex items-center"><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</span>
                    </Button>

                    <Button variant="ghost" className="justify-between text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/my-ads"); setIsMenuOpen(false); }}>
                      <span className="flex items-center"><FileText className="h-4 w-4 mr-2" />My Ads</span>
                    </Button>

                    <Button variant="ghost" className="justify-between text-primary hover:bg-primary/10 w-full"
                      onClick={() => { navigate("/messages"); setIsMenuOpen(false); }}>
                      <span className="flex items-center"><MessageCircle className="h-4 w-4 mr-2" />Messages</span>
                      {unreadCount > 0 && (
                        <Badge className="bg-secondary text-secondary-foreground text-xs h-5 min-w-[20px]">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </Button>

                    <Button variant="ghost" className="justify-start text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/favorites"); setIsMenuOpen(false); }}>
                      <Heart className="h-4 w-4 mr-2" />Favorites
                    </Button>

                    <Button variant="ghost" className="justify-start text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>
                      <Settings className="h-4 w-4 mr-2" />Profile Settings
                    </Button>

                    <div className="border-t my-1" />

                    <Button variant="ghost" className="justify-start text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="justify-start text-primary hover:bg-primary/10"
                    onClick={() => { openAuthModal("login"); setIsMenuOpen(false); }}>
                    <User className="h-4 w-4 mr-2" />Login
                  </Button>
                )}

                {/* Categories Dropdown */}
                <div className="border-t my-1" />
                <Button
                  variant="ghost"
                  className="justify-between text-primary hover:bg-primary/10 w-full"
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                >
                  <span className="flex items-center"><Grid3X3 className="h-4 w-4 mr-2" />Categories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`} />
                </Button>
                {isCategoriesOpen && (
                  <div className="pl-6 space-y-0.5 pb-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-muted-foreground hover:text-primary hover:bg-primary/5 w-full text-sm h-8"
                        onClick={() => { navigate(`/category/${cat.slug}`); setIsMenuOpen(false); setIsCategoriesOpen(false); }}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                )}

                <Button
                  className="bg-secondary hover:bg-jiji-orange-hover text-secondary-foreground font-semibold mt-2"
                  onClick={() => {
                    if (user) navigate("/post-ad");
                    else openAuthModal("register");
                    setIsMenuOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />SELL
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Header;
