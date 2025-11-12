-- Enable pg_trgm extension for fuzzy search FIRST
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create medicines master data tables
CREATE TABLE IF NOT EXISTS public.dosage_forms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.drug_classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manufacturers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.generics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  drug_class_id INTEGER REFERENCES public.drug_classes(id),
  indication TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.medicines (
  id SERIAL PRIMARY KEY,
  brand_name TEXT NOT NULL,
  generic_id INTEGER REFERENCES public.generics(id),
  dosage_form_id INTEGER REFERENCES public.dosage_forms(id),
  manufacturer_id INTEGER REFERENCES public.manufacturers(id),
  strength TEXT,
  package_info TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name ON public.medicines(brand_name);
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name_trgm ON public.medicines USING gin(brand_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generics_name ON public.generics(name);
CREATE INDEX IF NOT EXISTS idx_dosage_forms_name ON public.dosage_forms(name);

-- Enable RLS on all tables
ALTER TABLE public.dosage_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Allow public read access to medicine data (doctors need to search)
CREATE POLICY "Anyone can view dosage forms" ON public.dosage_forms FOR SELECT USING (true);
CREATE POLICY "Anyone can view drug classes" ON public.drug_classes FOR SELECT USING (true);
CREATE POLICY "Anyone can view manufacturers" ON public.manufacturers FOR SELECT USING (true);
CREATE POLICY "Anyone can view generics" ON public.generics FOR SELECT USING (true);
CREATE POLICY "Anyone can view medicines" ON public.medicines FOR SELECT USING (true);