
-- Fix security definer view - use security_invoker so RLS of the querying user applies
ALTER VIEW public.public_seller_profiles SET (security_invoker = on);
