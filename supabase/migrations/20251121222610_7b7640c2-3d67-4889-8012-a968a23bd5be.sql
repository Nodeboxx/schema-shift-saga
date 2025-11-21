-- Add 'patient' to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'patient';

-- Add auth_user_id to patients table to link with auth.users
ALTER TABLE patients ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS invitation_sent_at timestamp with time zone;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS invitation_accepted_at timestamp with time zone;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS invitation_token text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_auth_user_id ON patients(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_patients_invitation_token ON patients(invitation_token);

-- Create patient_invitations table for tracking invitations
CREATE TABLE IF NOT EXISTS patient_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(patient_id)
);

-- Enable RLS on patient_invitations
ALTER TABLE patient_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_invitations
CREATE POLICY "Doctors can manage invitations for their patients"
ON patient_invitations
FOR ALL
USING (
  invited_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = patient_invitations.patient_id
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view invitations by token"
ON patient_invitations
FOR SELECT
USING (true);

-- Update patients RLS policies to allow patient access
CREATE POLICY "Patients can view their own data"
ON patients
FOR SELECT
USING (auth_user_id = auth.uid());

CREATE POLICY "Patients can update their own data"
ON patients
FOR UPDATE
USING (auth_user_id = auth.uid());

-- Update prescriptions RLS for patient access
CREATE POLICY "Patients can view their own prescriptions"
ON prescriptions
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patients WHERE auth_user_id = auth.uid()
  )
);

-- Update appointments RLS for patient access
CREATE POLICY "Patients can view their own appointments"
ON appointments
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patients WHERE auth_user_id = auth.uid()
  )
);

-- Update telemedicine_sessions RLS for patient access
CREATE POLICY "Patients can view their own telemedicine sessions"
ON telemedicine_sessions
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patients WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their session status"
ON telemedicine_sessions
FOR UPDATE
USING (
  patient_id IN (
    SELECT id FROM patients WHERE auth_user_id = auth.uid()
  )
);

-- Update telemedicine_messages RLS for patient access
CREATE POLICY "Patients can manage messages in their sessions"
ON telemedicine_messages
FOR ALL
USING (
  session_id IN (
    SELECT id FROM telemedicine_sessions
    WHERE patient_id IN (
      SELECT id FROM patients WHERE auth_user_id = auth.uid()
    )
  )
);

-- Create function to handle patient invitation acceptance
CREATE OR REPLACE FUNCTION accept_patient_invitation(invitation_token text, user_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record patient_invitations;
  patient_record patients;
  new_user_id uuid;
BEGIN
  -- Get invitation
  SELECT * INTO invitation_record
  FROM patient_invitations
  WHERE token = invitation_token
  AND accepted_at IS NULL
  AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid or expired invitation');
  END IF;

  -- Get patient
  SELECT * INTO patient_record
  FROM patients
  WHERE id = invitation_record.patient_id;

  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    invitation_record.email,
    crypt(user_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', patient_record.name),
    now(),
    now(),
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Link patient to auth user
  UPDATE patients
  SET auth_user_id = new_user_id,
      invitation_accepted_at = now()
  WHERE id = invitation_record.patient_id;

  -- Mark invitation as accepted
  UPDATE patient_invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;

  -- Assign patient role
  INSERT INTO user_roles (user_id, role)
  VALUES (new_user_id, 'patient');

  RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
END;
$$;