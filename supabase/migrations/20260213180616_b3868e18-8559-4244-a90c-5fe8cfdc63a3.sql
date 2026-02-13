
-- Add max_ads column to listing_tiers to control how many ads can use each tier
ALTER TABLE public.listing_tiers ADD COLUMN max_ads integer NOT NULL DEFAULT 5;

-- Add a comment for clarity
COMMENT ON COLUMN public.listing_tiers.max_ads IS 'Maximum number of ads that can simultaneously use this tier';
