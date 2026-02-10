
-- Create table to store M-Pesa Daraja API settings (singleton row)
CREATE TABLE public.mpesa_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_key text NOT NULL DEFAULT '',
  consumer_secret text NOT NULL DEFAULT '',
  passkey text NOT NULL DEFAULT '',
  shortcode text NOT NULL DEFAULT '',
  callback_url text NOT NULL DEFAULT '',
  environment text NOT NULL DEFAULT 'sandbox',
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mpesa_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read
CREATE POLICY "Admins can view mpesa settings"
  ON public.mpesa_settings FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only admins can insert
CREATE POLICY "Admins can insert mpesa settings"
  ON public.mpesa_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "Admins can update mpesa settings"
  ON public.mpesa_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Service role needs to read settings from edge functions
-- (service role bypasses RLS by default, so no extra policy needed)

-- Auto-update timestamp
CREATE TRIGGER update_mpesa_settings_updated_at
  BEFORE UPDATE ON public.mpesa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.mpesa_settings (consumer_key, consumer_secret, passkey, shortcode, callback_url, environment, is_enabled)
VALUES ('', '', '', '', '', 'sandbox', false);
