
-- Drop and recreate the view with more fields (but no PII)
DROP VIEW IF EXISTS public.public_seller_profiles;

CREATE VIEW public.public_seller_profiles AS
SELECT user_id, display_name, avatar_url, bio, location, rating, total_reviews, is_verified, account_type, business_name
FROM public.profiles;

GRANT SELECT ON public.public_seller_profiles TO anon, authenticated;

-- Tighten profiles RLS: own profile or admin only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin(auth.uid()));
