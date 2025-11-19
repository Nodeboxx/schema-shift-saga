-- Add multi-page support to prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS page_count integer DEFAULT 1;

-- Create prescription_pages table for multi-page support
CREATE TABLE IF NOT EXISTS prescription_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  content jsonb,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(prescription_id, page_number)
);

-- Enable RLS on prescription_pages
ALTER TABLE prescription_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for prescription_pages
CREATE POLICY "Users can view own prescription pages"
  ON prescription_pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM prescriptions 
    WHERE prescriptions.id = prescription_pages.prescription_id 
    AND prescriptions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own prescription pages"
  ON prescription_pages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM prescriptions 
    WHERE prescriptions.id = prescription_pages.prescription_id 
    AND prescriptions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own prescription pages"
  ON prescription_pages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM prescriptions 
    WHERE prescriptions.id = prescription_pages.prescription_id 
    AND prescriptions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own prescription pages"
  ON prescription_pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM prescriptions 
    WHERE prescriptions.id = prescription_pages.prescription_id 
    AND prescriptions.user_id = auth.uid()
  ));