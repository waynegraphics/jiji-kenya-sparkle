
-- Replace permissive INSERT with more restrictive one that validates inputs
DROP POLICY IF EXISTS "Anyone can insert rate limit entries" ON public.rate_limit_tracker;

-- Only allow inserts through the check_rate_limit function (SECURITY DEFINER)
-- Remove direct insert access entirely since the function handles it
REVOKE INSERT ON public.rate_limit_tracker FROM anon, authenticated;
