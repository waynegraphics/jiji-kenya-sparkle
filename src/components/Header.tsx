import logo from "@/assets/logo.png";
import {
  Search, MapPin, Menu, User, ChevronDown, Plus, LogOut,
  MessageCircle, LayoutDashboard, X, Bell, Heart, Settings,
  FileText, Store, ShieldCheck, Grid3X3, Home, HelpCircle, Users,
  Moon, Sun, Bookmark, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, forwardRef } from "react";
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

const Header = forwardRef<HTMLDivElement, HeaderProps>(({ onSearch }, ref) => {
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
      <header ref={ref} className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 relative">
          <div className="flex items-center justify-between py-3 gap-2 md:gap-4">
            {/* Mobile/Tablet: Hamburger on LEFT */}
            <div className="flex items-center gap-1 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 rounded-lg h-9 w-9 relative"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                {user && totalBadge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    {totalBadge > 99 ? "99+" : totalBadge}
                  </span>
                )}
              </Button>
            </div>

            {/* Desktop: Logo on LEFT */}
            <div
              className="cursor-pointer flex-shrink-0 group hidden lg:flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="APA Bazaar Market" className="h-12 w-auto transition-transform group-hover:scale-105" />
            </div>

            {/* Mobile/Tablet: Logo CENTERED via absolute positioning */}
            <div
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer flex-shrink-0 group lg:hidden"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="APA Bazaar Market" className="h-8 sm:h-10 w-auto transition-transform group-hover:scale-105" />
            </div>

            {/* Desktop: Navigation Links CENTER */}
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
                onClick={() => user ? navigate("/seller-dashboard/post-ad") : openAuthModal("register")}
              >
                <Plus className="h-4 w-4 mr-1" />
                SELL
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
                        <Button variant="ghost" size="icon" className="relative bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground rounded-lg transition-all group" onClick={() => navigate("/seller-dashboard/messages")}>
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
                         <DropdownMenuItem onClick={() => navigate("/seller-dashboard/messages")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors justify-between">
                          <span className="flex items-center"><MessageCircle className="h-4 w-4 mr-3" />Messages</span>
                          {unreadCount > 0 && (
                            <Badge className="bg-secondary text-secondary-foreground text-[10px] h-5 min-w-[20px] px-1.5 font-semibold rounded-full">{unreadCount > 99 ? "99+" : unreadCount}</Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/favorites")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors justify-between">
                          <span className="flex items-center"><Heart className="h-4 w-4 mr-3" />Favorites</span>
                          {favoritesCount > 0 && (
                            <Badge className="bg-secondary text-secondary-foreground text-[10px] h-5 min-w-[20px] px-1.5 font-semibold rounded-full">{favoritesCount}</Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/profile-settings")} className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                          <Settings className="h-4 w-4 mr-3" /><span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={handleSignOut} className="px-3 py-2.5 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <LogOut className="h-4 w-4 mr-3" /><span>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sell Button */}
                    <Button
                      className="relative bg-gradient-to-r from-secondary via-secondary to-secondary/90 text-secondary-foreground font-bold shadow-lg rounded-lg px-5 py-2.5 text-sm overflow-hidden group"
                      onClick={() => navigate("/seller-dashboard/post-ad")}
                    >
                      <Plus className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform duration-300" />
                      SELL
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => openAuthModal("login")} className="rounded-lg font-medium border-primary/30 hover:border-primary hover:bg-primary/5 text-foreground">
                      Sign In
                    </Button>
                    <Button onClick={() => openAuthModal("register")} className="relative bg-gradient-to-r from-secondary via-secondary to-secondary/90 text-secondary-foreground font-bold shadow-lg rounded-lg px-5 py-2.5 text-sm overflow-hidden group">
                      <Plus className="h-4 w-4 mr-1.5" />
                      SELL
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile search overlay */}
          {isMobileSearchOpen && (
            <div className="md:hidden py-2 pb-3 animate-in slide-in-from-top-2 duration-200">
              <AjaxSearch inputClassName="h-10 rounded-lg" />
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile Side Navigation Sheet ── */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 overflow-y-auto">
          <SheetHeader className="p-4 pb-3 border-b border-border">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex items-center gap-3" onClick={() => mobileNavigate("/")}>
              <img src={logo} alt="APA Bazaar" className="h-8 w-auto cursor-pointer" />
            </div>
          </SheetHeader>

          <div className="flex flex-col">
            {/* User section */}
            {user ? (
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary"><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{profile?.display_name || "User"}</p>
                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                      {isSeller ? "Seller" : "Customer"}
                      {profile?.is_verified && <ShieldCheck className="h-3 w-3 text-primary" />}
                    </p>
                  </div>
                  {/* Dark mode toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-border space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Welcome to APA Bazaar</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-lg text-sm" onClick={() => { setIsMenuOpen(false); openAuthModal("login"); }}>
                    Sign In
                  </Button>
                  <Button className="flex-1 rounded-lg text-sm bg-secondary text-secondary-foreground" onClick={() => { setIsMenuOpen(false); openAuthModal("register"); }}>
                    Register
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {user && (
              <div className="grid grid-cols-3 gap-1 p-3 border-b border-border">
                <button onClick={() => mobileNavigate("/favorites")} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors relative">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Saved</span>
                  {favoritesCount > 0 && (
                    <span className="absolute top-1 right-2 h-4 min-w-[16px] px-1 text-[9px] font-bold bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                      {favoritesCount > 99 ? "99+" : favoritesCount}
                    </span>
                  )}
                </button>
                <button onClick={() => mobileNavigate("/seller-dashboard/messages")} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors relative">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Messages</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-2 h-4 min-w-[16px] px-1 text-[9px] font-bold bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                <button onClick={() => mobileNavigate("/seller-dashboard?tab=notifications")} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Alerts</span>
                  {notifCount > 0 && (
                    <span className="absolute top-1 right-2 h-4 min-w-[16px] px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Main Navigation */}
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Navigate</p>
              <button onClick={() => mobileNavigate("/")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                <Home className="h-4 w-4 text-primary" />Home
              </button>

              {/* Categories Accordion */}
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-3"><Grid3X3 className="h-4 w-4 text-primary" />Categories</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isCategoriesOpen && "rotate-180")} />
              </button>
              {isCategoriesOpen && (
                <div className="bg-muted/20 py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => mobileNavigate(`/category/${cat.slug}`)}
                      className="flex items-center gap-3 w-full px-8 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <ChevronRight className="h-3 w-3" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => mobileNavigate("/pricing")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                <Store className="h-4 w-4 text-primary" />Pricing
              </button>
              <button onClick={() => mobileNavigate("/about-us")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                <ShieldCheck className="h-4 w-4 text-primary" />About Us
              </button>
              <button onClick={() => mobileNavigate("/contact-us")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                <MessageCircle className="h-4 w-4 text-primary" />Contact Us
              </button>
              <button onClick={() => mobileNavigate("/faqs")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                <HelpCircle className="h-4 w-4 text-primary" />FAQ
              </button>
              <button onClick={() => mobileNavigate("/verified-sellers")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                <Users className="h-4 w-4 text-primary" />Sellers
              </button>
              <button onClick={() => mobileNavigate("/blog")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                <FileText className="h-4 w-4 text-primary" />Blog
              </button>
            </div>

            {/* Account section */}
            {user && (
              <div className="py-2 border-t border-border">
                <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                <button onClick={() => mobileNavigate("/seller-dashboard")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                  <LayoutDashboard className="h-4 w-4 text-primary" />Dashboard
                </button>
                <button onClick={() => mobileNavigate("/my-ads")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                  <FileText className="h-4 w-4 text-primary" />My Ads
                </button>
                <button onClick={() => mobileNavigate("/profile-settings")} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
                  <Settings className="h-4 w-4 text-primary" />Settings
                </button>
                <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </div>
            )}

            {/* Post Ad CTA */}
            <div className="p-4 border-t border-border mt-auto">
              <Button
                className="w-full bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground font-bold rounded-lg"
                onClick={() => { setIsMenuOpen(false); user ? navigate("/seller-dashboard/post-ad") : openAuthModal("register"); }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Free Ad
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultTab={authModalTab} />
    </>
  );
});

Header.displayName = "Header";

export default Header;
