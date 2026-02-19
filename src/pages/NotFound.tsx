import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-black text-primary/20 mb-4">404</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link to="/">
              <Button className="w-full sm:w-auto gap-2">
                <Home className="h-4 w-4" /> Go Home
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Search className="h-4 w-4" /> Search Listings
              </Button>
            </Link>
          </div>
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-3">Popular categories</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { name: "Vehicles", slug: "vehicles" },
                { name: "Property", slug: "property" },
                { name: "Phones", slug: "phones-tablets" },
                { name: "Electronics", slug: "electronics" },
                { name: "Fashion", slug: "fashion" },
                { name: "Jobs", slug: "jobs" },
              ].map((cat) => (
                <Link key={cat.slug} to={`/category/${cat.slug}`}>
                  <Button variant="secondary" size="sm" className="text-xs">
                    {cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
