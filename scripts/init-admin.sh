#!/bin/bash
# Initialize admin users (idempotent)

set -e

echo "Initializing admin users..."

# Check if we have database URL
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable not set"
    echo "Please set it like: export DATABASE_URL=postgresql://..."
    exit 1
fi

# SQL to assign roles
psql $DATABASE_URL << 'EOF'
-- Assign super_admin to admin@example.com
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@example.com';
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the action
    INSERT INTO public.role_audit (user_id, action, role, performed_by, metadata)
    VALUES (admin_id, 'role_assigned', 'super_admin', admin_id, '{"source": "init-script"}');
    
    RAISE NOTICE 'Super admin role assigned to admin@example.com';
  ELSE
    RAISE NOTICE 'User admin@example.com not found. Please sign up first.';
  END IF;
END $$;

-- Assign doctor role to test@example.com
DO $$
DECLARE
  test_id uuid;
BEGIN
  SELECT id INTO test_id FROM auth.users WHERE email = 'test@example.com';
  
  IF test_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (test_id, 'doctor')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the action
    INSERT INTO public.role_audit (user_id, action, role, performed_by, metadata)
    VALUES (test_id, 'role_assigned', 'doctor', test_id, '{"source": "init-script"}');
    
    RAISE NOTICE 'Doctor role assigned to test@example.com';
  ELSE
    RAISE NOTICE 'User test@example.com not found. Please sign up first.';
  END IF;
END $$;
EOF

echo "✓ Admin initialization complete!"
echo ""
echo "Verify roles with:"
echo "psql \$DATABASE_URL -c \"SELECT p.email, ur.role FROM user_roles ur JOIN profiles p ON p.id = ur.user_id ORDER BY p.email;\""
