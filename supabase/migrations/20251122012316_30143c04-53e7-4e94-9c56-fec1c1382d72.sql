-- Ensure clinic_admin role exists in app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'clinic_admin') THEN
    ALTER TYPE app_role ADD VALUE 'clinic_admin';
  END IF;
END $$;

-- Create function to handle clinic signup
CREATE OR REPLACE FUNCTION handle_clinic_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    
    -- Create clinic record
    INSERT INTO clinics (
      name,
      slug,
      owner_id,
      subscription_tier,
      subscription_status,
      email
    ) VALUES (
      v_clinic_name,
      v_clinic_slug,
      NEW.id,
      'enterprise',
      'pending_approval',
      NEW.email
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
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_clinic ON auth.users;

-- Create trigger for clinic signup
CREATE TRIGGER on_auth_user_created_clinic
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_clinic_signup();

-- Update clinics table to add pending_approval status
ALTER TABLE clinics ALTER COLUMN subscription_status DROP DEFAULT;
ALTER TABLE clinics ALTER COLUMN subscription_status SET DEFAULT 'pending_approval';