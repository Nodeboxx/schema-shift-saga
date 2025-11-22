-- Ensure independent doctors have clinic_id = NULL
-- and clinic-managed doctors have clinic_id set correctly

-- First, set clinic_id to NULL for doctors who are NOT in clinic_members
UPDATE profiles
SET clinic_id = NULL
WHERE role = 'doctor'
  AND id NOT IN (
    SELECT user_id 
    FROM clinic_members 
    WHERE is_active = true
  )
  AND clinic_id IS NOT NULL;

-- Then, ensure clinic_id is set for doctors who ARE active members of clinics
UPDATE profiles p
SET clinic_id = cm.clinic_id
FROM clinic_members cm
WHERE p.id = cm.user_id
  AND cm.is_active = true
  AND p.role = 'doctor'
  AND (p.clinic_id IS NULL OR p.clinic_id != cm.clinic_id);

-- Add a comment for clarity
COMMENT ON COLUMN profiles.clinic_id IS 'NULL for independent doctors, set to clinic.id for clinic-managed doctors (those in clinic_members)';
