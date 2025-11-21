-- Add bismillah_text column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN bismillah_text text DEFAULT 'بسم الله الرحمن الرحيم';