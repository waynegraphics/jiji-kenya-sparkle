
-- Reviews table for seller/agent reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_review UNIQUE (reviewer_id, seller_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

-- Users can create reviews (not for themselves)
CREATE POLICY "Users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != seller_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = reviewer_id);

-- Trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update seller rating after review changes
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating NUMERIC;
  review_count INTEGER;
  target_seller_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_seller_id := OLD.seller_id;
  ELSE
    target_seller_id := NEW.seller_id;
  END IF;

  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE seller_id = target_seller_id;

  UPDATE public.profiles
  SET rating = ROUND(avg_rating, 1),
      total_reviews = review_count
  WHERE user_id = target_seller_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers for rating updates
CREATE TRIGGER update_rating_on_insert
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating();

CREATE TRIGGER update_rating_on_update
AFTER UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating();

CREATE TRIGGER update_rating_on_delete
AFTER DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating();
