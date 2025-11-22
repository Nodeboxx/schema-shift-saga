-- Add RLS policy to allow clinic members to create patients for their clinic
CREATE POLICY "Clinic members can create patients for their clinic"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id 
    FROM public.clinic_members 
    WHERE user_id = auth.uid() 
      AND is_active = true
  )
);

-- Add RLS policy to allow clinic members to view patients in their clinic
CREATE POLICY "Clinic members can view patients in their clinic"
ON public.patients
FOR SELECT
TO authenticated
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM public.clinic_members 
    WHERE user_id = auth.uid() 
      AND is_active = true
  )
);

-- Add RLS policy to allow clinic members to update patients in their clinic
CREATE POLICY "Clinic members can update patients in their clinic"
ON public.patients
FOR UPDATE
TO authenticated
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM public.clinic_members 
    WHERE user_id = auth.uid() 
      AND is_active = true
  )
);

-- Add RLS policy to allow clinic members to delete patients in their clinic
CREATE POLICY "Clinic members can delete patients in their clinic"
ON public.patients
FOR DELETE
TO authenticated
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM public.clinic_members 
    WHERE user_id = auth.uid() 
      AND is_active = true
  )
);