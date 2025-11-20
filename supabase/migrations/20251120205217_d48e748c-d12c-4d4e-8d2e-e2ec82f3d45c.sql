-- Allow public to view active doctor profiles for appointment booking
CREATE POLICY "Public can view active doctors"
ON public.profiles
FOR SELECT
TO anon
USING (is_active = true AND role = 'doctor');