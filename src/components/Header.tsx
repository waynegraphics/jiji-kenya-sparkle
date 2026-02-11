import logo from "@/assets/logo.png";
import { Search, MapPin, Menu, User, ChevronDown, Plus, LogOut, MessageCircle, LayoutDashboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Badge } from "@/components/ui/badge";
import AjaxSearch from "./AjaxSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadMessages();

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
        <div className="container mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="APA Bazaar Market" className="h-10 md:h-12 w-auto" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
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

              {/* Location Selector */}
              <div className="hidden lg:flex items-center gap-1 text-primary cursor-pointer hover:opacity-80 transition-opacity">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Nairobi</span>
                <ChevronDown className="h-4 w-4" />
              </div>

              <div className="hidden lg:flex items-center gap-3">
                {loading ? (
                  <div className="w-20 h-10 bg-muted animate-pulse rounded" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary/10 font-medium gap-2"
                      >
                        <User className="h-4 w-4" />
                        {profile?.display_name || "Account"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate("/seller-dashboard")}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/my-ads")}>
                        My Ads
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/messages")} className="flex items-center justify-between">
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Messages
                        </span>
                        {unreadCount > 0 && (
                          <Badge className="bg-destructive text-destructive-foreground text-xs h-5 min-w-[20px] flex items-center justify-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/favorites")}>
                        Favorites
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start text-primary hover:bg-primary/10"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Nairobi
                </Button>
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/seller-dashboard"); setIsMenuOpen(false); }}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/my-ads"); setIsMenuOpen(false); }}
                    >
                      My Ads
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary hover:bg-primary/10 w-full"
                      onClick={() => { navigate("/messages"); setIsMenuOpen(false); }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge className="ml-auto bg-destructive text-destructive-foreground text-xs h-5 min-w-[20px] flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/favorites"); setIsMenuOpen(false); }}
                    >
                      Favorites
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary hover:bg-primary/10"
                      onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
                    >
                      Profile Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary hover:bg-primary/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="justify-start text-primary hover:bg-primary/10"
                    onClick={() => { openAuthModal("login"); setIsMenuOpen(false); }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
                <Button
                  className="bg-secondary hover:bg-jiji-orange-hover text-secondary-foreground font-semibold"
                  onClick={() => {
                    if (user) {
                      navigate("/post-ad");
                    } else {
                      openAuthModal("register");
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  SELL
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
