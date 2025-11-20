-- Add unique_hash column to prescriptions for public verification
ALTER TABLE public.prescriptions
ADD COLUMN IF NOT EXISTS unique_hash TEXT UNIQUE;

-- Create function to generate unique hash for prescriptions
CREATE OR REPLACE FUNCTION generate_prescription_hash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_hash IS NULL THEN
    NEW.unique_hash := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate hash on prescription creation
DROP TRIGGER IF EXISTS set_prescription_hash ON public.prescriptions;
CREATE TRIGGER set_prescription_hash
  BEFORE INSERT ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION generate_prescription_hash();

-- Update existing prescriptions with unique hashes
UPDATE public.prescriptions
SET unique_hash = encode(gen_random_bytes(16), 'hex')
WHERE unique_hash IS NULL;

-- Create index on unique_hash for faster verification lookups
CREATE INDEX IF NOT EXISTS idx_prescriptions_unique_hash ON public.prescriptions(unique_hash);

-- Add RLS policy for public verification (bypasses auth for read-only access via unique_hash)
CREATE POLICY "Public can view prescriptions via unique_hash"
ON public.prescriptions
FOR SELECT
TO anon
USING (unique_hash IS NOT NULL);

-- Allow public to read prescription items for verification
CREATE POLICY "Public can view prescription items via prescription"
ON public.prescription_items
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions
    WHERE prescriptions.id = prescription_items.prescription_id
    AND prescriptions.unique_hash IS NOT NULL
  )
);
