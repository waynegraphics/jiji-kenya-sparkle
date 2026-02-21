
-- Allow authenticated users to view any profile (they need contact info for messaging/calling)
-- PII is only exposed to logged-in users, not to anonymous/public visitors
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- The previous own-profile policy is now redundant but harmless, drop for clarity
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
