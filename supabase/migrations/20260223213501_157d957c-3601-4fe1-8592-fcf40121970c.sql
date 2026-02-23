
-- Add status column to reviews for moderation
ALTER TABLE public.reviews ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add admin_notes column for rejection reasons
ALTER TABLE public.reviews ADD COLUMN admin_notes text;

-- Update the public SELECT policy to only show approved reviews (or own reviews)
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews"
ON public.reviews FOR SELECT
USING (status = 'approved' OR auth.uid() = reviewer_id OR auth.uid() = seller_id OR is_admin(auth.uid()));

-- Allow admins to manage all reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews"
ON public.reviews FOR ALL
USING (is_admin(auth.uid()));
