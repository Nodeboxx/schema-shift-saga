-- Fix foreign key constraint to allow patient deletion
-- Drop existing constraint and recreate with CASCADE

ALTER TABLE IF EXISTS telemedicine_sessions
DROP CONSTRAINT IF EXISTS telemedicine_sessions_patient_id_fkey;

-- Recreate with ON DELETE CASCADE
ALTER TABLE IF EXISTS telemedicine_sessions
ADD CONSTRAINT telemedicine_sessions_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE CASCADE;

-- Also fix appointments table if needed
ALTER TABLE IF EXISTS appointments
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

ALTER TABLE IF EXISTS appointments
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE CASCADE;

-- Fix prescriptions table
ALTER TABLE IF EXISTS prescriptions
DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;

ALTER TABLE IF EXISTS prescriptions
ADD CONSTRAINT prescriptions_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE SET NULL;

-- Fix patient_journeys table
ALTER TABLE IF EXISTS patient_journeys
DROP CONSTRAINT IF EXISTS patient_journeys_patient_id_fkey;

ALTER TABLE IF EXISTS patient_journeys
ADD CONSTRAINT patient_journeys_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE CASCADE;

-- Fix patient_medical_files table
ALTER TABLE IF EXISTS patient_medical_files
DROP CONSTRAINT IF EXISTS patient_medical_files_patient_id_fkey;

ALTER TABLE IF EXISTS patient_medical_files
ADD CONSTRAINT patient_medical_files_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE CASCADE;

-- Fix health_advice table
ALTER TABLE IF EXISTS health_advice
DROP CONSTRAINT IF EXISTS health_advice_patient_id_fkey;

ALTER TABLE IF EXISTS health_advice
ADD CONSTRAINT health_advice_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE CASCADE;

-- Fix questionnaire_responses table
ALTER TABLE IF EXISTS questionnaire_responses
DROP CONSTRAINT IF EXISTS questionnaire_responses_patient_id_fkey;

ALTER TABLE IF EXISTS questionnaire_responses
ADD CONSTRAINT questionnaire_responses_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE CASCADE;