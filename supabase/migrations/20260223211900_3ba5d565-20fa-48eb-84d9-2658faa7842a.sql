-- Allow anyone (including anon) to read public profile data
CREATE POLICY "Anyone can view public profile data"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the old restrictive policies for read
DROP POLICY IF EXISTS "Users can view all profiles with limited data" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;