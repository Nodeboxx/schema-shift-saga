-- Add granular age and weight fields for prescriptions
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS patient_age_years integer,
  ADD COLUMN IF NOT EXISTS patient_age_months integer,
  ADD COLUMN IF NOT EXISTS patient_age_days integer,
  ADD COLUMN IF NOT EXISTS patient_weight_kg integer,
  ADD COLUMN IF NOT EXISTS patient_weight_grams integer;