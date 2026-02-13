
-- Add new fields to electronics_listings for better device-specific data
ALTER TABLE public.electronics_listings 
  ADD COLUMN IF NOT EXISTS screen_resolution text,
  ADD COLUMN IF NOT EXISTS refresh_rate text,
  ADD COLUMN IF NOT EXISTS panel_type text,
  ADD COLUMN IF NOT EXISTS operating_system text,
  ADD COLUMN IF NOT EXISTS graphics_card text;
