-- Add display ID columns for patients, clinics, and doctors
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_id_display TEXT UNIQUE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS clinic_id_display TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS doctor_id_display TEXT UNIQUE;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS patient_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS clinic_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS doctor_id_seq START 1;

-- Create function to generate patient ID
CREATE OR REPLACE FUNCTION generate_patient_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.patient_id_display IS NULL THEN
    NEW.patient_id_display := 'P' || LPAD(nextval('patient_id_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate clinic ID
CREATE OR REPLACE FUNCTION generate_clinic_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clinic_id_display IS NULL THEN
    NEW.clinic_id_display := 'C' || LPAD(nextval('clinic_id_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate doctor ID
CREATE OR REPLACE FUNCTION generate_doctor_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.doctor_id_display IS NULL AND NEW.role = 'doctor' THEN
    NEW.doctor_id_display := 'D' || LPAD(nextval('doctor_id_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS set_patient_id ON patients;
CREATE TRIGGER set_patient_id
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION generate_patient_id();

DROP TRIGGER IF EXISTS set_clinic_id ON clinics;
CREATE TRIGGER set_clinic_id
  BEFORE INSERT ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_id();

DROP TRIGGER IF EXISTS set_doctor_id ON profiles;
CREATE TRIGGER set_doctor_id
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_doctor_id();

-- Update existing records with display IDs using CTEs
WITH numbered_patients AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM patients
  WHERE patient_id_display IS NULL
)
UPDATE patients p
SET patient_id_display = 'P' || LPAD(np.rn::TEXT, 6, '0')
FROM numbered_patients np
WHERE p.id = np.id;

WITH numbered_clinics AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM clinics
  WHERE clinic_id_display IS NULL
)
UPDATE clinics c
SET clinic_id_display = 'C' || LPAD(nc.rn::TEXT, 6, '0')
FROM numbered_clinics nc
WHERE c.id = nc.id;

WITH numbered_doctors AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM profiles
  WHERE doctor_id_display IS NULL AND role = 'doctor'
)
UPDATE profiles p
SET doctor_id_display = 'D' || LPAD(nd.rn::TEXT, 6, '0')
FROM numbered_doctors nd
WHERE p.id = nd.id;

-- Update sequences to start after existing records
SELECT setval('patient_id_seq', (SELECT COALESCE(MAX(SUBSTRING(patient_id_display FROM 2)::INTEGER), 0) + 1 FROM patients));
SELECT setval('clinic_id_seq', (SELECT COALESCE(MAX(SUBSTRING(clinic_id_display FROM 2)::INTEGER), 0) + 1 FROM clinics));
SELECT setval('doctor_id_seq', (SELECT COALESCE(MAX(SUBSTRING(doctor_id_display FROM 2)::INTEGER), 0) + 1 FROM profiles WHERE role = 'doctor'));