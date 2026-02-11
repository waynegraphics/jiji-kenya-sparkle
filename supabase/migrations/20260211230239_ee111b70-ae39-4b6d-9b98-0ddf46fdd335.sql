
-- Table to store user-submitted custom field values for admin review
CREATE TABLE public.custom_field_values (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug text NOT NULL,
  field_name text NOT NULL,
  field_value text NOT NULL,
  submitted_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_slug, field_name, field_value)
);

ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved values" ON public.custom_field_values
  FOR SELECT USING (status = 'approved' OR auth.uid() = submitted_by OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can submit values" ON public.custom_field_values
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all values" ON public.custom_field_values
  FOR ALL USING (is_admin(auth.uid()));
