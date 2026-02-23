
-- Add sequential user number to profiles
ALTER TABLE public.profiles ADD COLUMN user_number SERIAL;

-- Create a unique index on user_number
CREATE UNIQUE INDEX idx_profiles_user_number ON public.profiles (user_number);
