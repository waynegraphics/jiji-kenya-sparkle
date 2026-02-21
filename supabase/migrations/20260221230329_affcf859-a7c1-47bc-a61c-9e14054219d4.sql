
-- Drop the security definer view since authenticated users can access profiles directly
-- and anonymous users don't need profile access
DROP VIEW IF EXISTS public.public_seller_profiles;
