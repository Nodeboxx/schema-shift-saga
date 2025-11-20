-- Recreate patients INSERT policies as PERMISSIVE to avoid conflicts for public homepage
DROP POLICY IF EXISTS "Public can create patients via homepage" ON public.patients;

CREATE POLICY "Public can create patients via homepage"
ON public.patients
AS PERMISSIVE
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own patients" ON public.patients;

CREATE POLICY "Users can insert own patients"
ON public.patients
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Recreate appointment policies so public requests work and doctors can still manage their own
DROP POLICY IF EXISTS "Public can request appointments" ON public.appointments;

CREATE POLICY "Public can request appointments"
ON public.appointments
AS PERMISSIVE
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Doctors can manage their appointments" ON public.appointments;

CREATE POLICY "Doctors can manage their appointments"
ON public.appointments
AS PERMISSIVE
FOR ALL
TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());