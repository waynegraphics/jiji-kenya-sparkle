import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedListings from "@/components/FeaturedListings";
import SuperchargeSearch from "@/components/SuperchargeSearch";
import SubmitAdCTA from "@/components/SubmitAdCTA";
import Footer from "@/components/Footer";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <CategoryGrid />
        <FeaturedListings />
        <SuperchargeSearch />
        <SubmitAdCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
