-- Create profiles table for seller information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  location TEXT DEFAULT 'Nairobi',
  avatar_url TEXT,
  bio TEXT,
  rating NUMERIC(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create categories enum
CREATE TYPE public.listing_category AS ENUM (
  'vehicles',
  'property',
  'phones',
  'fashion',
  'services',
  'jobs',
  'furniture',
  'pets',
  'kids',
  'sports',
  'electronics',
  'health'
);

-- Create listings table for ads
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  category listing_category NOT NULL,
  location TEXT NOT NULL DEFAULT 'Nairobi',
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  is_negotiable BOOLEAN DEFAULT true,
  condition TEXT DEFAULT 'Used',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Listings are viewable by everyone
CREATE POLICY "Listings are viewable by everyone"
ON public.listings
FOR SELECT
USING (true);

-- Authenticated users can create listings
CREATE POLICY "Authenticated users can create listings"
ON public.listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings"
ON public.listings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
ON public.listings
FOR DELETE
USING (auth.uid() = user_id);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, listing_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

-- Storage policies for listings bucket
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);