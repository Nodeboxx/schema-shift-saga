-- Add patient phone and email fields to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS patient_phone text,
ADD COLUMN IF NOT EXISTS patient_email text;