-- Update clinics table to set proper doctor limits based on plan
UPDATE public.clinics 
SET max_doctors = 50 
WHERE subscription_tier = 'enterprise';

-- Update to 1 for free tier
UPDATE public.clinics 
SET max_doctors = 1 
WHERE subscription_tier = 'free';

-- Add check constraint to ensure max_doctors is respected
-- This will be enforced at application level in the component

-- Create function to count active doctors in a clinic
CREATE OR REPLACE FUNCTION public.count_clinic_doctors(clinic_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.profiles
  WHERE clinic_id = clinic_uuid 
    AND role = 'doctor'
    AND is_active = true;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.count_clinic_doctors TO authenticated;