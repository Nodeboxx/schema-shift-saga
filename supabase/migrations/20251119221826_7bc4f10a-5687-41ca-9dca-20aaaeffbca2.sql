-- Add generic_name and manufacturer_name columns to medicines table
ALTER TABLE medicines 
ADD COLUMN IF NOT EXISTS generic_name TEXT,
ADD COLUMN IF NOT EXISTS manufacturer_name TEXT;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_manufacturer_name ON medicines(manufacturer_name);

-- Add comment explaining these columns
COMMENT ON COLUMN medicines.generic_name IS 'Raw generic name from import source';
COMMENT ON COLUMN medicines.manufacturer_name IS 'Raw manufacturer name from import source';