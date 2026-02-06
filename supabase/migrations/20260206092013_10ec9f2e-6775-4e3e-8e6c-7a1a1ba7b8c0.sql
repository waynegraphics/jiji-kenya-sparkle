-- Subscription system for enterprise classifieds platform

-- Add-on types enum
CREATE TYPE public.addon_type AS ENUM ('bumping', 'featured', 'promotion');

-- Subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- Payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- =============================================
-- SUBSCRIPTION PACKAGES TABLE
-- =============================================
CREATE TABLE public.subscription_packages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'KES',
    duration_days INTEGER NOT NULL DEFAULT 30,
    
    -- Core limits
    max_ads INTEGER NOT NULL DEFAULT 5,
    analytics_access BOOLEAN NOT NULL DEFAULT false,
    allowed_categories TEXT[] DEFAULT NULL, -- NULL means all categories allowed
    
    -- Display settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    
    -- Custom styling
    bg_color TEXT DEFAULT '#ffffff',
    text_color TEXT DEFAULT '#1a1a1a',
    button_color TEXT DEFAULT '#16a34a',
    button_text_color TEXT DEFAULT '#ffffff',
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ADDONS TABLE (Bumping, Featured, Promotions)
-- =============================================
CREATE TABLE public.addons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type addon_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Custom styling
    bg_color TEXT DEFAULT '#f0f9ff',
    text_color TEXT DEFAULT '#1a1a1a',
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ADDON TIERS TABLE (Pricing tiers for each addon)
-- =============================================
CREATE TABLE public.addon_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    addon_id UUID NOT NULL REFERENCES public.addons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'KES',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SELLER SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE public.seller_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    package_id UUID NOT NULL REFERENCES public.subscription_packages(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'pending',
    
    -- Current usage
    ads_used INTEGER NOT NULL DEFAULT 0,
    
    -- Dates
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment info
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_reference TEXT,
    mpesa_receipt TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SELLER ADDONS TABLE (Purchased add-ons)
-- =============================================
CREATE TABLE public.seller_addons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    addon_id UUID NOT NULL REFERENCES public.addons(id) ON DELETE RESTRICT,
    tier_id UUID NOT NULL REFERENCES public.addon_tiers(id) ON DELETE RESTRICT,
    
    -- Usage tracking
    quantity_purchased INTEGER NOT NULL DEFAULT 0,
    quantity_used INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    status subscription_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment info
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_reference TEXT,
    mpesa_receipt TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- PAYMENT TRANSACTIONS TABLE (For M-Pesa tracking)
-- =============================================
CREATE TABLE public.payment_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    
    -- What was purchased
    subscription_id UUID REFERENCES public.seller_subscriptions(id) ON DELETE SET NULL,
    addon_purchase_id UUID REFERENCES public.seller_addons(id) ON DELETE SET NULL,
    
    -- M-Pesa details
    phone_number TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'KES',
    merchant_request_id TEXT,
    checkout_request_id TEXT,
    mpesa_receipt_number TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status payment_status NOT NULL DEFAULT 'pending',
    result_code TEXT,
    result_desc TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_subscription_packages_active ON public.subscription_packages(is_active, display_order);
CREATE INDEX idx_addons_active ON public.addons(is_active, display_order);
CREATE INDEX idx_addon_tiers_addon ON public.addon_tiers(addon_id, is_active, display_order);
CREATE INDEX idx_seller_subscriptions_user ON public.seller_subscriptions(user_id, status);
CREATE INDEX idx_seller_addons_user ON public.seller_addons(user_id, status);
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id, status);
CREATE INDEX idx_payment_transactions_checkout ON public.payment_transactions(checkout_request_id);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Subscription packages - public read, admin write
CREATE POLICY "Anyone can view active subscription packages"
ON public.subscription_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage subscription packages"
ON public.subscription_packages FOR ALL
USING (public.is_admin(auth.uid()));

-- Addons - public read, admin write
CREATE POLICY "Anyone can view active addons"
ON public.addons FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage addons"
ON public.addons FOR ALL
USING (public.is_admin(auth.uid()));

-- Addon tiers - public read, admin write
CREATE POLICY "Anyone can view active addon tiers"
ON public.addon_tiers FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage addon tiers"
ON public.addon_tiers FOR ALL
USING (public.is_admin(auth.uid()));

-- Seller subscriptions - user can view own, admin can view all
CREATE POLICY "Users can view their own subscriptions"
ON public.seller_subscriptions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create their own subscriptions"
ON public.seller_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
ON public.seller_subscriptions FOR ALL
USING (public.is_admin(auth.uid()));

-- Seller addons - user can view own, admin can view all
CREATE POLICY "Users can view their own addon purchases"
ON public.seller_addons FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create their own addon purchases"
ON public.seller_addons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all addon purchases"
ON public.seller_addons FOR ALL
USING (public.is_admin(auth.uid()));

-- Payment transactions - user can view own, admin can view all
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create their own transactions"
ON public.payment_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
ON public.payment_transactions FOR ALL
USING (public.is_admin(auth.uid()));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_subscription_packages_updated_at
BEFORE UPDATE ON public.subscription_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addons_updated_at
BEFORE UPDATE ON public.addons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addon_tiers_updated_at
BEFORE UPDATE ON public.addon_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_subscriptions_updated_at
BEFORE UPDATE ON public.seller_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_addons_updated_at
BEFORE UPDATE ON public.seller_addons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();