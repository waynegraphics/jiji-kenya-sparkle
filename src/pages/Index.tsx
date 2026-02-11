import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedListings from "@/components/FeaturedListings";
import SuperchargeSearch from "@/components/SuperchargeSearch";
import Footer from "@/components/Footer";
import { useAffiliateClickTracker } from "@/hooks/useAffiliateClickTracker";

const Index = () => {
  useAffiliateClickTracker();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <CategoryGrid />
        <FeaturedListings />
        <SuperchargeSearch />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
