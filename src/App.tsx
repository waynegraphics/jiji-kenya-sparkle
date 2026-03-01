import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAffiliateClickTracker } from "@/hooks/useAffiliateClickTracker";
import { Loader2 } from "lucide-react";
import CompareBar from "./components/CompareBar";
import MobileBottomNav from "./components/MobileBottomNav";
import ScrollToTop from "./components/ScrollToTop";

// Critical path - load eagerly
import Index from "./pages/Index";

// Lazy load all other pages
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const PostAd = lazy(() => import("./pages/PostAd"));
const MyAds = lazy(() => import("./pages/MyAds"));
const EditAd = lazy(() => import("./pages/EditAd"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const Messages = lazy(() => import("./pages/Messages"));
const Favorites = lazy(() => import("./pages/Favorites"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PricingDetails = lazy(() => import("./pages/PricingDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const VerifiedSellers = lazy(() => import("./pages/VerifiedSellers"));
const SafetyTips = lazy(() => import("./pages/SafetyTips"));
const TeamLogin = lazy(() => import("./pages/TeamLogin"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const AffiliateApply = lazy(() => import("./pages/AffiliateApply"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const FAQs = lazy(() => import("./pages/FAQs"));
const Sellers = lazy(() => import("./pages/Sellers"));
const QuickLinks = lazy(() => import("./pages/QuickLinks"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const CopyrightInfringement = lazy(() => import("./pages/CopyrightInfringement"));
const BillingPolicy = lazy(() => import("./pages/BillingPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const Blog = lazy(() => import("./pages/Blog"));
const Careers = lazy(() => import("./pages/Careers"));
const DataProtection = lazy(() => import("./pages/DataProtection"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes - reduce refetches
      gcTime: 1000 * 60 * 10, // 10 minutes cache
      refetchOnWindowFocus: false, // Don't refetch on tab switch
      retry: 1, // Reduce retries for speed
    },
  },
});

function AffiliateTracker() {
  useAffiliateClickTracker();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <Sonner />
          <BrowserRouter>
          <AffiliateTracker />
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/listing/:category/:slug" element={<ProductDetail />} />
            <Route path="/listing/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/my-ads" element={<MyAds />} />
            <Route path="/edit-ad/:id" element={<EditAd />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/seller/:userId" element={<SellerProfile />} />
            
            {/* Team/Admin Portal */}
            <Route path="/apa/login" element={<TeamLogin />} />
            <Route path="/apa/dashboard/*" element={<AdminDashboard />} />
            
            {/* Legacy admin route redirects to new portal */}
            <Route path="/admin/*" element={<Navigate to="/apa/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/apa/dashboard" replace />} />
            
            <Route path="/seller-dashboard/*" element={<SellerDashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/pricing-details" element={<PricingDetails />} />
            <Route path="/checkout/:type/:id" element={<Checkout />} />
            <Route path="/checkout/:type/:id/:tierId" element={<Checkout />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryPage />} />
            <Route path="/verified-sellers" element={<VerifiedSellers />} />
            <Route path="/safety-tips" element={<SafetyTips />} />
            
            {/* Affiliate */}
            <Route path="/affiliate/apply" element={<AffiliateApply />} />
            <Route path="/affiliate/dashboard/*" element={<AffiliateDashboard />} />
            
            {/* Information Pages */}
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/saved-ads" element={<Navigate to="/favorites" replace />} />
            <Route path="/quick-links" element={<QuickLinks />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/careers" element={<Careers />} />
            
            {/* Legal & Policy Pages */}
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/copyright-infringement" element={<CopyrightInfringement />} />
            <Route path="/billing-policy" element={<BillingPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/data-protection" element={<DataProtection />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <div className="pb-16 lg:pb-0" />
          <MobileBottomNav />
          <CompareBar />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
