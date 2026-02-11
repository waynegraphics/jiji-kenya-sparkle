import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAffiliateClickTracker } from "@/hooks/useAffiliateClickTracker";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import PostAd from "./pages/PostAd";
import MyAds from "./pages/MyAds";
import EditAd from "./pages/EditAd";
import ProfileSettings from "./pages/ProfileSettings";
import Messages from "./pages/Messages";
import Favorites from "./pages/Favorites";
import SellerProfile from "./pages/SellerProfile";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import CategoryPage from "./pages/CategoryPage";
import VerifiedSellers from "./pages/VerifiedSellers";
import SafetyTips from "./pages/SafetyTips";
import TeamLogin from "./pages/TeamLogin";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import AffiliateApply from "./pages/AffiliateApply";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
function AffiliateTracker() {
  useAffiliateClickTracker();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AffiliateTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/listing/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/my-ads" element={<MyAds />} />
            <Route path="/edit-ad/:id" element={<EditAd />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/seller/:userId" element={<SellerProfile />} />
            
            {/* Team/Admin Portal */}
            <Route path="/apa/login" element={<TeamLogin />} />
            <Route path="/apa/dashboard/*" element={<AdminDashboard />} />
            
            {/* Legacy admin route redirects to new portal */}
            <Route path="/admin/*" element={<Navigate to="/apa/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/apa/dashboard" replace />} />
            
            <Route path="/seller-dashboard/*" element={<SellerDashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout/:type/:id" element={<Checkout />} />
            <Route path="/checkout/:type/:id/:tierId" element={<Checkout />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryPage />} />
            <Route path="/verified-sellers" element={<VerifiedSellers />} />
            <Route path="/safety-tips" element={<SafetyTips />} />
            
            {/* Affiliate */}
            <Route path="/affiliate/apply" element={<AffiliateApply />} />
            <Route path="/affiliate/dashboard/*" element={<AffiliateDashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
