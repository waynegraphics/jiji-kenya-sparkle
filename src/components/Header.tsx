import { Search, MapPin, Menu, User, ChevronDown, Plus, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Badge } from "@/components/ui/badge";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadMessages();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
      <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
        <div className="container mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="text-2xl md:text-3xl font-extrabold text-primary-foreground tracking-tight">
                jiji
              </div>
              <span className="hidden md:inline text-xs text-primary-foreground/80 font-medium">
                KENYA
              </span>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="I am looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-4 py-2 h-11 bg-card text-card-foreground border-0 focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              <Button
                variant="default"
                onClick={handleSearch}
                className="h-11 px-6 bg-secondary hover:bg-jiji-orange-hover text-secondary-foreground font-semibold"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Location Selector */}
            <div className="hidden lg:flex items-center gap-1 text-primary-foreground cursor-pointer hover:opacity-80 transition-opacity">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Nairobi</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-jiji-green-dark lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden lg:flex items-center gap-3">
                {loading ? (
                  <div className="w-20 h-10 bg-jiji-green-dark/50 animate-pulse rounded" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-primary-foreground hover:bg-jiji-green-dark font-medium gap-2"
                      >
                        <User className="h-4 w-4" />
                        {profile?.display_name || "Account"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate("/my-ads")}>
                        My Ads
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/messages")}>
                        Messages
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
                    className="text-primary-foreground hover:bg-jiji-green-dark font-medium"
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
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="I am looking for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 py-2 h-10 bg-card text-card-foreground border-0"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden pb-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Nairobi
                </Button>
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
                      onClick={() => { navigate("/my-ads"); setIsMenuOpen(false); }}
                    >
                      My Ads
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
                      onClick={() => { navigate("/messages"); setIsMenuOpen(false); }}
                    >
                      Messages
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
                      onClick={() => { navigate("/favorites"); setIsMenuOpen(false); }}
                    >
                      Favorites
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
                      onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
                    >
                      Profile Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
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