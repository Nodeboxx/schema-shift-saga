-- Fix RLS policy for public appointment booking
DROP POLICY IF EXISTS "Allow patient creation for appointments" ON public.patients;

CREATE POLICY "Allow patient creation for appointments" ON public.patients
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and creating their own patient
  (auth.uid() = user_id) 
  OR 
  -- Allow public/unauthenticated users to create patients for appointment booking
  -- In this case, user_id is set to the doctor_id who will manage the patient
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);