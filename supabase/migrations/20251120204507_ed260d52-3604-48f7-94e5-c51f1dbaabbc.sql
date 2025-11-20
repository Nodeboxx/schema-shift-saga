-- Products table (WooCommerce-style)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price numeric DEFAULT 0,
  sale_price numeric,
  sku text,
  stock_quantity integer DEFAULT 0,
  stock_status text DEFAULT 'in_stock',
  featured boolean DEFAULT false,
  categories text[],
  tags text[],
  images jsonb DEFAULT '[]'::jsonb,
  attributes jsonb DEFAULT '{}'::jsonb,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Product categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES public.product_categories(id),
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Custom pages
CREATE TABLE IF NOT EXISTS public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  meta_title text,
  meta_description text,
  is_published boolean DEFAULT false,
  template text DEFAULT 'default',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Site settings (header, footer, etc)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view published products"
ON public.products FOR SELECT
USING (is_published = true);

CREATE POLICY "Super admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Product categories policies
CREATE POLICY "Anyone can view categories"
ON public.product_categories FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage categories"
ON public.product_categories FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Custom pages policies
CREATE POLICY "Anyone can view published pages"
ON public.custom_pages FOR SELECT
USING (is_published = true);

CREATE POLICY "Super admins can manage pages"
ON public.custom_pages FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Site settings policies
CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage site settings"
ON public.site_settings FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('header', '{"logo": "", "navigation": [], "announcement": ""}'::jsonb),
  ('footer', '{"columns": [], "copyright": "© 2025 MedScribe. All rights reserved.", "social": []}'::jsonb),
  ('homepage_hero', '{"title": "Transform Your Healthcare Practice", "subtitle": "Intelligent automation, seamless patient engagement, and meaningful results", "cta_primary": "Get Started", "cta_secondary": "Watch Demo", "background_image": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON public.custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_published ON public.custom_pages(is_published);