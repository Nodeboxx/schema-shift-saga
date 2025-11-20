-- =====================================================
-- ENTERPRISE SAAS DATABASE SCHEMA (Fixed)
-- Multi-tenant prescription management platform
-- =====================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'clinic_admin', 'doctor', 'staff', 'patient');

-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- Create appointment status enum
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'in_consultation', 'completed', 'cancelled', 'no_show');

-- =====================================================
-- CLINICS
-- =====================================================
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  header_image_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  max_doctors INTEGER DEFAULT 1,
  max_patients INTEGER DEFAULT 50,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CLINIC MEMBERS
-- =====================================================
CREATE TABLE public.clinic_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role DEFAULT 'doctor',
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clinic_id, user_id)
);

ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;

-- Now add policies after both tables exist
CREATE POLICY "Users can view their clinics"
  ON public.clinics FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.clinic_members
      WHERE clinic_id = clinics.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic owners can update their clinics"
  ON public.clinics FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create clinics"
  ON public.clinics FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Clinic members can view their membership"
  ON public.clinic_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.clinics
      WHERE id = clinic_members.clinic_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Clinic owners can manage members"
  ON public.clinic_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics
      WHERE id = clinic_members.clinic_id AND owner_id = auth.uid()
    )
  );

-- =====================================================
-- USER ROLES (Security Definer Pattern)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- APPOINTMENTS
-- =====================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  type TEXT DEFAULT 'in-person',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointments in their clinic"
  ON public.appointments FOR SELECT
  USING (
    doctor_id = auth.uid() OR
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.clinic_members
      WHERE clinic_id = appointments.clinic_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage their appointments"
  ON public.appointments FOR ALL
  USING (doctor_id = auth.uid());

-- =====================================================
-- UPDATE EXISTING TABLES
-- =====================================================

-- Add clinic_id to patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS medical_history TEXT,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add clinic_id to prescriptions
ALTER TABLE public.prescriptions
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS unique_hash TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Update profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'doctor',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.clinics
      WHERE id = subscriptions.clinic_id AND owner_id = auth.uid()
    )
  );

-- =====================================================
-- CMS CONTENT
-- =====================================================
CREATE TABLE public.cms_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT UNIQUE NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published CMS sections"
  ON public.cms_sections FOR SELECT
  USING (is_published = true);

CREATE POLICY "Super admins can manage CMS"
  ON public.cms_sections FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =====================================================
-- ANALYTICS & USAGE
-- =====================================================
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their usage logs"
  ON public.usage_logs FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_clinics_owner ON public.clinics(owner_id);
CREATE INDEX idx_clinics_slug ON public.clinics(slug);
CREATE INDEX idx_clinic_members_clinic ON public.clinic_members(clinic_id);
CREATE INDEX idx_clinic_members_user ON public.clinic_members(user_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX idx_patients_doctor ON public.patients(doctor_id);
CREATE INDEX idx_prescriptions_clinic ON public.prescriptions(clinic_id);
CREATE INDEX idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_hash ON public.prescriptions(unique_hash);
CREATE INDEX idx_usage_logs_clinic ON public.usage_logs(clinic_id);
CREATE INDEX idx_usage_logs_user ON public.usage_logs(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DEFAULT CMS CONTENT
-- =====================================================
INSERT INTO public.cms_sections (section_name, title, content, display_order) VALUES
('hero', 'Hero Section', '{
  "heading": "Modern Prescription Management for Healthcare Professionals",
  "subheading": "Create, manage, and share prescriptions digitally with ease",
  "cta_text": "Start Free Trial",
  "cta_url": "/register",
  "image_url": "/hero-image.jpg"
}'::jsonb, 1),
('features', 'Features', '{
  "heading": "Everything you need to manage prescriptions",
  "items": [
    {"title": "Digital Prescriptions", "description": "Create professional prescriptions in seconds", "icon": "FileText"},
    {"title": "Patient Management", "description": "Track patient history and records", "icon": "Users"},
    {"title": "Voice Typing", "description": "Dictate prescriptions naturally", "icon": "Mic"},
    {"title": "Multi-language Support", "description": "Bangla and English support", "icon": "Globe"}
  ]
}'::jsonb, 2),
('pricing', 'Pricing Plans', '{
  "heading": "Choose your plan",
  "plans": [
    {"name": "Free", "price": "0", "features": ["5 prescriptions/month", "Basic templates", "Email support"]},
    {"name": "Pro", "price": "29", "features": ["Unlimited prescriptions", "Advanced templates", "Voice typing", "Priority support", "Custom branding"]},
    {"name": "Enterprise", "price": "99", "features": ["Everything in Pro", "Multi-doctor clinics", "API access", "Dedicated support", "Custom integrations"]}
  ]
}'::jsonb, 3);