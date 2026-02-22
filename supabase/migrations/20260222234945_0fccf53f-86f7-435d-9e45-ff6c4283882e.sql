
-- Fix the security definer view warning by using security_invoker
-- Since RLS already allows authenticated users to see all profiles,
-- the view with security_invoker=on will work correctly
DROP VIEW IF EXISTS public.safe_profiles;

CREATE OR REPLACE VIEW public.safe_profiles 
WITH (security_invoker = on)
AS
SELECT
  user_id,
  id,
  display_name,
  avatar_url,
  bio,
  location,
  account_type,
  business_name,
  rating,
  total_reviews,
  is_verified,
  created_at,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN phone
    ELSE NULL
  END AS phone,
  CASE 
    WHEN auth.uid() = user_id OR is_admin(auth.uid()) THEN whatsapp_number
    ELSE NULL
  END AS whatsapp_number,
  bump_wallet_balance,
  updated_at
FROM public.profiles;
