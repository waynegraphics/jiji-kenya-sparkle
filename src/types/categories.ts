// Category System Types

export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubCategory {
  id: string;
  main_category_id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleMake {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface VehicleModel {
  id: string;
  make_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

// Base Listing (shared fields)
export interface BaseListing {
  id: string;
  user_id: string;
  main_category_id: string;
  sub_category_id: string | null;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  is_negotiable: boolean;
  location: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  status: 'active' | 'sold' | 'expired' | 'pending' | 'rejected';
  views: number;
  is_featured: boolean;
  is_urgent: boolean;
  featured_until: string | null;
  bumped_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  main_category?: MainCategory;
  sub_category?: SubCategory;
}

// Vehicle Listing specific fields
export interface VehicleListing {
  id: string;
  vehicle_type: 'car' | 'motorcycle' | 'truck' | 'bus' | 'van' | 'trailer' | 'boat' | 'heavy_equipment';
  make_id: string | null;
  model_id: string | null;
  year_of_manufacture: number | null;
  trim: string | null;
  condition: 'brand_new' | 'foreign_used' | 'locally_used' | null;
  exterior_color: string | null;
  interior_color: string | null;
  transmission: 'automatic' | 'manual' | 'cvt' | 'semi_automatic' | null;
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | null;
  drivetrain: 'fwd' | 'rwd' | 'awd' | '4wd' | null;
  engine_size_cc: number | null;
  cylinders: number | null;
  horsepower: number | null;
  mileage: number | null;
  body_type: string | null;
  seats: number | null;
  doors: number | null;
  vin_chassis: string | null;
  is_registered: boolean;
  registration_number: string | null;
  registration_year: number | null;
  exchange_possible: boolean;
  key_features: string[] | null;
  // Joined data
  make?: VehicleMake;
  model?: VehicleModel;
}

// Property Listing specific fields
export interface PropertyListing {
  id: string;
  property_type: 'apartment' | 'house' | 'land' | 'commercial' | 'office' | 'warehouse' | 'shop' | 'room';
  listing_type: 'for_sale' | 'for_rent' | 'short_stay';
  bedrooms: number | null;
  bathrooms: number | null;
  is_furnished: boolean;
  furnishing_type: 'unfurnished' | 'semi_furnished' | 'fully_furnished' | null;
  size_sqm: number | null;
  plot_size_sqm: number | null;
  floor_number: number | null;
  total_floors: number | null;
  parking_spaces: number | null;
  year_built: number | null;
  amenities: string[] | null;
  nearby_facilities: string[] | null;
  agency_fee: string | null;
  service_charge: number | null;
}

// Job Listing specific fields
export interface JobListing {
  id: string;
  job_title: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship' | 'volunteer' | 'freelance';
  industry: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'executive' | 'no_experience' | null;
  min_experience_years: number | null;
  education_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  is_salary_negotiable: boolean;
  company_name: string;
  company_logo: string | null;
  company_website: string | null;
  application_method: 'email' | 'phone' | 'website' | 'in_person' | 'apply_here' | null;
  application_email: string | null;
  application_url: string | null;
  application_deadline: string | null;
  required_skills: string[] | null;
  benefits: string[] | null;
  is_remote: boolean;
}

// Electronics Listing specific fields
export interface ElectronicsListing {
  id: string;
  device_type: string;
  brand: string;
  model: string;
  storage: string | null;
  ram: string | null;
  screen_size: string | null;
  processor: string | null;
  condition: 'brand_new' | 'like_new' | 'good' | 'fair' | 'for_parts' | null;
  has_warranty: boolean;
  warranty_duration: string | null;
  accessories_included: string[] | null;
}

// Phone Listing specific fields
export interface PhoneListing {
  id: string;
  device_type: 'smartphone' | 'tablet' | 'smartwatch' | 'accessories';
  brand: string;
  model: string;
  storage: string | null;
  ram: string | null;
  condition: 'brand_new' | 'like_new' | 'good' | 'fair' | 'for_parts' | null;
  has_warranty: boolean;
  warranty_duration: string | null;
  color: string | null;
  is_unlocked: boolean;
  accessories_included: string[] | null;
}

// Fashion Listing specific fields
export interface FashionListing {
  id: string;
  gender: 'men' | 'women' | 'unisex' | 'kids_boys' | 'kids_girls';
  clothing_type: string;
  size: string | null;
  material: string | null;
  brand: string | null;
  condition: 'brand_new' | 'like_new' | 'good' | 'fair' | null;
  color: string | null;
  occasion: string | null;
}

// Furniture Listing specific fields
export interface FurnitureListing {
  id: string;
  item_type: string;
  brand: string | null;
  material: string | null;
  condition: 'brand_new' | 'like_new' | 'good' | 'fair' | null;
  dimensions: string | null;
  color: string | null;
  style: string | null;
  assembly_required: boolean;
}

// Pet Listing specific fields
export interface PetListing {
  id: string;
  animal_type: string;
  breed: string | null;
  age_months: number | null;
  gender: 'male' | 'female' | 'unknown' | null;
  is_vaccinated: boolean;
  is_neutered: boolean;
  health_certificate: boolean;
  includes: string[] | null;
}

// Kids Listing specific fields
export interface KidsListing {
  id: string;
  item_type: string;
  brand: string | null;
  age_range: string | null;
  gender: 'boys' | 'girls' | 'unisex' | null;
  condition: 'brand_new' | 'like_new' | 'good' | 'fair' | null;
  safety_certified: boolean;
}

// Service Listing specific fields
export interface ServiceListing {
  id: string;
  service_type: string;
  availability: string | null;
  pricing_model: 'hourly' | 'daily' | 'fixed' | 'negotiable' | 'free' | null;
  experience_years: number | null;
  is_certified: boolean;
  certifications: string[] | null;
  service_area: string[] | null;
  languages: string[] | null;
}

// Combined Listing with category-specific data
export interface FullListing extends BaseListing {
  vehicle_listing?: VehicleListing;
  property_listing?: PropertyListing;
  job_listing?: JobListing;
  electronics_listing?: ElectronicsListing;
  phone_listing?: PhoneListing;
  fashion_listing?: FashionListing;
  furniture_listing?: FurnitureListing;
  pet_listing?: PetListing;
  kids_listing?: KidsListing;
  service_listing?: ServiceListing;
}

// Form data types for creating listings
export interface BaseListingFormData {
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  location: string;
  images: string[];
  is_urgent: boolean;
}

export interface VehicleFormData extends BaseListingFormData {
  vehicle_type: VehicleListing['vehicle_type'];
  make_id: string;
  model_id: string;
  year_of_manufacture: number;
  trim?: string;
  condition: VehicleListing['condition'];
  exterior_color?: string;
  interior_color?: string;
  transmission?: VehicleListing['transmission'];
  fuel_type?: VehicleListing['fuel_type'];
  drivetrain?: VehicleListing['drivetrain'];
  engine_size_cc?: number;
  cylinders?: number;
  horsepower?: number;
  mileage?: number;
  body_type?: string;
  seats?: number;
  doors?: number;
  vin_chassis?: string;
  is_registered: boolean;
  registration_number?: string;
  registration_year?: number;
  exchange_possible: boolean;
  key_features?: string[];
}

export interface PropertyFormData extends BaseListingFormData {
  property_type: PropertyListing['property_type'];
  listing_type: PropertyListing['listing_type'];
  bedrooms?: number;
  bathrooms?: number;
  is_furnished: boolean;
  furnishing_type?: PropertyListing['furnishing_type'];
  size_sqm?: number;
  plot_size_sqm?: number;
  floor_number?: number;
  total_floors?: number;
  parking_spaces?: number;
  year_built?: number;
  amenities?: string[];
  nearby_facilities?: string[];
  agency_fee?: string;
  service_charge?: number;
}

export interface JobFormData extends Omit<BaseListingFormData, 'price' | 'is_negotiable'> {
  job_title: string;
  job_type: JobListing['job_type'];
  industry: string;
  experience_level?: JobListing['experience_level'];
  min_experience_years?: number;
  education_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: JobListing['salary_period'];
  is_salary_negotiable: boolean;
  company_name: string;
  company_logo?: string;
  company_website?: string;
  application_method?: JobListing['application_method'];
  application_email?: string;
  application_url?: string;
  application_deadline?: string;
  required_skills?: string[];
  benefits?: string[];
  is_remote: boolean;
}
