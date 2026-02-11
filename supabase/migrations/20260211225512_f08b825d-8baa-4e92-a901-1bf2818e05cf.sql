-- Add business-specific fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Update account_type to support 'customer', 'seller', 'business'
-- (already uses text field, no enum change needed)