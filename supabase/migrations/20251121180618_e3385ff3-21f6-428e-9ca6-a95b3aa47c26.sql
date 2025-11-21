-- Create storage bucket for patient medical files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-medical-files',
  'patient-medical-files',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create RLS policies for patient medical files
CREATE POLICY "Doctors can upload medical files for their patients"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'patient-medical-files' AND
  auth.uid() IN (
    SELECT user_id FROM patients 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Doctors can view medical files for their patients"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-medical-files' AND
  auth.uid() IN (
    SELECT user_id FROM patients 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Doctors can delete medical files for their patients"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'patient-medical-files' AND
  auth.uid() IN (
    SELECT user_id FROM patients 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Create table for patient medical files metadata
CREATE TABLE IF NOT EXISTS public.patient_medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT,
  test_type TEXT,
  test_date DATE,
  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Enable RLS on patient_medical_files
ALTER TABLE public.patient_medical_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_medical_files
CREATE POLICY "Doctors can manage medical files for their patients"
ON public.patient_medical_files
FOR ALL
USING (
  uploaded_by = auth.uid() OR
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Add custom test results field to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS custom_test_results JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_medical_files_patient_id ON public.patient_medical_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_custom_test_results ON public.patients USING GIN(custom_test_results);