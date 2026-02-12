import logo from "@/assets/logo.png";
import {
  Search, MapPin, Menu, User, ChevronDown, Plus, LogOut,
  MessageCircle, LayoutDashboard, X, Bell, Heart, Settings,
  FileText, Store, ShieldCheck, Grid3X3, Home, HelpCircle, Users,
  Moon, Sun, Bookmark, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useMainCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";
import { useFavoritesCount } from "@/hooks/useFavoritesCount";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const favoritesCount = useFavoritesCount();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const totalBadge = unreadCount + notifCount;
  const { data: categories = [] } = useMainCategories();

  useEffect(() => {
    setMounted(true);
  }, []);

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate("/");
  };

  const isSeller = profile?.account_type === "seller";

  const mobileNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between py-3 gap-2 md:gap-4">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer flex-shrink-0 group"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <img src={logo} alt="APA Bazaar Market" className="h-8 sm:h-10 md:h-12 w-auto transition-transform group-hover:scale-105" />
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium rounded-lg transition-all" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />Home
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium rounded-lg transition-all" onClick={() => navigate("/pricing")}>
                Pricing
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium rounded-lg transition-all" onClick={() => navigate("/about-us")}>
                About Us
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium rounded-lg transition-all" onClick={() => navigate("/contact-us")}>
                Contact Us
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium rounded-lg transition-all" onClick={() => navigate("/faqs")}>
                <HelpCircle className="h-4 w-4 mr-2" />FAQ
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium rounded-lg transition-all" onClick={() => navigate("/verified-sellers")}>
                <Users className="h-4 w-4 mr-2" />Sellers
              </Button>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-primary hover:bg-primary/10 rounded-lg h-9 w-9"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              {/* Mobile SELL button */}
              <Button
                className="lg:hidden relative bg-gradient-to-r from-secondary via-secondary to-secondary/90 text-secondary-foreground font-bold shadow-lg rounded-lg px-3 py-2 text-sm overflow-hidden group"
                onClick={() => user ? navigate("/post-ad") : openAuthModal("register")}
              >
                <Plus className="h-4 w-4 mr-1" />
                SELL
              </Button>

              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 lg:hidden rounded-lg h-9 w-9 relative"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                {user && totalBadge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    {totalBadge > 99 ? "99+" : totalBadge}
                  </span>
                )}
              </Button>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Dark/Light Mode Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground rounded-lg transition-all"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                      {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</p></TooltipContent>
                </Tooltip>

                {loading ? (
                  <div className="w-20 h-10 bg-muted animate-pulse rounded-lg" />
                ) : user ? (
                  <>
                    {/* Favorites Icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground rounded-lg transition-all group" onClick={() => navigate("/favorites")}>
                          <Heart className="h-5 w-5 group-hover:scale-110 transition-all" />
                          {favoritesCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              {favoritesCount > 99 ? "99+" : favoritesCount}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Saved</p></TooltipContent>
                    </Tooltip>

                    {/* Notification Bell */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground rounded-lg transition-all group">
                              <Bell className="h-5 w-5 group-hover:scale-110 transition-all" />
                              {notifCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center animate-pulse shadow-lg">
                                  {notifCount > 99 ? "99+" : notifCount}
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-80 p-0">
                            <div className="flex items-center justify-between p-3 border-b">
                              <h4 className="font-semibold text-sm">Notifications</h4>
                              {notifCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all read</button>
                              )}
                            </div>
                            <ScrollArea className="max-h-72">
                              {notifications.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-8">No notifications yet</p>
                              ) : (
                                notifications.slice(0, 10).map((notif) => (
                                  <div key={notif.id} onClick={() => markAsRead(notif.id)} className={cn("px-3 py-2.5 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors", !notif.is_read && "bg-primary/5")}>
                                    <div className="flex items-start gap-2">
                                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{notif.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent><p>Notifications</p></TooltipContent>
                    </Tooltip>

                    {/* Messages Icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground rounded-lg transition-all group" onClick={() => navigate("/messages")}>
                          <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-all" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Messages</p></TooltipContent>
                    </Tooltip>

                    {/* User Dropdown */}
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-lg transition-all">
                              <Avatar className="h-8 w-8 ring-2 ring-secondary/20 hover:ring-primary/40 transition-all">
                                <AvatarImage src={profile?.avatar_url || ""} />
                                <AvatarFallback className="bg-secondary/10 text-secondary-foreground flex items-center justify-center">
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Account</p></TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end" className="w-64 p-2 bg-background/95 backdrop-blur-md border-2 shadow-xl rounded-xl">
                        <DropdownMenuLabel className="font-normal px-3 py-2 mb-1">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/20 flex-shrink-0">
                              <AvatarImage src={profile?.avatar_url || ""} />
                              <AvatarFallback className="bg-secondary/10 text-secondary-foreground flex items-center justify-center">
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 overflow-hidden">
                              <p className="text-sm font-semibold text-foreground whitespace-normal">{profile?.display_name || "User"}</p>
                              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                                {isSeller ? "Seller Account" : "Customer Account"}
                                {profile?.is_verified && <ShieldCheck className="h-3 w-3 text-primary flex-shrink-0" />}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={() => navigate("/seller-dashboard")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                          <LayoutDashboard className="h-4 w-4 mr-3" /><span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/my-ads")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                          <FileText className="h-4 w-4 mr-3" /><span>My Ads</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/messages")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors justify-between">
                          <span className="flex items-center"><MessageCircle className="h-4 w-4 mr-3" />Messages</span>
                          {unreadCount > 0 && (
                            <Badge className="bg-secondary text-secondary-foreground text-[10px] h-5 min-w-[20px] px-1.5 font-semibold rounded-full">{unreadCount > 99 ? "99+" : unreadCount}</Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/favorites")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors justify-between">
                          <span className="flex items-center"><Heart className="h-4 w-4 mr-3" />Favorites</span>
                          {favoritesCount > 0 && (
                            <Badge className="bg-secondary text-secondary-foreground text-[10px] h-5 min-w-[20px] px-1.5 font-semibold rounded-full">{favoritesCount > 99 ? "99+" : favoritesCount}</Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={() => navigate("/profile")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                          <Settings className="h-4 w-4 mr-3" /><span>Profile Settings</span>
                        </DropdownMenuItem>
                        {!isSeller && (
                          <DropdownMenuItem onClick={() => navigate("/seller-dashboard")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                            <Store className="h-4 w-4 mr-3" /><span>Become a Seller</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={handleSignOut} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive focus:text-destructive">
                          <LogOut className="h-4 w-4 mr-3" /><span>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button variant="ghost" className="text-primary hover:bg-primary/10 font-medium rounded-lg transition-all" onClick={() => openAuthModal("login")}>
                    <User className="h-4 w-4 mr-2" />Login
                  </Button>
                )}

                <Button
                  className="relative bg-gradient-to-r from-secondary via-secondary to-secondary/90 hover:from-secondary/90 hover:via-secondary hover:to-secondary text-secondary-foreground font-bold shadow-lg hover:shadow-xl transition-all rounded-lg px-6 py-2.5 overflow-hidden group"
                  onClick={() => user ? navigate("/post-ad") : openAuthModal("register")}
                >
                  <span className="relative z-10 flex items-center">
                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />SELL
                  </span>
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
        </div>
      </header>

      {/* Mobile Menu - Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <img src={logo} alt="APA Bazaar" className="h-8 w-auto" />
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-1">
              {/* User info */}
              {user && profile && (
                <div className="flex items-center gap-3 p-3 mb-3 bg-muted/50 rounded-xl">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{profile.display_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{isSeller ? "Seller" : "Customer"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {!user && (
                <div className="flex items-center justify-between p-2 mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {mounted && theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                    {mounted && theme === "dark" ? "Light" : "Dark"}
                  </Button>
                </div>
              )}

              {/* Quick Actions for logged-in users */}
              {user && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    className="flex flex-col items-center gap-1 bg-primary text-primary-foreground rounded-xl py-3 px-2 relative active:scale-95 transition-transform"
                    onClick={() => mobileNavigate("/favorites")}
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-[11px] font-medium">Saved</span>
                    {favoritesCount > 0 && (
                      <span className="absolute top-1 right-2 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                        {favoritesCount > 99 ? "99+" : favoritesCount}
                      </span>
                    )}
                  </button>
                  <button
                    className="flex flex-col items-center gap-1 bg-primary text-primary-foreground rounded-xl py-3 px-2 relative active:scale-95 transition-transform"
                    onClick={() => mobileNavigate("/messages")}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-[11px] font-medium">Messages</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-2 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex flex-col items-center gap-1 bg-primary text-primary-foreground rounded-xl py-3 px-2 relative active:scale-95 transition-transform">
                        <Bell className="h-5 w-5" />
                        <span className="text-[11px] font-medium">Alerts</span>
                        {notifCount > 0 && (
                          <span className="absolute top-1 right-2 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                            {notifCount > 99 ? "99+" : notifCount}
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72 p-0">
                      <div className="flex items-center justify-between p-3 border-b">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {notifCount > 0 && <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all read</button>}
                      </div>
                      <ScrollArea className="max-h-60">
                        {notifications.length === 0 ? (
                          <p className="text-center text-muted-foreground text-sm py-6">No notifications</p>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <div key={notif.id} onClick={() => markAsRead(notif.id)} className={cn("px-3 py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50", !notif.is_read && "bg-primary/5")}>
                              <p className="text-sm font-medium truncate">{notif.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Navigate</p>
                {[
                  { icon: Home, label: "Home", path: "/" },
                  { icon: Grid3X3, label: "Pricing", path: "/pricing" },
                  { icon: HelpCircle, label: "About Us", path: "/about-us" },
                  { icon: MessageCircle, label: "Contact Us", path: "/contact-us" },
                  { icon: HelpCircle, label: "FAQ", path: "/faqs" },
                  { icon: Users, label: "Sellers", path: "/verified-sellers" },
                ].map((item) => (
                  <button
                    key={item.path}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 active:bg-muted transition-colors"
                    onClick={() => mobileNavigate(item.path)}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* User Menu Items */}
              {user && (
                <div className="space-y-0.5 pt-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Account</p>
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 active:bg-muted transition-colors" onClick={() => mobileNavigate("/seller-dashboard")}>
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />Dashboard
                  </button>
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 active:bg-muted transition-colors" onClick={() => mobileNavigate("/my-ads")}>
                    <FileText className="h-4 w-4 text-muted-foreground" />My Ads
                  </button>
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 active:bg-muted transition-colors" onClick={() => mobileNavigate("/profile")}>
                    <Settings className="h-4 w-4 text-muted-foreground" />Profile Settings
                  </button>
                </div>
              )}

              {/* Categories - Expandable Section */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Categories</p>
                <button
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 active:bg-muted transition-colors"
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                >
                  <span className="flex items-center gap-3">
                    <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                    Browse All Categories
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isCategoriesOpen && "rotate-180")} />
                </button>
                {isCategoriesOpen && (
                  <div className="ml-4 space-y-0.5 py-1 animate-in slide-in-from-top-2 duration-200">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        onClick={() => mobileNavigate(`/category/${cat.slug}`)}
                      >
                        {cat.name}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Bottom Actions */}
          <div className="p-4 border-t space-y-2">
            {user ? (
              <Button variant="outline" className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </Button>
            ) : (
              <Button className="w-full bg-primary text-primary-foreground" onClick={() => { openAuthModal("login"); setIsMenuOpen(false); }}>
                <User className="h-4 w-4 mr-2" />Login / Register
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Header;
