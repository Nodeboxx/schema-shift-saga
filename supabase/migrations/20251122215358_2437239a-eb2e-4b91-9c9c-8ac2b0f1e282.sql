-- Add header and footer font size columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS header_font_size TEXT DEFAULT '13',
ADD COLUMN IF NOT EXISTS footer_font_size TEXT DEFAULT '13';