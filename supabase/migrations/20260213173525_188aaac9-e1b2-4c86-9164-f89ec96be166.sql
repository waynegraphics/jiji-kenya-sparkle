
-- Make listing_id nullable in listing_promotions so credits can be purchased without applying to a listing
ALTER TABLE public.listing_promotions ALTER COLUMN listing_id DROP NOT NULL;

-- Make listing_id nullable in listing_tier_purchases
ALTER TABLE public.listing_tier_purchases ALTER COLUMN listing_id DROP NOT NULL;

-- Function to apply a purchased promotion to a listing
CREATE OR REPLACE FUNCTION public.apply_promotion_to_listing(p_user_id uuid, p_promotion_purchase_id uuid, p_listing_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_promo RECORD;
  v_promo_type RECORD;
BEGIN
  -- Get the unused promotion purchase
  SELECT * INTO v_promo FROM listing_promotions
  WHERE id = p_promotion_purchase_id
    AND user_id = p_user_id
    AND listing_id IS NULL
    AND status = 'active'
    AND payment_status = 'completed';
  
  IF v_promo IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verify listing belongs to user and is active
  IF NOT EXISTS (SELECT 1 FROM base_listings WHERE id = p_listing_id AND user_id = p_user_id AND status = 'active') THEN
    RETURN FALSE;
  END IF;

  -- Get promotion type details for duration
  SELECT * INTO v_promo_type FROM promotion_types WHERE id = v_promo.promotion_type_id;

  -- Apply promotion to listing
  UPDATE listing_promotions
  SET listing_id = p_listing_id,
      expires_at = now() + (v_promo_type.duration_days || ' days')::interval
  WHERE id = p_promotion_purchase_id;

  -- Update the base listing
  UPDATE base_listings
  SET promotion_type_id = v_promo.promotion_type_id,
      promotion_expires_at = now() + (v_promo_type.duration_days || ' days')::interval
  WHERE id = p_listing_id;

  RETURN TRUE;
END;
$$;

-- Function to apply a purchased tier to a listing
CREATE OR REPLACE FUNCTION public.apply_tier_to_listing(p_user_id uuid, p_tier_purchase_id uuid, p_listing_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_purchase RECORD;
  v_tier RECORD;
BEGIN
  -- Get the unused tier purchase
  SELECT * INTO v_purchase FROM listing_tier_purchases
  WHERE id = p_tier_purchase_id
    AND user_id = p_user_id
    AND listing_id IS NULL
    AND status = 'active'
    AND payment_status = 'completed';
  
  IF v_purchase IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verify listing belongs to user and is active
  IF NOT EXISTS (SELECT 1 FROM base_listings WHERE id = p_listing_id AND user_id = p_user_id AND status = 'active') THEN
    RETURN FALSE;
  END IF;

  -- Get tier details
  SELECT * INTO v_tier FROM listing_tiers WHERE id = v_purchase.tier_id;

  -- Apply tier to listing
  UPDATE listing_tier_purchases
  SET listing_id = p_listing_id,
      expires_at = now() + interval '30 days'
  WHERE id = p_tier_purchase_id;

  -- Update the base listing
  UPDATE base_listings
  SET tier_id = v_purchase.tier_id,
      tier_expires_at = now() + interval '30 days',
      is_featured = CASE WHEN v_tier.included_featured_days > 0 THEN true ELSE is_featured END,
      featured_until = CASE WHEN v_tier.included_featured_days > 0 THEN now() + (v_tier.included_featured_days || ' days')::interval ELSE featured_until END
  WHERE id = p_listing_id;

  RETURN TRUE;
END;
$$;
