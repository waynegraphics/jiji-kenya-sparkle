
-- Add account_type to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'customer';

-- Kenya Counties
CREATE TABLE public.kenya_counties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.kenya_counties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view counties" ON public.kenya_counties FOR SELECT USING (true);
CREATE POLICY "Admins can manage counties" ON public.kenya_counties FOR ALL USING (is_admin(auth.uid()));

-- Kenya Towns
CREATE TABLE public.kenya_towns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES public.kenya_counties(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(county_id, slug)
);
ALTER TABLE public.kenya_towns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view towns" ON public.kenya_towns FOR SELECT USING (true);
CREATE POLICY "Admins can manage towns" ON public.kenya_towns FOR ALL USING (is_admin(auth.uid()));

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  related_id text,
  related_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Seller Verifications table
CREATE TABLE public.seller_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  id_front_url text,
  id_back_url text,
  passport_photo_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verification" ON public.seller_verifications FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Users can create own verification" ON public.seller_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own verification" ON public.seller_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all verifications" ON public.seller_verifications FOR ALL USING (is_admin(auth.uid()));

-- Platform Settings table (for registration fee, etc.)
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (is_admin(auth.uid()));

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('seller_registration_fee', '250', 'Fee in KES to register as a seller'),
  ('seller_registration_duration_days', '30', 'Number of days for initial seller registration'),
  ('require_seller_verification', 'true', 'Whether sellers must upload ID for verification');

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for verification storage - users can upload their own, admins can view all
CREATE POLICY "Users can upload own verification docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verifications' AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin(auth.uid())));

CREATE POLICY "Admins can view all verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verifications' AND is_admin(auth.uid()));

-- Trigger for seller_verifications updated_at
CREATE TRIGGER update_seller_verifications_updated_at
BEFORE UPDATE ON public.seller_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
