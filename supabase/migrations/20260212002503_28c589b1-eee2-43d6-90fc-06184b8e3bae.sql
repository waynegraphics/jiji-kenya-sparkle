
-- =============================================
-- 1. LISTING TIERS (Gold / Silver / Bronze / Free)
-- =============================================
CREATE TABLE public.listing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  priority_weight INTEGER NOT NULL DEFAULT 0,
  badge_label TEXT,
  badge_color TEXT DEFAULT '#888888',
  border_style TEXT DEFAULT 'none',
  shadow_intensity TEXT DEFAULT 'none',
  ribbon_text TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  included_featured_days INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listing tiers" ON public.listing_tiers FOR SELECT USING (is_active = true OR is_admin(auth.uid()));
CREATE POLICY "Admins can manage listing tiers" ON public.listing_tiers FOR ALL USING (is_admin(auth.uid()));

-- Default Free tier
INSERT INTO public.listing_tiers (name, priority_weight, badge_label, badge_color, price, is_active, display_order)
VALUES ('Free', 0, NULL, '#888888', 0, true, 100);

-- =============================================
-- 2. EXTEND base_listings with tier/promotion fields
-- =============================================
ALTER TABLE public.base_listings
  ADD COLUMN tier_id UUID REFERENCES public.listing_tiers(id),
  ADD COLUMN tier_priority INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN tier_expires_at TIMESTAMPTZ,
  ADD COLUMN promotion_type_id UUID,
  ADD COLUMN promotion_expires_at TIMESTAMPTZ;

-- =============================================
-- 3. BUMP PACKAGES (Admin-configurable)
-- =============================================
CREATE TABLE public.bump_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bump_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active bump packages" ON public.bump_packages FOR SELECT USING (is_active = true OR is_admin(auth.uid()));
CREATE POLICY "Admins can manage bump packages" ON public.bump_packages FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- 4. ADD bump_wallet_balance to profiles
-- =============================================
ALTER TABLE public.profiles ADD COLUMN bump_wallet_balance INTEGER NOT NULL DEFAULT 0;

-- =============================================
-- 5. PROMOTION TYPES (Admin-configurable placements)
-- =============================================
CREATE TABLE public.promotion_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  placement TEXT NOT NULL DEFAULT 'homepage_top',
  duration_days INTEGER NOT NULL DEFAULT 7,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  max_ads INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promotion_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active promotion types" ON public.promotion_types FOR SELECT USING (is_active = true OR is_admin(auth.uid()));
CREATE POLICY "Admins can manage promotion types" ON public.promotion_types FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- 6. LISTING PROMOTIONS (per-ad promotion purchases)
-- =============================================
CREATE TABLE public.listing_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.base_listings(id) ON DELETE CASCADE,
  promotion_type_id UUID NOT NULL REFERENCES public.promotion_types(id),
  user_id UUID NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own listing promotions" ON public.listing_promotions FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Users can create listing promotions" ON public.listing_promotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all listing promotions" ON public.listing_promotions FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- 7. FEATURED SETTINGS (global config)
-- =============================================
CREATE TABLE public.featured_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  eligible_tier_ids UUID[] DEFAULT '{}',
  default_duration_days INTEGER NOT NULL DEFAULT 7,
  ribbon_text TEXT DEFAULT 'Featured',
  highlight_bg TEXT DEFAULT '#FFF8E1',
  border_accent TEXT DEFAULT '#FFD700',
  badge_label TEXT DEFAULT 'Featured',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view featured settings" ON public.featured_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage featured settings" ON public.featured_settings FOR ALL USING (is_admin(auth.uid()));

INSERT INTO public.featured_settings (is_enabled) VALUES (true);

-- =============================================
-- 8. FEATURED DURATIONS (pricing options)
-- =============================================
CREATE TABLE public.featured_durations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duration_days INTEGER NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_durations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active featured durations" ON public.featured_durations FOR SELECT USING (is_active = true OR is_admin(auth.uid()));
CREATE POLICY "Admins can manage featured durations" ON public.featured_durations FOR ALL USING (is_admin(auth.uid()));

INSERT INTO public.featured_durations (duration_days, price, display_order) VALUES
  (7, 500, 1),
  (14, 900, 2),
  (30, 1500, 3);

-- =============================================
-- 9. LISTING TIER PURCHASES (per-ad tier assignment)
-- =============================================
CREATE TABLE public.listing_tier_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.base_listings(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.listing_tiers(id),
  user_id UUID NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_tier_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tier purchases" ON public.listing_tier_purchases FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Users can create tier purchases" ON public.listing_tier_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tier purchases" ON public.listing_tier_purchases FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- 10. BUMP TRANSACTIONS (audit trail)
-- =============================================
CREATE TABLE public.bump_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID REFERENCES public.base_listings(id),
  type TEXT NOT NULL DEFAULT 'purchase',
  credits INTEGER NOT NULL,
  package_id UUID REFERENCES public.bump_packages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bump_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bump transactions" ON public.bump_transactions FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Users can create bump transactions" ON public.bump_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bump transactions" ON public.bump_transactions FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- 11. EXTEND subscription_packages with unlimited_postings
-- =============================================
ALTER TABLE public.subscription_packages ADD COLUMN unlimited_postings BOOLEAN NOT NULL DEFAULT true;

-- =============================================
-- 12. PERFORMANCE INDEXES
-- =============================================
CREATE INDEX idx_base_listings_tier_priority ON public.base_listings(tier_priority DESC);
CREATE INDEX idx_base_listings_bumped_at ON public.base_listings(bumped_at DESC NULLS LAST);
CREATE INDEX idx_base_listings_featured_until ON public.base_listings(featured_until);
CREATE INDEX idx_base_listings_tier_expires ON public.base_listings(tier_expires_at);
CREATE INDEX idx_base_listings_promo_expires ON public.base_listings(promotion_expires_at);
CREATE INDEX idx_listing_promotions_expires ON public.listing_promotions(expires_at);
CREATE INDEX idx_listing_promotions_listing ON public.listing_promotions(listing_id);
CREATE INDEX idx_listing_tier_purchases_listing ON public.listing_tier_purchases(listing_id);

-- =============================================
-- 13. ATOMIC BUMP FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.bump_listing(p_user_id UUID, p_listing_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT bump_wallet_balance INTO v_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < 1 THEN
    RETURN FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM base_listings WHERE id = p_listing_id AND user_id = p_user_id AND status = 'active') THEN
    RETURN FALSE;
  END IF;
  UPDATE profiles SET bump_wallet_balance = bump_wallet_balance - 1 WHERE user_id = p_user_id;
  UPDATE base_listings SET bumped_at = now() WHERE id = p_listing_id;
  INSERT INTO bump_transactions (user_id, listing_id, type, credits) VALUES (p_user_id, p_listing_id, 'use', -1);
  RETURN TRUE;
END;
$$;

-- =============================================
-- 14. ADD BUMP CREDITS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.add_bump_credits(p_user_id UUID, p_credits INTEGER, p_package_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles SET bump_wallet_balance = bump_wallet_balance + p_credits WHERE user_id = p_user_id;
  INSERT INTO bump_transactions (user_id, type, credits, package_id) VALUES (p_user_id, 'purchase', p_credits, p_package_id);
END;
$$;

-- =============================================
-- 15. TRIGGER: Sync tier_priority when tier_id changes
-- =============================================
CREATE OR REPLACE FUNCTION public.sync_listing_tier_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tier_id IS NOT NULL THEN
    SELECT priority_weight INTO NEW.tier_priority FROM listing_tiers WHERE id = NEW.tier_id;
  ELSE
    NEW.tier_priority := 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_tier_priority
BEFORE INSERT OR UPDATE OF tier_id ON public.base_listings
FOR EACH ROW
EXECUTE FUNCTION public.sync_listing_tier_priority();

-- =============================================
-- 16. Update timestamps triggers for new tables
-- =============================================
CREATE TRIGGER update_listing_tiers_updated_at BEFORE UPDATE ON public.listing_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bump_packages_updated_at BEFORE UPDATE ON public.bump_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promotion_types_updated_at BEFORE UPDATE ON public.promotion_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_featured_settings_updated_at BEFORE UPDATE ON public.featured_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 17. FK for promotion_type_id on base_listings
-- =============================================
ALTER TABLE public.base_listings ADD CONSTRAINT base_listings_promotion_type_id_fkey FOREIGN KEY (promotion_type_id) REFERENCES public.promotion_types(id);
