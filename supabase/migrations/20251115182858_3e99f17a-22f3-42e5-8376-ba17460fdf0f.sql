-- Add UPDATE policies for medicine reference data tables
-- These are public reference data tables, so we allow public updates during imports

CREATE POLICY "Anyone can update dosage forms"
ON public.dosage_forms
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can update drug classes"
ON public.drug_classes
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can update manufacturers"
ON public.manufacturers
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can update generics"
ON public.generics
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can update medicines"
ON public.medicines
FOR UPDATE
USING (true);