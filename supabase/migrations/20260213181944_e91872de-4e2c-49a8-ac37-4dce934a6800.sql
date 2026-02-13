
-- Dynamic form fields that admin can define per category
CREATE TABLE public.category_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text', -- text, number, select, checkbox, textarea
  options text[] DEFAULT '{}', -- for select/radio types
  is_required boolean DEFAULT false,
  is_searchable boolean DEFAULT false,
  display_order integer DEFAULT 0,
  placeholder text,
  help_text text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_slug, field_name)
);

ALTER TABLE public.category_form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage form fields"
ON public.category_form_fields FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active form fields"
ON public.category_form_fields FOR SELECT
USING (is_active = true);

-- Store dynamic field values for listings
CREATE TABLE public.listing_dynamic_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.base_listings(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES public.category_form_fields(id) ON DELETE CASCADE,
  field_value text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, field_id)
);

ALTER TABLE public.listing_dynamic_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dynamic field values"
ON public.listing_dynamic_fields FOR SELECT
USING (true);

CREATE POLICY "Users can manage own listing fields"
ON public.listing_dynamic_fields FOR ALL
USING (EXISTS (
  SELECT 1 FROM base_listings WHERE base_listings.id = listing_dynamic_fields.listing_id AND base_listings.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all dynamic fields"
ON public.listing_dynamic_fields FOR ALL
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_category_form_fields_updated_at
BEFORE UPDATE ON public.category_form_fields
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
