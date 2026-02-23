-- Drop the restrictive SELECT policy and replace with a public one
-- Platform settings like contact info, social links, copyright are public config
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.platform_settings;

CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings
FOR SELECT
USING (true);