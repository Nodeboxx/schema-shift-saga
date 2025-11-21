-- Drop existing conflicting policies for patients INSERT
DROP POLICY IF EXISTS "Public can create patients via homepage" ON public.patients;
DROP POLICY IF EXISTS "Users can insert own patients" ON public.patients;

-- Create a single comprehensive INSERT policy that allows both public and authenticated users
CREATE POLICY "Allow patient creation for appointments" ON public.patients
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and creating their own patient
  (auth.uid() = user_id) 
  OR 
  -- Allow public/unauthenticated users to create patients (for homepage booking)
  (auth.uid() IS NULL)
);

-- Ensure appointments can be created by public users as well
DROP POLICY IF EXISTS "Public can request appointments" ON public.appointments;

CREATE POLICY "Allow public appointment requests" ON public.appointments
FOR INSERT 
WITH CHECK (true);