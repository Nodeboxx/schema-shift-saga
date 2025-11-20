-- Add medical council logo and registration number fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS council_logo_url text,
ADD COLUMN IF NOT EXISTS registration_number text;