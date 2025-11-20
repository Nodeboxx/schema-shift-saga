-- Migration: Setup user roles and sample data
-- This migration creates the infrastructure for user roles
-- Note: Actual user creation must be done through Supabase Auth UI or signup
-- This migration only prepares the role assignment structure

-- Create a function to assign roles safely
CREATE OR REPLACE FUNCTION public.assign_user_role(user_email TEXT, user_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  -- If user exists, assign role
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Create a function to bootstrap admin on first login
CREATE OR REPLACE FUNCTION public.auto_assign_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign super_admin role to admin@example.com on profile creation
  IF NEW.email = 'admin@example.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Auto-assign doctor role to test@example.com on profile creation
  IF NEW.email = 'test@example.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'doctor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-assign roles on profile creation
DROP TRIGGER IF EXISTS auto_assign_roles_on_signup ON public.profiles;
CREATE TRIGGER auto_assign_roles_on_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_super_admin();

-- Add QR code URL column to prescriptions if not exists
ALTER TABLE public.prescriptions
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Create a function to generate QR code URL
CREATE OR REPLACE FUNCTION public.get_prescription_qr_url(prescription_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  hash TEXT;
  base_url TEXT;
BEGIN
  SELECT unique_hash INTO hash
  FROM public.prescriptions
  WHERE id = prescription_id;
  
  -- In production, this should be your actual domain
  base_url := 'https://yourdomain.com/verify/';
  
  RETURN base_url || hash;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON public.clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON public.clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_clinic_id ON public.prescriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);

-- Update RLS policy for profiles to allow super_admins to view all
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin') OR
  auth.uid() = id
);

-- Allow super admins to update any profile
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin') OR
  auth.uid() = id
);

-- Allow authenticated users to view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'));

-- Comment with instructions
COMMENT ON FUNCTION public.assign_user_role IS 'Use this function to assign roles to users. Example: SELECT assign_user_role(''user@example.com'', ''super_admin'');';