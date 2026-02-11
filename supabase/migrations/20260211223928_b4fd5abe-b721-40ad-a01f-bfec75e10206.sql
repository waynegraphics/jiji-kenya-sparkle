
-- Add rejection_note and edit tracking to base_listings
ALTER TABLE public.base_listings 
  ADD COLUMN IF NOT EXISTS rejection_note text,
  ADD COLUMN IF NOT EXISTS previous_data jsonb,
  ADD COLUMN IF NOT EXISTS edited_fields text[];

-- Update RLS to allow admins to manage all listings
CREATE POLICY "Admins can manage all base listings"
ON public.base_listings
FOR ALL
USING (is_admin(auth.uid()));
