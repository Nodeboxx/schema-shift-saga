-- Add sex column to profiles table for gender-specific avatars
ALTER TABLE public.profiles 
ADD COLUMN sex TEXT CHECK (sex IN ('male', 'female', 'other'));

COMMENT ON COLUMN public.profiles.sex IS 'Gender of the doctor for avatar display';

-- Update existing demo doctor to have a gender
UPDATE public.profiles 
SET sex = 'male' 
WHERE email = 'doctor@example.com';
