-- Add 'pending' status to appointment_status enum
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'pending';

-- Fix RLS policies for appointment booking system

-- 1. Update patients table RLS to allow patient creation for appointments  
DROP POLICY IF EXISTS "Allow patient creation for appointments" ON public.patients;

CREATE POLICY "Allow patient creation for appointments" ON public.patients
FOR INSERT
WITH CHECK (
  -- Authenticated users creating their own patients
  (auth.uid() = user_id)
  OR
  -- Public users creating patients for doctor (appointment booking)
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- 2. Update appointments RLS for better clinic access
DROP POLICY IF EXISTS "Users can view appointments in their clinic" ON public.appointments;

CREATE POLICY "Users can view appointments in their clinic" ON public.appointments
FOR SELECT
USING (
  (doctor_id = auth.uid())
  OR
  (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()))
  OR
  (clinic_id IS NOT NULL AND is_clinic_member(clinic_id, auth.uid()))
  OR
  (doctor_id IN (
    SELECT user_id FROM clinic_members 
    WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  ))
  OR
  has_role(auth.uid(), 'super_admin')
);

-- 3. Allow clinic members to manage appointments
DROP POLICY IF EXISTS "Doctors can manage their appointments" ON public.appointments;

CREATE POLICY "Doctors and clinic members can manage appointments" ON public.appointments
FOR ALL
USING (
  (doctor_id = auth.uid())
  OR
  (clinic_id IS NOT NULL AND is_clinic_member(clinic_id, auth.uid()))
  OR
  (doctor_id IN (
    SELECT user_id FROM clinic_members 
    WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  ))
)
WITH CHECK (
  (doctor_id = auth.uid())
  OR
  (clinic_id IS NOT NULL AND is_clinic_member(clinic_id, auth.uid()))
  OR
  (doctor_id IN (
    SELECT user_id FROM clinic_members 
    WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  ))
);

-- 4. Create approve function
CREATE OR REPLACE FUNCTION approve_appointment(appointment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.id = appointment_id
    AND (
      a.doctor_id = auth.uid()
      OR (a.clinic_id IS NOT NULL AND is_clinic_member(a.clinic_id, auth.uid()))
      OR has_role(auth.uid(), 'super_admin')
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized to approve this appointment';
  END IF;
  
  UPDATE appointments
  SET 
    status = 'scheduled',
    updated_at = NOW()
  WHERE id = appointment_id;
END;
$$;