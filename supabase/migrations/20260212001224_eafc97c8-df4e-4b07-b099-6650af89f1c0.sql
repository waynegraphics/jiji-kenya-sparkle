
-- 1. Fix favorites FK: drop old FK to listings, add FK to base_listings
ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_listing_id_fkey;
ALTER TABLE public.favorites ADD CONSTRAINT favorites_listing_id_fkey 
  FOREIGN KEY (listing_id) REFERENCES public.base_listings(id) ON DELETE CASCADE;

-- 2. Create atomic increment function for ads_used
CREATE OR REPLACE FUNCTION public.increment_ads_used(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.seller_subscriptions
  SET ads_used = ads_used + 1
  WHERE user_id = p_user_id
    AND status = 'active'
    AND payment_status = 'completed';
END;
$$;

-- 3. Create atomic view increment function
CREATE OR REPLACE FUNCTION public.increment_listing_views(p_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.base_listings
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_listing_id;
END;
$$;

-- 4. Tighten affiliate_clicks INSERT RLS - require valid referral code
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.affiliate_clicks;
CREATE POLICY "Anyone can insert clicks" ON public.affiliate_clicks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE affiliates.id = affiliate_id
      AND affiliates.referral_code = referral_code
      AND affiliates.status = 'approved'
  )
);
