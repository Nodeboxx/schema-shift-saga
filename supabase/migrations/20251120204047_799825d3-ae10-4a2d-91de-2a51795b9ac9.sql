-- Fix audit logs relationships - remove foreign key constraints
ALTER TABLE public.role_audit DROP CONSTRAINT IF EXISTS role_audit_user_id_fkey;
ALTER TABLE public.role_audit DROP CONSTRAINT IF EXISTS role_audit_performed_by_fkey;

-- Fix impersonation sessions RLS policy
DROP POLICY IF EXISTS "Super admins can view impersonation sessions" ON public.impersonation_sessions;
DROP POLICY IF EXISTS "Super admins can insert impersonation sessions" ON public.impersonation_sessions;

CREATE POLICY "Super admins can manage impersonation sessions"
ON public.impersonation_sessions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Add better role management function
CREATE OR REPLACE FUNCTION public.manage_user_role(
  target_user_id uuid,
  target_role app_role,
  action text -- 'add' or 'remove'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only super admins can manage roles
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only super admins can manage roles';
  END IF;

  IF action = 'add' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, target_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the action
    INSERT INTO public.role_audit (user_id, action, role, performed_by, metadata)
    VALUES (target_user_id, 'role_assigned', target_role, auth.uid(), 
            jsonb_build_object('method', 'admin_panel'));
            
  ELSIF action = 'remove' THEN
    -- Prevent removing super_admin from admin@example.com
    IF target_role = 'super_admin' THEN
      DECLARE
        target_email text;
      BEGIN
        SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;
        IF target_email = 'admin@example.com' THEN
          RAISE EXCEPTION 'Cannot remove super_admin role from admin@example.com';
        END IF;
      END;
    END IF;
    
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = target_role;
    
    -- Log the action
    INSERT INTO public.role_audit (user_id, action, role, performed_by, metadata)
    VALUES (target_user_id, 'role_removed', target_role, auth.uid(),
            jsonb_build_object('method', 'admin_panel'));
  END IF;
END;
$$;

-- Seed initial CMS data if not exists
INSERT INTO public.cms_sections (section_name, title, content, display_order, is_published)
VALUES
  ('hero', 'Hero Section', 
   '{"title": "Modern Healthcare Management System", "subtitle": "Streamline your medical practice with AI-powered prescription writing, patient management, and clinic collaboration tools.", "cta_text": "Start Free Trial", "cta_secondary": "Watch Demo"}'::jsonb, 
   1, true),
  ('features', 'Features Section',
   '{"title": "Everything You Need", "subtitle": "Comprehensive tools for modern medical practices", "items": [{"title": "Smart Prescriptions", "description": "AI-powered prescription writing with voice input and medicine database", "icon": "FileText"}, {"title": "Patient Management", "description": "Complete patient records, history tracking, and appointment scheduling", "icon": "Users"}, {"title": "Clinic Collaboration", "description": "Multi-doctor support with role-based access and team features", "icon": "Building"}]}'::jsonb,
   2, true),
  ('pricing', 'Pricing Plans',
   '{"title": "Choose Your Plan", "subtitle": "Flexible pricing for practices of all sizes", "plans": [{"name": "Free", "price": 0, "period": "forever", "features": ["5 prescriptions/month", "Basic templates", "Patient records"]}, {"name": "Pro", "price": 29, "period": "month", "features": ["Unlimited prescriptions", "Voice typing", "Custom branding", "Priority support"]}, {"name": "Enterprise", "price": 99, "period": "month", "features": ["Everything in Pro", "Multi-doctor clinics", "API access", "Dedicated support"]}]}'::jsonb,
   3, true)
ON CONFLICT (section_name) DO NOTHING;