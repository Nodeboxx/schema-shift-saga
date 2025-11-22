-- Relax public doctor visibility to handle existing data where is_active may be NULL
ALTER POLICY "Public can view active doctors"
ON public.profiles
USING ((is_active IS DISTINCT FROM FALSE) AND (role = 'doctor'::app_role));