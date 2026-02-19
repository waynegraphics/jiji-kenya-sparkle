
-- Fix security definer view by setting it to SECURITY INVOKER
ALTER VIEW public.public_seller_profiles SET (security_invoker = on);
