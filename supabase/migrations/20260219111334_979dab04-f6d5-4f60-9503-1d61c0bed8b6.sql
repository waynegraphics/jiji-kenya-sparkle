
-- Rate limiting: create a table to track form submissions by IP/fingerprint
CREATE TABLE IF NOT EXISTS public.rate_limit_tracker (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type text NOT NULL,
  identifier text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Auto-cleanup old entries (older than 1 hour)
CREATE INDEX idx_rate_limit_created ON public.rate_limit_tracker (created_at);
CREATE INDEX idx_rate_limit_action ON public.rate_limit_tracker (action_type, identifier, created_at);

-- Enable RLS
ALTER TABLE public.rate_limit_tracker ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for tracking)
CREATE POLICY "Anyone can insert rate limit entries"
ON public.rate_limit_tracker FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can manage rate limits"
ON public.rate_limit_tracker FOR ALL
USING (is_admin(auth.uid()));

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action text,
  p_identifier text,
  p_max_requests int DEFAULT 5,
  p_window_minutes int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count int;
BEGIN
  -- Clean old entries
  DELETE FROM rate_limit_tracker 
  WHERE created_at < now() - (p_window_minutes || ' minutes')::interval;

  -- Count recent requests
  SELECT COUNT(*) INTO v_count
  FROM rate_limit_tracker
  WHERE action_type = p_action 
    AND identifier = p_identifier
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;

  -- If under limit, record and allow
  IF v_count < p_max_requests THEN
    INSERT INTO rate_limit_tracker (action_type, identifier) VALUES (p_action, p_identifier);
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
