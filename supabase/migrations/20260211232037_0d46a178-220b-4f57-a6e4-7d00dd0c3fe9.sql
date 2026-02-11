
-- Create table for tracking affiliate link clicks
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  ip_address text,
  user_agent text,
  device_type text, -- mobile, tablet, desktop
  os_name text, -- Android, iOS, Windows, macOS, Linux
  browser_name text,
  country text,
  page_url text,
  converted boolean DEFAULT false,
  converted_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can insert (anonymous clicks), affiliates see own, admins see all
CREATE POLICY "Anyone can insert clicks"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Affiliates can view own clicks"
  ON public.affiliate_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = affiliate_clicks.affiliate_id
        AND affiliates.user_id = auth.uid()
    )
    OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can manage clicks"
  ON public.affiliate_clicks FOR ALL
  USING (is_admin(auth.uid()));

-- Create index for fast lookups
CREATE INDEX idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at);

-- Add commission_type setting (one_time or recurring)
INSERT INTO public.platform_settings (key, value, description)
VALUES ('affiliate_commission_type', 'one_time', 'Commission type: one_time or recurring')
ON CONFLICT (key) DO NOTHING;
