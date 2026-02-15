
-- Fix 1: career_applications - restrict to authenticated or at least validate required fields
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.career_applications;
CREATE POLICY "Anyone can submit applications"
ON public.career_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  full_name IS NOT NULL AND email IS NOT NULL AND opening_id IS NOT NULL
);

-- Fix 2: contact_submissions - restrict to validate required fields
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND email IS NOT NULL AND subject IS NOT NULL AND message IS NOT NULL
);

-- Fix 3: Create a function to mask phone numbers for admin views
CREATE OR REPLACE FUNCTION public.mask_phone(phone_number text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN phone_number IS NULL THEN NULL
    WHEN length(phone_number) <= 4 THEN '****'
    ELSE left(phone_number, 3) || repeat('*', length(phone_number) - 6) || right(phone_number, 3)
  END;
$$;
