-- Add icon_url column to dosage_forms table to store dosage form icons
ALTER TABLE public.dosage_forms 
ADD COLUMN IF NOT EXISTS icon_url text;

-- Add comment
COMMENT ON COLUMN public.dosage_forms.icon_url IS 'URL or path to the dosage form icon image';