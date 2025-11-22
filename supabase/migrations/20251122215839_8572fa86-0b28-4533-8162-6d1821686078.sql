-- Add individual font size columns for each profile section
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS degree_en_font_size TEXT DEFAULT '13',
ADD COLUMN IF NOT EXISTS degree_bn_font_size TEXT DEFAULT '13',
ADD COLUMN IF NOT EXISTS footer_left_font_size TEXT DEFAULT '13',
ADD COLUMN IF NOT EXISTS footer_right_font_size TEXT DEFAULT '13';