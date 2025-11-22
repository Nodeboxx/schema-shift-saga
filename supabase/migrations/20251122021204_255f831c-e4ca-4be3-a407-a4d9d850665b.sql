-- Add billing_cycle column to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));