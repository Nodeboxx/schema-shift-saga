-- ================================================================
-- COMPREHENSIVE ENTERPRISE MIGRATION
-- Roles, Audit, CMS, SMTP, Email Templates, Notifications
-- ================================================================

-- 1. ROLE AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.role_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  role app_role,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.role_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit logs"
  ON public.role_audit FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- 2. RPC TO GET USER ROLES
CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id UUID)
RETURNS TABLE (role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = target_user_id;
$$;

-- 3. TRIGGER TO PREVENT SUPER_ADMIN REMOVAL
CREATE OR REPLACE FUNCTION public.prevent_admin_role_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email TEXT;
BEGIN
  -- Get email of user whose role is being deleted
  SELECT email INTO admin_email
  FROM auth.users
  WHERE id = OLD.user_id;

  -- Prevent deletion of super_admin role for admin@example.com
  IF OLD.role = 'super_admin' AND admin_email = 'admin@example.com' THEN
    RAISE EXCEPTION 'Cannot remove super_admin role from admin@example.com';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS prevent_admin_removal ON public.user_roles;
CREATE TRIGGER prevent_admin_removal
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_role_removal();

-- 4. SMTP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 587,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  use_tls BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id)
);

ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage SMTP settings"
  ON public.smtp_settings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Clinic admins can manage their SMTP"
  ON public.smtp_settings FOR ALL
  TO authenticated
  USING (
    clinic_id IN (
      SELECT id FROM public.clinics WHERE owner_id = auth.uid()
    )
  );

-- 5. EMAIL TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]',
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage email templates"
  ON public.email_templates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Clinic admins can manage their templates"
  ON public.email_templates FOR ALL
  TO authenticated
  USING (
    clinic_id IN (
      SELECT id FROM public.clinics WHERE owner_id = auth.uid()
    )
  );

-- 6. NOTIFICATIONS CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.notifications_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  event_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, channel, event_type)
);

ALTER TABLE public.notifications_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage notifications"
  ON public.notifications_config FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Clinic admins can manage their notifications"
  ON public.notifications_config FOR ALL
  TO authenticated
  USING (
    clinic_id IN (
      SELECT id FROM public.clinics WHERE owner_id = auth.uid()
    )
  );

-- 7. IMPERSONATION SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view impersonation sessions"
  ON public.impersonation_sessions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- 8. SYSTEM METRICS TABLE
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view metrics"
  ON public.system_metrics FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- 9. ENSURE UNIQUE_HASH EXISTS ON PRESCRIPTIONS (for QR verification)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM prescriptions WHERE unique_hash IS NOT NULL LIMIT 1
  ) THEN
    UPDATE prescriptions 
    SET unique_hash = encode(gen_random_bytes(16), 'hex')
    WHERE unique_hash IS NULL;
  END IF;
END $$;

-- 10. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_role_audit_user_id ON public.role_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_created_at ON public.role_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_unique_hash ON public.prescriptions(unique_hash);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON public.clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON public.clinic_members(user_id);

-- 11. UPDATE TRIGGERS FOR TIMESTAMPS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_smtp_settings_updated_at ON public.smtp_settings;
CREATE TRIGGER update_smtp_settings_updated_at
  BEFORE UPDATE ON public.smtp_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_config_updated_at ON public.notifications_config;
CREATE TRIGGER update_notifications_config_updated_at
  BEFORE UPDATE ON public.notifications_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();