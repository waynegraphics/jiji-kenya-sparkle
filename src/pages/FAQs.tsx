import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HelpCircle, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQs = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const faqCategories = [
    {
      id: "general",
      title: "General Questions about APA Bazaar",
      questions: [
        {
          q: "What is APA Bazaar?",
          a: "APA Bazaar is Kenya's premier online classifieds marketplace where you can buy and sell a wide variety of items including vehicles, electronics, property, fashion, furniture, phones, and much more. We connect buyers and sellers across Kenya in a safe, user-friendly platform.",
        },
        {
          q: "Where is APA Bazaar based?",
          a: "APA Bazaar is based in Kenya and serves customers throughout the country. Our platform is designed specifically for the Kenyan market, with support for local payment methods like M-Pesa and location-based services.",
        },
        {
          q: "Is APA Bazaar free to use?",
          a: "Yes! APA Bazaar is free to use for both buyers and sellers. You can browse listings, create an account, post basic ads, and contact sellers at no cost. We offer optional premium features like promoted ads, featured listings, and subscription packages for sellers who want increased visibility.",
        },
        {
          q: "What categories are available on APA Bazaar?",
          a: "APA Bazaar offers a comprehensive range of categories including Vehicles (cars, motorcycles, parts), Electronics, Phones & Tablets, Fashion & Accessories, Furniture & Appliances, Property (rentals, sales), Jobs, Services, Animals & Pets, Babies & Kids, Beauty & Personal Care, Food & Agriculture, Commercial Equipment, Leisure & Activities, Repair & Construction, and many more.",
        },
        {
          q: "How can I download the APA Bazaar app?",
          a: "Currently, APA Bazaar is available as a web application that works seamlessly on all devices including smartphones, tablets, and computers. You can access it through any web browser. We're working on native mobile apps for iOS and Android, which will be available soon. Stay tuned for updates!",
        },
      ],
    },
    {
      id: "account",
      title: "Account and Registration",
      questions: [
        {
          q: "How do I create an account on APA Bazaar?",
          a: "Creating an account is easy! Click on the 'Login' or 'Sign Up' button in the top right corner of the website. You'll need to provide your email address, create a password, and optionally add your phone number. Once registered, you can start posting ads or browsing listings immediately.",
        },
        {
          q: "Can I sign up using my Facebook or Google account?",
          a: "Yes! APA Bazaar supports social media login options including Facebook and Google. Simply click on the social login buttons during registration to quickly create your account using your existing social media credentials. This makes the signup process faster and more convenient.",
        },
        {
          q: "What if I forgot my password?",
          a: "If you've forgotten your password, click on 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a password reset link. Click the link in the email to create a new password. Make sure to check your spam folder if you don't see the email.",
        },
        {
          q: "How do I verify my account?",
          a: "Account verification helps build trust with other users. To verify your account, go to your Profile Settings and complete the verification process. This may include verifying your email address, phone number, or providing additional documentation for seller verification. Verified accounts receive a verification badge.",
        },
        {
          q: "Can I have multiple accounts?",
          a: "We recommend using a single account per person to maintain trust and transparency on the platform. However, businesses may create separate accounts for different business units or locations. Multiple personal accounts may be subject to review and potential restrictions.",
        },
        {
          q: "How do I update my profile information?",
          a: "To update your profile, click on your profile icon in the top right corner, then select 'Profile Settings' or navigate to '/profile'. From there, you can update your display name, email, phone number, location, profile picture, and other personal information. Changes are saved automatically.",
        },
        {
          q: "Is my personal information safe on APA Bazaar?",
          a: "Absolutely. We take data protection and privacy seriously. Your personal information is encrypted and stored securely. We never share your contact details publicly without your permission. Only basic information like your display name and location (if you choose to share it) is visible to other users. Read our Privacy Policy for complete details.",
        },
        {
          q: "How do I delete my account?",
          a: "To delete your account, go to Profile Settings and scroll to the 'Account Management' section. Click 'Delete Account' and follow the prompts. Please note that account deletion is permanent and will remove all your listings, messages, and account data. Make sure to download any important information before proceeding.",
        },
        {
          q: "What is a verified seller badge?",
          a: "A verified seller badge is a special indicator that shows a seller has completed our verification process. This includes identity verification and sometimes business documentation. Verified sellers are more trusted by buyers and may receive priority support. You can apply for verification through your seller dashboard.",
        },
        {
          q: "Can businesses create accounts on APA Bazaar?",
          a: "Yes! Businesses are welcome on APA Bazaar. When creating your account, select 'Business' as your account type. Business accounts can display business names, logos, and additional business information. Business accounts can also apply for verified seller status and access business-specific features.",
        },
      ],
    },
    {
      id: "posting",
      title: "Posting Ads",
      questions: [
        {
          q: "How do I post an ad on APA Bazaar?",
          a: "To post an ad, click the 'SELL' button in the header or navigate to your seller dashboard and click 'Post New Ad'. Select a category, fill in the required information (title, description, price, location), upload photos, and add any category-specific details. Review your ad and click 'Publish' to submit it for review.",
        },
        {
          q: "How many photos can I upload per ad?",
          a: "You can upload up to 10 photos per ad. We recommend uploading multiple high-quality photos from different angles to give buyers a complete view of your item. The first photo will be the main image displayed in listings. Good photos significantly increase the chances of your ad getting attention.",
        },
        {
          q: "What makes a good ad title?",
          a: "A good ad title is clear, descriptive, and includes key details. For example, 'iPhone 13 Pro Max 256GB - Excellent Condition' is better than just 'Phone for Sale'. Include the brand, model, key specifications, and condition. Keep it concise (under 60 characters) but informative. Good titles help your ad appear in search results.",
        },
        {
          q: "How long does it take for my ad to go live?",
          a: "After submitting your ad, it goes through a review process to ensure it meets our guidelines. Typically, ads are reviewed and go live within 24 hours. However, this may take longer during peak times or if additional verification is needed. You'll receive a notification once your ad is approved and live.",
        },
        {
          q: "Can I edit my ad after posting?",
          a: "Yes! You can edit your ad at any time. Go to 'My Ads' in your seller dashboard, find the listing you want to edit, and click 'Edit'. You can update the title, description, price, photos, and all other details. Note that edited ads may need to be re-reviewed before changes go live.",
        },
        {
          q: "How do I delete an ad?",
          a: "To delete an ad, go to 'My Ads' in your seller dashboard, find the listing, and click the delete/trash icon. You'll be asked to confirm the deletion. Once deleted, the ad will be removed from the platform permanently. You can also mark ads as 'Sold' instead of deleting them.",
        },
        {
          q: "What are premium ads?",
          a: "Premium ads are listings with enhanced visibility features. These include Featured Listings (appear at the top of search results), Urgent tags (highlighted with special badges), Ad Tiers (Gold, Silver, Bronze with priority ranking), and Promoted placements (homepage banners, category highlights). Premium features help your ads get more views and inquiries.",
        },
        {
          q: "Are there rules for ad content?",
          a: "Yes. Ads must be legal, accurate, and comply with our Terms of Service. Prohibited items include illegal goods, counterfeit products, weapons, drugs, and adult content. Ads must not contain misleading information, spam, or duplicate listings. Violations may result in ad removal or account suspension. See our Terms & Conditions for complete guidelines.",
        },
        {
          q: "How do I add a location to my ad?",
          a: "When creating or editing an ad, you'll see a location field. You can either type your location (e.g., 'Nairobi, Westlands') or use the location selector to choose from predefined areas. Adding an accurate location helps buyers find items in their area and improves your ad's visibility in location-based searches.",
        },
        {
          q: "Can I post ads in multiple categories?",
          a: "Each ad can only be posted in one main category and one sub-category. However, you can post as many different ads as you want across different categories. If you have items that could fit multiple categories, choose the most specific and relevant one. You can always create separate ads for different items.",
        },
      ],
    },
    {
      id: "promotions",
      title: "Promotions and Bumping Ads",
      questions: [
        {
          q: "What are promoted ads on APA Bazaar?",
          a: "Promoted ads are listings that appear in premium positions across the platform, such as homepage banners, category page highlights, and sidebar placements. Promotions guarantee maximum visibility and can significantly increase views and inquiries. Promoted ads are available through various promotion packages with different durations and placements.",
        },
        {
          q: "How do I promote an existing ad?",
          a: "To promote an ad, go to your seller dashboard and click on 'My Listings'. Find the ad you want to promote and click on the promotion options. You can also visit the 'Subscription' page to see available promotion packages. Select a promotion plan, complete payment via M-Pesa or other available methods, and your ad will be promoted immediately.",
        },
        {
          q: "What payment options are available for promotions?",
          a: "APA Bazaar accepts multiple payment methods for promotions including M-Pesa (most popular in Kenya), credit/debit cards, and bank transfers. M-Pesa payments are processed instantly. Card and bank transfer payments may take a few minutes to process. All payments are secure and encrypted.",
        },
        {
          q: "What is the difference between weekly, monthly, and longer promotion plans?",
          a: "Promotion plans vary in duration and cost. Weekly plans are great for short-term sales events. Monthly plans offer better value for ongoing visibility. Longer plans (3-6 months) provide the best value and ensure consistent visibility. Longer plans also often include additional benefits like priority support and analytics access.",
        },
        {
          q: "Can I upgrade or extend my promotion plan?",
          a: "Yes! You can upgrade your promotion plan at any time. Go to your seller dashboard, find your promoted ad, and select 'Extend Promotion' or 'Upgrade Plan'. The new plan will take effect immediately, and any remaining time from your current plan will be prorated. You can also purchase additional promotion credits.",
        },
        {
          q: "What happens when my promotion period ends?",
          a: "When your promotion period ends, your ad will continue to be active as a regular listing. It will remain visible in search results and category pages, but will no longer appear in premium promotion slots. You can renew the promotion at any time to restore premium placement.",
        },
        {
          q: "What is bumping an ad?",
          a: "Bumping is a quick way to move your ad to the top of its category listings temporarily. When you bump an ad, it appears at the top of search results for that category, giving it immediate visibility. Bumps are instant and don't require approval. Each bump moves your ad to the top for a short period.",
        },
        {
          q: "How much does it cost to bump an ad?",
          a: "Bump pricing varies based on the bump packages available. You can purchase bump credits in packages (e.g., 5 bumps, 10 bumps, 20 bumps) which offer better value than individual bumps. Check the 'Subscription' page in your seller dashboard for current bump package pricing and promotions.",
        },
        {
          q: "How do I bump my ad?",
          a: "To bump an ad, go to 'My Listings' in your seller dashboard, find the ad you want to bump, and click the 'Bump' button (lightning bolt icon). If you have bump credits available, the bump will be applied immediately. If you don't have credits, you'll be prompted to purchase a bump package first.",
        },
        {
          q: "How often can I bump an ad?",
          a: "You can bump an ad as often as you have credits available. There's no daily limit - if you have bump credits, you can use them whenever you want. However, we recommend spacing out bumps strategically rather than using them all at once for maximum effectiveness.",
        },
        {
          q: "Is bumping different from promoting an ad?",
          a: "Yes, they're different features. Bumping moves your ad to the top of category listings temporarily (short-term boost). Promoting places your ad in premium fixed positions like homepage banners and category highlights for a set duration (long-term visibility). You can use both features together for maximum exposure.",
        },
        {
          q: "Can I combine bumping with a promotion plan?",
          a: "Absolutely! Using both features together can maximize your ad's visibility. A promotion plan ensures your ad appears in premium fixed positions, while bumps give you additional temporary boosts to the top of listings. Many successful sellers use this combination strategy.",
        },
        {
          q: "Do promoted or bumped ads get more views?",
          a: "Yes, statistics show that promoted and bumped ads typically receive significantly more views than regular listings. Promoted ads can see 3-5x more views, while bumped ads get immediate visibility spikes. The exact increase depends on your category, timing, and ad quality, but premium features consistently improve performance.",
        },
        {
          q: "Are promotion fees refundable?",
          a: "Promotion fees are generally non-refundable once the promotion period has started. However, if you experience technical issues or if your ad is incorrectly rejected after promotion purchase, contact our support team for assistance. We review refund requests on a case-by-case basis for exceptional circumstances.",
        },
        {
          q: "How will I know my promotion or bump was successful?",
          a: "After purchasing a promotion or using a bump, you'll receive a confirmation notification. Your ad will also show promotion badges or indicators. You can check your ad's status in 'My Listings' - promoted ads will show a 'Promoted' badge, and you can see your remaining bump credits in your dashboard. Analytics in your seller dashboard also show increased views.",
        },
      ],
    },
    {
      id: "buying",
      title: "Buying and Selling",
      questions: [
        {
          q: "How do I search for items on APA Bazaar?",
          a: "You can search in several ways: Use the search bar at the top of the page to search by keywords, browse categories from the main menu, use filters to narrow down by price range, location, condition, and other criteria, or explore featured listings on the homepage. Advanced search options help you find exactly what you're looking for.",
        },
        {
          q: "How do I contact a seller?",
          a: "To contact a seller, click on any listing to view details, then click the 'Contact Seller' or 'Message' button. You can send a message through our messaging system, or if the seller has provided their phone number, you can call or text them directly. Always communicate through the platform first for safety and record-keeping.",
        },
        {
          q: "What if a seller doesn't respond?",
          a: "If a seller doesn't respond within 48 hours, try sending a follow-up message. Some sellers may be busy or have notifications disabled. If there's still no response after several attempts, you can report the listing or contact our support team. We may reach out to the seller or take appropriate action.",
        },
        {
          q: "How do I negotiate a price?",
          a: "Price negotiation is common on APA Bazaar. Use the messaging feature to discuss pricing with the seller. Be respectful and reasonable in your offers. Many sellers are open to negotiation, especially for quick sales. You can also check if the ad is marked as 'Negotiable' - this indicates the seller is open to price discussions.",
        },
        {
          q: "Can I meet the seller in person?",
          a: "Yes, in-person meetings are common for local transactions. Always meet in a safe, public place like a mall, police station, or busy cafe during daylight hours. Never invite strangers to your home or go to theirs. Bring a friend if possible, and inspect the item thoroughly before payment. Trust your instincts - if something feels off, walk away.",
        },
        {
          q: "How do I leave a review for a seller?",
          a: "After completing a transaction, you can leave a review for the seller. Go to your 'Messages' or transaction history, find the completed transaction, and click 'Leave Review'. You can rate the seller and write a comment about your experience. Reviews help other buyers make informed decisions and help good sellers build their reputation.",
        },
        {
          q: "What if I receive a faulty item?",
          a: "If you receive a faulty item, contact the seller immediately through the platform. Take photos of the issue and document everything. Most sellers are willing to resolve issues. If the seller is unresponsive or uncooperative, report the issue through our support system. We'll investigate and may take action including account suspension for fraudulent sellers.",
        },
        {
          q: "Can I sell used items on APA Bazaar?",
          a: "Absolutely! APA Bazaar is perfect for selling used items. In fact, many of our listings are for pre-owned items in good condition. When posting, accurately describe the item's condition (e.g., 'Like New', 'Good Condition', 'Fair Condition') and include clear photos showing any wear or damage. Honest descriptions build trust with buyers.",
        },
        {
          q: "How do I mark an ad as sold?",
          a: "To mark an ad as sold, go to 'My Listings' in your seller dashboard, find the sold item, and click 'Mark as Sold' or change the status to 'Sold'. This removes the ad from active listings but keeps it in your history. Marking items as sold helps keep the platform current and prevents unnecessary inquiries.",
        },
        {
          q: "Are there shipping options on APA Bazaar?",
          a: "Shipping arrangements are made directly between buyers and sellers. APA Bazaar doesn't provide shipping services, but many sellers offer delivery options, especially for larger items or when using courier services. Discuss shipping methods, costs, and insurance with the seller before completing the transaction. Always use reputable courier services for valuable items.",
        },
      ],
    },
    {
      id: "payments",
      title: "Payments and Transactions",
      questions: [
        {
          q: "Does APA Bazaar handle payments?",
          a: "APA Bazaar does not directly process payments between buyers and sellers. Transactions are handled directly between parties. However, we provide a secure messaging platform for communication and recommend safe payment practices. For premium features like promotions and subscriptions, we process payments through secure payment gateways.",
        },
        {
          q: "Is M-Pesa integrated?",
          a: "Yes! M-Pesa is fully integrated for purchasing premium features, subscriptions, promotions, and bump credits. When you purchase any premium feature, you'll receive an M-Pesa prompt to complete payment. M-Pesa payments are processed instantly, and your purchase is activated immediately after payment confirmation.",
        },
        {
          q: "What fees does APA Bazaar charge for transactions?",
          a: "APA Bazaar does not charge fees for transactions between buyers and sellers. Posting basic ads is free. We only charge for optional premium features like promoted ads, featured listings, subscription packages, ad tiers, and bump credits. There are no hidden fees or commission on sales between users.",
        },
        {
          q: "How do I avoid payment scams?",
          a: "To avoid scams: Always meet in person when possible, inspect items before payment, use M-Pesa or cash for in-person transactions, avoid advance payments or deposits unless you trust the seller, be wary of deals that seem too good to be true, check seller reviews and verification status, and never share your M-Pesa PIN or banking details. If something feels suspicious, report it immediately.",
        },
        {
          q: "Can I get a refund through APA Bazaar?",
          a: "APA Bazaar doesn't process refunds for transactions between buyers and sellers - those are handled directly between parties. However, if you purchased a premium feature (promotion, subscription, etc.) and experience issues, contact our support team. We review refund requests for premium features on a case-by-case basis, especially for technical problems or service failures.",
        },
      ],
    },
    {
      id: "safety",
      title: "Safety and Security",
      questions: [
        {
          q: "How does APA Bazaar ensure user safety?",
          a: "We ensure safety through multiple measures: Account verification for sellers, review and moderation of listings, reporting and blocking features, secure messaging platform, user ratings and reviews system, encrypted data storage, and a dedicated support team that responds to safety concerns. We also provide safety tips and guidelines to help users make safe transactions.",
        },
        {
          q: "What are common scams to watch for?",
          a: "Common scams include: Requests for advance payment before seeing the item, sellers refusing to meet in person, prices that are suspiciously low, requests to pay via unusual methods (gift cards, wire transfers), sellers asking for personal information beyond what's necessary, fake verification badges, and pressure tactics. Always verify before paying and trust your instincts.",
        },
        {
          q: "How do I report a suspicious user?",
          a: "To report a suspicious user, click on their profile or listing, then click the 'Report' button. Select the reason for reporting (scam, fake listing, harassment, etc.) and provide details. You can also contact our support team directly through the Contact Us page. All reports are reviewed promptly, and we take appropriate action including warnings, account suspension, or permanent bans.",
        },
        {
          q: "Is my contact info visible to everyone?",
          a: "Your contact information is protected. Your email address is never visible to other users. Phone numbers are only shown if you choose to display them in your listings. You can control your privacy settings in Profile Settings. We recommend using the platform's messaging system first before sharing direct contact information.",
        },
        {
          q: "What should I do if I feel harassed on the platform?",
          a: "If you feel harassed, immediately block the user through their profile or in your messages. Report the harassment using the 'Report' feature with details of the incident. Contact our support team if the situation is serious. We take harassment seriously and will investigate. In severe cases, we may involve law enforcement. Your safety is our priority.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Issues and Support",
      questions: [
        {
          q: "Why is the app crashing?",
          a: "If you're experiencing crashes, try these solutions: Clear your browser cache and cookies, update your browser to the latest version, disable browser extensions that might interfere, try a different browser (Chrome, Firefox, Safari, Edge), check your internet connection, restart your device, or try accessing the site in incognito/private mode. If issues persist, contact our technical support team.",
        },
        {
          q: "How do I contact APA Bazaar support?",
          a: "You can contact support through: The 'Contact Us' page on our website, email support (check the Contact Us page for the current email), the support section in your seller dashboard, or by reporting issues through the 'Report' feature. Our support team typically responds within 24-48 hours. For urgent issues, use the contact form and mark it as urgent.",
        },
        {
          q: "What if I can't upload photos?",
          a: "If you can't upload photos, check: File size (must be under 15MB per image), file format (JPG, PNG, HEIC are supported), internet connection stability, browser compatibility, and available storage space. Try compressing large images or using a different browser. If the problem persists, contact support with details about the error message you're seeing.",
        },
        {
          q: "Does APA Bazaar work offline?",
          a: "APA Bazaar requires an active internet connection to function. You need internet to browse listings, post ads, send messages, and access your account. However, once pages are loaded, you can view cached content briefly if you lose connection. For full functionality, ensure you have a stable internet connection.",
        },
        {
          q: "How often is the platform updated?",
          a: "APA Bazaar is regularly updated with new features, security improvements, and bug fixes. We release updates frequently to improve user experience, add new categories, enhance search functionality, and implement user-requested features. Major updates are announced through notifications or our blog. We're committed to continuously improving the platform based on user feedback.",
        },
      ],
    },
  ];

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const category of faqCategories) {
        const element = sectionRefs.current[category.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(category.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 border-b overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>FAQs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about using APA Bazaar. Everything you need to know about buying, selling, and getting the most out of our platform.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl p-4 shadow-lg border border-border">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                Quick Navigation
              </h3>
              <nav className="space-y-1">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => scrollToSection(category.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      "hover:bg-primary/10 hover:text-primary",
                      activeSection === category.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div
                key={category.id}
                id={category.id}
                ref={(el) => (sectionRefs.current[category.id] = el)}
                className="scroll-mt-24 bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold">
                    {categoryIndex + 1}
                  </span>
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${category.id}-${index}`}>
                      <AccordionTrigger className="text-left font-medium text-base hover:text-primary">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            {/* Still Need Help */}
            <div className="mt-12 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 rounded-xl p-8 md:p-12 text-center border border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link
                to="/contact-us"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQs;
