-- 1) Ensure enterprise clinics have correct doctor and patient limits
UPDATE public.clinics
SET max_doctors = 50,
    max_patients = NULL
WHERE subscription_tier = 'enterprise';

-- 2) Backfill clinic_members for existing clinic doctors
INSERT INTO public.clinic_members (clinic_id, user_id, role, is_active)
SELECT p.clinic_id, p.id, 'doctor'::public.app_role, COALESCE(p.is_active, true)
FROM public.profiles p
LEFT JOIN public.clinic_members cm
  ON cm.clinic_id = p.clinic_id AND cm.user_id = p.id
WHERE p.clinic_id IS NOT NULL
  AND p.role = 'doctor'
  AND cm.id IS NULL;

-- 3) Update handle_clinic_signup to set limits for new clinics
CREATE OR REPLACE FUNCTION public.handle_clinic_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_type text;
  v_clinic_name text;
  v_clinic_slug text;
BEGIN
  -- Get user type from metadata
  v_user_type := NEW.raw_user_meta_data->>'user_type';
  
  -- Only process if this is a clinic_admin signup
  IF v_user_type = 'clinic_admin' THEN
    -- Get clinic name from metadata (stored in specialty field during signup)
    v_clinic_name := NEW.raw_user_meta_data->>'specialty';
    
    IF v_clinic_name IS NULL OR v_clinic_name = '' THEN
      v_clinic_name := 'My Clinic';
    END IF;
    
    -- Generate slug from clinic name
    v_clinic_slug := LOWER(REGEXP_REPLACE(v_clinic_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_clinic_slug := TRIM(BOTH '-' FROM v_clinic_slug);
    
    -- Make slug unique by appending random string if needed
    IF EXISTS (SELECT 1 FROM clinics WHERE slug = v_clinic_slug) THEN
      v_clinic_slug := v_clinic_slug || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
    END IF;
    
    -- Create clinic record with enterprise limits
    INSERT INTO clinics (
      name,
      slug,
      owner_id,
      subscription_tier,
      subscription_status,
      email,
      max_doctors,
      max_patients
    ) VALUES (
      v_clinic_name,
      v_clinic_slug,
      NEW.id,
      'enterprise',
      'pending_approval',
      NEW.email,
      50,
      NULL
    );
    
    -- Assign clinic_admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'clinic_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update profile with clinic_admin role and enterprise tier
    UPDATE profiles 
    SET 
      role = 'clinic_admin',
      subscription_tier = 'enterprise',
      subscription_status = 'pending_approval',
      full_name = NEW.raw_user_meta_data->>'full_name'
    WHERE id = NEW.id;
  ELSE
    -- For doctors, assign doctor role
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'doctor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;