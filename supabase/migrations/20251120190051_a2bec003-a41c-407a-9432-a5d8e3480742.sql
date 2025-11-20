-- Create storage bucket for medical council logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('council-logos', 'council-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for council logos - users can upload their own
CREATE POLICY "Users can upload their council logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'council-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their council logos
CREATE POLICY "Users can update their council logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'council-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their council logos
CREATE POLICY "Users can delete their council logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'council-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view council logos (public bucket)
CREATE POLICY "Anyone can view council logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'council-logos');