-- Add icon_url column to medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add index for better performance when fetching by brand name
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name ON medicines(brand_name);