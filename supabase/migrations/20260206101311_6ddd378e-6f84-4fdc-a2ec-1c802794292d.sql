-- =====================================================
-- COMPREHENSIVE CATEGORY SYSTEM MIGRATION
-- =====================================================

-- 1. CREATE MAIN CATEGORIES TABLE
CREATE TABLE public.main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CREATE SUB-CATEGORIES TABLE
CREATE TABLE public.sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category_id UUID NOT NULL REFERENCES public.main_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(main_category_id, slug)
);

-- 3. VEHICLE MAKES TABLE (relational)
CREATE TABLE public.vehicle_makes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. VEHICLE MODELS TABLE (relational)
CREATE TABLE public.vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id UUID NOT NULL REFERENCES public.vehicle_makes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(make_id, name)
);

-- =====================================================
-- CATEGORY-SPECIFIC LISTINGS TABLES
-- =====================================================

-- 5. BASE LISTING INFO (common fields for all categories)
CREATE TABLE public.base_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  main_category_id UUID NOT NULL REFERENCES public.main_categories(id),
  sub_category_id UUID REFERENCES public.sub_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'KES',
  is_negotiable BOOLEAN DEFAULT true,
  location TEXT NOT NULL DEFAULT 'Nairobi',
  latitude NUMERIC,
  longitude NUMERIC,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'pending', 'rejected')),
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  bumped_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. VEHICLES LISTINGS (Cars, Motorcycles, etc.)
CREATE TABLE public.vehicle_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle', 'truck', 'bus', 'van', 'trailer', 'boat', 'heavy_equipment')),
  make_id UUID REFERENCES public.vehicle_makes(id),
  model_id UUID REFERENCES public.vehicle_models(id),
  year_of_manufacture INTEGER,
  trim TEXT,
  condition TEXT CHECK (condition IN ('brand_new', 'foreign_used', 'locally_used')),
  exterior_color TEXT,
  interior_color TEXT,
  transmission TEXT CHECK (transmission IN ('automatic', 'manual', 'cvt', 'semi_automatic')),
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'lpg')),
  drivetrain TEXT CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
  engine_size_cc INTEGER,
  cylinders INTEGER,
  horsepower INTEGER,
  mileage INTEGER,
  body_type TEXT,
  seats INTEGER,
  doors INTEGER,
  vin_chassis TEXT,
  is_registered BOOLEAN DEFAULT false,
  registration_number TEXT,
  registration_year INTEGER,
  exchange_possible BOOLEAN DEFAULT false,
  key_features TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PROPERTY LISTINGS
CREATE TABLE public.property_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'land', 'commercial', 'office', 'warehouse', 'shop', 'room')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('for_sale', 'for_rent', 'short_stay')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  is_furnished BOOLEAN DEFAULT false,
  furnishing_type TEXT CHECK (furnishing_type IN ('unfurnished', 'semi_furnished', 'fully_furnished')),
  size_sqm NUMERIC,
  plot_size_sqm NUMERIC,
  floor_number INTEGER,
  total_floors INTEGER,
  parking_spaces INTEGER,
  year_built INTEGER,
  amenities TEXT[],
  nearby_facilities TEXT[],
  agency_fee TEXT,
  service_charge NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. JOBS LISTINGS
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'temporary', 'internship', 'volunteer', 'freelance')),
  industry TEXT NOT NULL,
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive', 'no_experience')),
  min_experience_years INTEGER,
  education_level TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_period TEXT CHECK (salary_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
  is_salary_negotiable BOOLEAN DEFAULT true,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  company_website TEXT,
  application_method TEXT CHECK (application_method IN ('email', 'phone', 'website', 'in_person', 'apply_here')),
  application_email TEXT,
  application_url TEXT,
  application_deadline TIMESTAMPTZ,
  required_skills TEXT[],
  benefits TEXT[],
  is_remote BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ELECTRONICS LISTINGS
CREATE TABLE public.electronics_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  storage TEXT,
  ram TEXT,
  screen_size TEXT,
  processor TEXT,
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair', 'for_parts')),
  has_warranty BOOLEAN DEFAULT false,
  warranty_duration TEXT,
  accessories_included TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. PHONES & TABLETS LISTINGS
CREATE TABLE public.phone_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('smartphone', 'tablet', 'smartwatch', 'accessories')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  storage TEXT,
  ram TEXT,
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair', 'for_parts')),
  has_warranty BOOLEAN DEFAULT false,
  warranty_duration TEXT,
  color TEXT,
  is_unlocked BOOLEAN DEFAULT true,
  accessories_included TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. FASHION LISTINGS
CREATE TABLE public.fashion_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  gender TEXT NOT NULL CHECK (gender IN ('men', 'women', 'unisex', 'kids_boys', 'kids_girls')),
  clothing_type TEXT NOT NULL,
  size TEXT,
  material TEXT,
  brand TEXT,
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair')),
  color TEXT,
  occasion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. FURNITURE & APPLIANCES LISTINGS
CREATE TABLE public.furniture_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  brand TEXT,
  material TEXT,
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair')),
  dimensions TEXT,
  color TEXT,
  style TEXT,
  assembly_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. ANIMALS & PETS LISTINGS
CREATE TABLE public.pet_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  animal_type TEXT NOT NULL,
  breed TEXT,
  age_months INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  is_vaccinated BOOLEAN DEFAULT false,
  is_neutered BOOLEAN DEFAULT false,
  health_certificate BOOLEAN DEFAULT false,
  includes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. BABIES & KIDS LISTINGS
CREATE TABLE public.kids_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  brand TEXT,
  age_range TEXT,
  gender TEXT CHECK (gender IN ('boys', 'girls', 'unisex')),
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair')),
  safety_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. BEAUTY & PERSONAL CARE LISTINGS
CREATE TABLE public.beauty_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  brand TEXT,
  usage_type TEXT CHECK (usage_type IN ('personal', 'professional', 'both')),
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good')),
  expiry_date DATE,
  is_organic BOOLEAN DEFAULT false,
  skin_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. SERVICES LISTINGS
CREATE TABLE public.service_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  availability TEXT,
  pricing_model TEXT CHECK (pricing_model IN ('hourly', 'daily', 'fixed', 'negotiable', 'free')),
  experience_years INTEGER,
  is_certified BOOLEAN DEFAULT false,
  certifications TEXT[],
  service_area TEXT[],
  languages TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. COMMERCIAL EQUIPMENT LISTINGS
CREATE TABLE public.equipment_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair', 'for_parts')),
  hours_used INTEGER,
  power_source TEXT,
  capacity TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. FOOD, AGRICULTURE & FARMING LISTINGS
CREATE TABLE public.agriculture_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  is_organic BOOLEAN DEFAULT false,
  harvest_date DATE,
  origin TEXT,
  certifications TEXT[],
  minimum_order NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. LEISURE & ACTIVITIES LISTINGS
CREATE TABLE public.leisure_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  brand TEXT,
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair')),
  includes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. REPAIR & CONSTRUCTION LISTINGS
CREATE TABLE public.construction_listings (
  id UUID PRIMARY KEY REFERENCES public.base_listings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  material_type TEXT,
  brand TEXT,
  condition TEXT CHECK (condition IN ('brand_new', 'like_new', 'good', 'fair')),
  quantity NUMERIC,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electronics_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furniture_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beauty_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agriculture_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leisure_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_listings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - Categories (Public Read)
-- =====================================================

CREATE POLICY "Anyone can view active main categories"
ON public.main_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage main categories"
ON public.main_categories FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active sub categories"
ON public.sub_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage sub categories"
ON public.sub_categories FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view vehicle makes"
ON public.vehicle_makes FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage vehicle makes"
ON public.vehicle_makes FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view vehicle models"
ON public.vehicle_models FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage vehicle models"
ON public.vehicle_models FOR ALL
USING (is_admin(auth.uid()));

-- =====================================================
-- RLS POLICIES - Base Listings
-- =====================================================

CREATE POLICY "Anyone can view active listings"
ON public.base_listings FOR SELECT
USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own listings"
ON public.base_listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON public.base_listings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON public.base_listings FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - Category Specific Listings (inherit from base)
-- =====================================================

-- Vehicle Listings
CREATE POLICY "Anyone can view vehicle listings"
ON public.vehicle_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage vehicle listings"
ON public.vehicle_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = vehicle_listings.id AND user_id = auth.uid()));

-- Property Listings
CREATE POLICY "Anyone can view property listings"
ON public.property_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage property listings"
ON public.property_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = property_listings.id AND user_id = auth.uid()));

-- Job Listings
CREATE POLICY "Anyone can view job listings"
ON public.job_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage job listings"
ON public.job_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = job_listings.id AND user_id = auth.uid()));

-- Electronics Listings
CREATE POLICY "Anyone can view electronics listings"
ON public.electronics_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage electronics listings"
ON public.electronics_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = electronics_listings.id AND user_id = auth.uid()));

-- Phone Listings
CREATE POLICY "Anyone can view phone listings"
ON public.phone_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage phone listings"
ON public.phone_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = phone_listings.id AND user_id = auth.uid()));

-- Fashion Listings
CREATE POLICY "Anyone can view fashion listings"
ON public.fashion_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage fashion listings"
ON public.fashion_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = fashion_listings.id AND user_id = auth.uid()));

-- Furniture Listings
CREATE POLICY "Anyone can view furniture listings"
ON public.furniture_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage furniture listings"
ON public.furniture_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = furniture_listings.id AND user_id = auth.uid()));

-- Pet Listings
CREATE POLICY "Anyone can view pet listings"
ON public.pet_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage pet listings"
ON public.pet_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = pet_listings.id AND user_id = auth.uid()));

-- Kids Listings
CREATE POLICY "Anyone can view kids listings"
ON public.kids_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage kids listings"
ON public.kids_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = kids_listings.id AND user_id = auth.uid()));

-- Beauty Listings
CREATE POLICY "Anyone can view beauty listings"
ON public.beauty_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage beauty listings"
ON public.beauty_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = beauty_listings.id AND user_id = auth.uid()));

-- Service Listings
CREATE POLICY "Anyone can view service listings"
ON public.service_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage service listings"
ON public.service_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = service_listings.id AND user_id = auth.uid()));

-- Equipment Listings
CREATE POLICY "Anyone can view equipment listings"
ON public.equipment_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage equipment listings"
ON public.equipment_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = equipment_listings.id AND user_id = auth.uid()));

-- Agriculture Listings
CREATE POLICY "Anyone can view agriculture listings"
ON public.agriculture_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage agriculture listings"
ON public.agriculture_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = agriculture_listings.id AND user_id = auth.uid()));

-- Leisure Listings
CREATE POLICY "Anyone can view leisure listings"
ON public.leisure_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage leisure listings"
ON public.leisure_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = leisure_listings.id AND user_id = auth.uid()));

-- Construction Listings
CREATE POLICY "Anyone can view construction listings"
ON public.construction_listings FOR SELECT USING (true);

CREATE POLICY "Users can manage construction listings"
ON public.construction_listings FOR ALL
USING (EXISTS (SELECT 1 FROM public.base_listings WHERE id = construction_listings.id AND user_id = auth.uid()));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_base_listings_user ON public.base_listings(user_id);
CREATE INDEX idx_base_listings_category ON public.base_listings(main_category_id);
CREATE INDEX idx_base_listings_subcategory ON public.base_listings(sub_category_id);
CREATE INDEX idx_base_listings_status ON public.base_listings(status);
CREATE INDEX idx_base_listings_location ON public.base_listings(location);
CREATE INDEX idx_base_listings_price ON public.base_listings(price);
CREATE INDEX idx_base_listings_created ON public.base_listings(created_at DESC);
CREATE INDEX idx_base_listings_featured ON public.base_listings(is_featured) WHERE is_featured = true;

CREATE INDEX idx_sub_categories_main ON public.sub_categories(main_category_id);
CREATE INDEX idx_vehicle_models_make ON public.vehicle_models(make_id);

CREATE INDEX idx_vehicle_listings_type ON public.vehicle_listings(vehicle_type);
CREATE INDEX idx_vehicle_listings_make ON public.vehicle_listings(make_id);
CREATE INDEX idx_vehicle_listings_year ON public.vehicle_listings(year_of_manufacture);

CREATE INDEX idx_property_listings_type ON public.property_listings(property_type);
CREATE INDEX idx_property_listings_listing_type ON public.property_listings(listing_type);
CREATE INDEX idx_property_listings_bedrooms ON public.property_listings(bedrooms);

CREATE INDEX idx_job_listings_type ON public.job_listings(job_type);
CREATE INDEX idx_job_listings_industry ON public.job_listings(industry);

-- =====================================================
-- TRIGGER FOR updated_at
-- =====================================================

CREATE TRIGGER update_base_listings_updated_at
BEFORE UPDATE ON public.base_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_main_categories_updated_at
BEFORE UPDATE ON public.main_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_categories_updated_at
BEFORE UPDATE ON public.sub_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();