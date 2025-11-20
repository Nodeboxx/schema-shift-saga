-- Add column to store template-specific data for prescriptions
ALTER TABLE public.prescriptions
ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS active_template TEXT DEFAULT 'general_medicine';