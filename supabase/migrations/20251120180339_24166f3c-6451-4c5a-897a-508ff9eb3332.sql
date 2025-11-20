-- Fix infinite recursion in RLS policies by creating security definer functions

-- 1. Create function to check if user is clinic owner or member
CREATE OR REPLACE FUNCTION public.is_clinic_member(_clinic_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_members
    WHERE clinic_id = _clinic_id 
      AND user_id = _user_id 
      AND is_active = true
  );
$$;

-- 2. Create function to check if user owns clinic
CREATE OR REPLACE FUNCTION public.is_clinic_owner(_clinic_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinics
    WHERE id = _clinic_id 
      AND owner_id = _user_id
  );
$$;

-- 3. Drop existing problematic RLS policies on clinics
DROP POLICY IF EXISTS "Users can view their clinics" ON public.clinics;
DROP POLICY IF EXISTS "Clinic owners can update their clinics" ON public.clinics;
DROP POLICY IF EXISTS "Authenticated users can create clinics" ON public.clinics;

-- 4. Create new RLS policies for clinics using security definer functions
CREATE POLICY "Users can view their clinics" 
ON public.clinics 
FOR SELECT 
USING (
  owner_id = auth.uid() 
  OR public.is_clinic_member(id, auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Clinic owners can update their clinics" 
ON public.clinics 
FOR UPDATE 
USING (
  owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Authenticated users can create clinics" 
ON public.clinics 
FOR INSERT 
WITH CHECK (
  auth.uid() = owner_id
);

-- 5. Drop existing problematic RLS policies on clinic_members
DROP POLICY IF EXISTS "Clinic members can view their membership" ON public.clinic_members;
DROP POLICY IF EXISTS "Clinic owners can manage members" ON public.clinic_members;

-- 6. Create new RLS policies for clinic_members using security definer functions
CREATE POLICY "Clinic members can view their membership" 
ON public.clinic_members 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_clinic_owner(clinic_id, auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Clinic owners can manage members" 
ON public.clinic_members 
FOR ALL 
USING (
  public.is_clinic_owner(clinic_id, auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- 7. Fix appointments RLS to use security definer functions
DROP POLICY IF EXISTS "Users can view appointments in their clinic" ON public.appointments;

CREATE POLICY "Users can view appointments in their clinic" 
ON public.appointments 
FOR SELECT 
USING (
  doctor_id = auth.uid() 
  OR patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  OR (clinic_id IS NOT NULL AND public.is_clinic_member(clinic_id, auth.uid()))
  OR public.has_role(auth.uid(), 'super_admin')
);