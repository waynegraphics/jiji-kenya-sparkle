import { Search, MapPin, Menu, User, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
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
                className="pl-10 pr-4 py-2 h-11 bg-card text-card-foreground border-0 focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <Button
              variant="default"
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
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-jiji-green-dark font-medium"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button className="bg-secondary hover:bg-jiji-orange-hover text-secondary-foreground font-semibold">
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
              <Button
                variant="ghost"
                className="justify-start text-primary-foreground hover:bg-jiji-green-dark"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button className="bg-secondary hover:bg-jiji-orange-hover text-secondary-foreground font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                SELL
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;