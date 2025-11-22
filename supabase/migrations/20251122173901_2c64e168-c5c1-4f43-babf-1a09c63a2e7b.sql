-- Fix RLS policies for full data visibility across dashboards

-- ============================================
-- PROFILES TABLE - Allow viewing doctor profiles
-- ============================================
DROP POLICY IF EXISTS "Public can view active doctor profiles" ON profiles;
CREATE POLICY "Public can view active doctor profiles"
ON profiles FOR SELECT
USING (role = 'doctor' AND is_active = true);

DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
CREATE POLICY "Super admins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Clinic admins can view clinic profiles" ON profiles;
CREATE POLICY "Clinic admins can view clinic profiles"
ON profiles FOR SELECT
USING (
  clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- CLINICS TABLE - Allow admins to view all clinics
-- ============================================
DROP POLICY IF EXISTS "Super admins can view all clinics" ON clinics;
CREATE POLICY "Super admins can view all clinics"
ON clinics FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- ============================================
-- PATIENTS TABLE - Ensure clinic admins can see all clinic patients
-- ============================================
DROP POLICY IF EXISTS "Clinic admins can view all clinic patients" ON patients;
CREATE POLICY "Clinic admins can view all clinic patients"
ON patients FOR SELECT
USING (
  clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Super admins can view all patients" ON patients;
CREATE POLICY "Super admins can view all patients"
ON patients FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- ============================================
-- APPOINTMENTS TABLE - Ensure proper visibility
-- ============================================
DROP POLICY IF EXISTS "Clinic admins can view clinic appointments" ON appointments;
CREATE POLICY "Clinic admins can view clinic appointments"
ON appointments FOR SELECT
USING (
  clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Super admins can view all appointments" ON appointments;
CREATE POLICY "Super admins can view all appointments"
ON appointments FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- ============================================
-- CLINIC_PAYROLL TABLE - Already has correct policies
-- ============================================

-- ============================================
-- PRESCRIPTIONS TABLE - Ensure clinic visibility
-- ============================================
DROP POLICY IF EXISTS "Clinic admins can view clinic prescriptions" ON prescriptions;
CREATE POLICY "Clinic admins can view clinic prescriptions"
ON prescriptions FOR SELECT
USING (
  clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Super admins can view all prescriptions" ON prescriptions;
CREATE POLICY "Super admins can view all prescriptions"
ON prescriptions FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));