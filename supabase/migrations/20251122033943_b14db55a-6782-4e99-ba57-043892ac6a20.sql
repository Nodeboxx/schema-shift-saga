-- Create storage bucket for clinic branding assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clinic-branding', 'clinic-branding', true);

-- Create RLS policies for clinic branding bucket
CREATE POLICY "Clinic owners can upload branding files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clinic-branding' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM clinics WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Clinic owners can update branding files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clinic-branding' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM clinics WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Clinic owners can delete branding files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'clinic-branding' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM clinics WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view clinic branding files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'clinic-branding');