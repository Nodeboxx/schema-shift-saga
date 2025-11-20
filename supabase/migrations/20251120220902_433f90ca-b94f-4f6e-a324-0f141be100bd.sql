-- Narrow public patient creation to anon and authenticated roles explicitly
DROP POLICY IF EXISTS "Public can create patients via homepage" ON public.patients;

CREATE POLICY "Public can create patients via homepage"
ON public.patients
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ensure public appointment requests also work for anon and authenticated explicitly
DROP POLICY IF EXISTS "Public can request appointments" ON public.appointments;

CREATE POLICY "Public can request appointments"
ON public.appointments
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);