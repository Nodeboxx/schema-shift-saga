-- Allow public to view any active doctor profiles (regardless of role)
ALTER POLICY "Public can view active doctors"
ON public.profiles
USING (is_active IS DISTINCT FROM FALSE);