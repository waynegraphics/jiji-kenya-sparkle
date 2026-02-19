
-- Add tier_purchase_id to base_listings so we can track which purchase covers each listing
ALTER TABLE public.base_listings ADD COLUMN IF NOT EXISTS tier_purchase_id uuid REFERENCES public.listing_tier_purchases(id) ON DELETE SET NULL;

-- Replace apply_tier_to_listing to support per-set (one purchase covers up to max_ads listings)
CREATE OR REPLACE FUNCTION public.apply_tier_to_listing(p_user_id uuid, p_tier_purchase_id uuid, p_listing_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_purchase RECORD;
  v_tier RECORD;
  v_used_count INTEGER;
BEGIN
  -- Get the tier purchase
  SELECT * INTO v_purchase FROM listing_tier_purchases
  WHERE id = p_tier_purchase_id
    AND user_id = p_user_id
    AND status = 'active'
    AND payment_status = 'completed';
  
  IF v_purchase IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get tier details including max_ads
  SELECT * INTO v_tier FROM listing_tiers WHERE id = v_purchase.tier_id;

  IF v_tier IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Count how many listings already use this purchase
  SELECT COUNT(*) INTO v_used_count FROM base_listings
  WHERE tier_purchase_id = p_tier_purchase_id;

  -- Check if max_ads limit reached
  IF v_used_count >= v_tier.max_ads THEN
    RETURN FALSE;
  END IF;

  -- Verify listing belongs to user and is active
  IF NOT EXISTS (SELECT 1 FROM base_listings WHERE id = p_listing_id AND user_id = p_user_id AND status = 'active') THEN
    RETURN FALSE;
  END IF;

  -- Check listing doesn't already have a tier
  IF EXISTS (SELECT 1 FROM base_listings WHERE id = p_listing_id AND tier_id IS NOT NULL) THEN
    RETURN FALSE;
  END IF;

  -- Set the listing_id on the purchase (first listing applied marks it)
  IF v_purchase.listing_id IS NULL THEN
    UPDATE listing_tier_purchases
    SET listing_id = p_listing_id,
        expires_at = now() + interval '30 days'
    WHERE id = p_tier_purchase_id;
  END IF;

  -- Update the base listing
  UPDATE base_listings
  SET tier_id = v_purchase.tier_id,
      tier_purchase_id = p_tier_purchase_id,
      tier_expires_at = COALESCE(v_purchase.expires_at, now() + interval '30 days'),
      tier_priority = v_tier.priority_weight,
      is_featured = CASE WHEN v_tier.included_featured_days > 0 THEN true ELSE is_featured END,
      featured_until = CASE WHEN v_tier.included_featured_days > 0 THEN now() + (v_tier.included_featured_days || ' days')::interval ELSE featured_until END
  WHERE id = p_listing_id;

  RETURN TRUE;
END;
$function$;

-- Function to remove a tier from a listing (free up a slot)
CREATE OR REPLACE FUNCTION public.remove_tier_from_listing(p_user_id uuid, p_listing_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify listing belongs to user
  IF NOT EXISTS (SELECT 1 FROM base_listings WHERE id = p_listing_id AND user_id = p_user_id AND tier_purchase_id IS NOT NULL) THEN
    RETURN FALSE;
  END IF;

  -- Remove tier from listing
  UPDATE base_listings
  SET tier_id = NULL,
      tier_purchase_id = NULL,
      tier_expires_at = NULL,
      tier_priority = 0
  WHERE id = p_listing_id AND user_id = p_user_id;

  RETURN TRUE;
END;
$function$;
