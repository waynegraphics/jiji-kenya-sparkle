
-- The public_seller_profiles view is intentionally SECURITY DEFINER
-- It exposes only non-PII columns (no phone, whatsapp_number) while
-- bypassing the profiles RLS that restricts to own-profile-only.
-- This is the correct pattern for safe public data exposure.
ALTER VIEW public.public_seller_profiles SET (security_invoker = off);
