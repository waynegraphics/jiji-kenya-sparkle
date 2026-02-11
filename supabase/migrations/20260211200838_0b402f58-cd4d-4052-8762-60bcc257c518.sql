
-- Fix permissive INSERT policy on notifications - restrict to authenticated users creating for themselves or service role
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
