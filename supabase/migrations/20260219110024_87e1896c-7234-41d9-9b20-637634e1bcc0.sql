
-- 1. Fix profiles: Replace permissive SELECT with authenticated-only, 
--    and create a safe public view for seller profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Authenticated users can see all profiles (needed for messaging, seller pages)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create a safe public view that hides PII for unauthenticated access
CREATE OR REPLACE VIEW public.public_seller_profiles AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  bio,
  business_name,
  location,
  rating,
  total_reviews,
  is_verified,
  account_type,
  created_at
FROM public.profiles;

-- 2. Fix messages storage bucket - make it private
UPDATE storage.buckets SET public = false WHERE id = 'messages';

-- 3. Add storage policy so only sender/receiver can access message files
CREATE POLICY "Users can view their own message files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'messages' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload message files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'messages' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
