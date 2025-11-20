-- Allow public homepage booking to create patients linked to doctors
CREATE POLICY "Public can create patients via homepage"
ON public.patients
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public homepage booking to create appointment records
CREATE POLICY "Public can request appointments"
ON public.appointments
FOR INSERT
TO anon
WITH CHECK (true);