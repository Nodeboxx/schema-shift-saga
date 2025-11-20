-- Seed Users and Roles
-- This script should be run AFTER users have signed up through the application
-- It assigns the appropriate roles to test users

-- Instructions:
-- 1. First, create users through the application signup UI:
--    - admin@example.com (password: admin123456)
--    - test@example.com (password: test123456)
-- 2. Then run this script to assign roles:
--    psql $DATABASE_URL -f scripts/seed-users.sql

-- Assign super_admin role to admin@example.com
DO $$
DECLARE
  admin_id uuid;
  test_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@example.com';
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Super admin role assigned to admin@example.com';
  ELSE
    RAISE NOTICE 'User admin@example.com not found. Please sign up first.';
  END IF;

  -- Get test user ID
  SELECT id INTO test_id FROM auth.users WHERE email = 'test@example.com';
  
  IF test_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (test_id, 'doctor')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Doctor role assigned to test@example.com';
  ELSE
    RAISE NOTICE 'User test@example.com not found. Please sign up first.';
  END IF;
END $$;
