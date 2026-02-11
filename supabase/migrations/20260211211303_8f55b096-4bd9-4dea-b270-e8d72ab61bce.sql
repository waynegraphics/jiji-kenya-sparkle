
-- Team members table for admin portal
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  designation TEXT NOT NULL DEFAULT 'support',
  permissions JSONB NOT NULL DEFAULT '{"view_users": false, "manage_users": false, "view_listings": false, "manage_listings": false, "view_reports": false, "manage_reports": false, "view_support": false, "manage_support": false, "view_analytics": false, "view_finances": false, "manage_settings": false, "view_affiliates": false, "manage_affiliates": false, "view_seller_dashboard": false, "view_customer_dashboard": false}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Only admins/super_admin can manage team members
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Team members can view own record" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

-- Affiliates table
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  commission_rate_registration NUMERIC NOT NULL DEFAULT 10,
  commission_rate_subscription NUMERIC NOT NULL DEFAULT 10,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  pending_balance NUMERIC NOT NULL DEFAULT 0,
  mpesa_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can create own affiliate application" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all affiliates" ON public.affiliates
  FOR ALL USING (is_admin(auth.uid()));

-- Affiliate referrals
CREATE TABLE public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_type TEXT NOT NULL DEFAULT 'registration',
  source_amount NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own referrals" ON public.affiliate_referrals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM affiliates WHERE affiliates.id = affiliate_referrals.affiliate_id AND affiliates.user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can manage referrals" ON public.affiliate_referrals
  FOR ALL USING (is_admin(auth.uid()));

-- Affiliate payouts
CREATE TABLE public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  mpesa_phone TEXT,
  mpesa_receipt TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own payouts" ON public.affiliate_payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM affiliates WHERE affiliates.id = affiliate_payouts.affiliate_id AND affiliates.user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can manage payouts" ON public.affiliate_payouts
  FOR ALL USING (is_admin(auth.uid()));

-- Insert default affiliate settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('affiliate_default_commission_registration', '10', 'Default commission % for registration referrals'),
  ('affiliate_default_commission_subscription', '10', 'Default commission % for subscription referrals'),
  ('affiliate_min_payout', '500', 'Minimum payout amount in KES'),
  ('affiliate_enabled', 'true', 'Whether affiliate program is enabled'),
  ('super_admin_email', 'waynegraphicsdesigns@gmail.com', 'Super admin email address')
ON CONFLICT DO NOTHING;

-- Add super_admin role for waynegraphicsdesigns@gmail.com
-- First get the user_id, then add team member
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'waynegraphicsdesigns@gmail.com' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.team_members (user_id, designation, permissions, is_active)
    VALUES (v_user_id, 'super_admin', '{
      "view_users": true, "manage_users": true,
      "view_listings": true, "manage_listings": true,
      "view_reports": true, "manage_reports": true,
      "view_support": true, "manage_support": true,
      "view_analytics": true, "view_finances": true,
      "manage_settings": true, "view_affiliates": true,
      "manage_affiliates": true, "view_seller_dashboard": true,
      "view_customer_dashboard": true, "manage_team": true
    }'::jsonb, true)
    ON CONFLICT (user_id) DO UPDATE SET designation = 'super_admin';
  END IF;
END $$;

-- Triggers for updated_at
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
