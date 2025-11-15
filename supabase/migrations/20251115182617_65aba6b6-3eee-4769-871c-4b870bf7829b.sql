-- Add INSERT policies for medicine reference data tables
-- These are public reference data tables, so we allow public inserts

CREATE POLICY "Anyone can insert dosage forms"
ON public.dosage_forms
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert drug classes"
ON public.drug_classes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert manufacturers"
ON public.manufacturers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert generics"
ON public.generics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert medicines"
ON public.medicines
FOR INSERT
WITH CHECK (true);