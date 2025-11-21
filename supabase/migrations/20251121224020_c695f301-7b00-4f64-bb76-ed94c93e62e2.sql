-- Set replica identity for realtime
ALTER TABLE telemedicine_sessions REPLICA IDENTITY FULL;
ALTER TABLE telemedicine_messages REPLICA IDENTITY FULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_doctor_id ON telemedicine_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_patient_id ON telemedicine_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_status ON telemedicine_sessions(status);
CREATE INDEX IF NOT EXISTS idx_telemedicine_messages_session_id ON telemedicine_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_token ON patient_invitations(token);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_patient_id ON patient_invitations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_auth_user_id ON patients(auth_user_id);

-- Ensure user_roles has proper index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Add updated_at trigger for telemedicine_sessions if not exists
CREATE OR REPLACE FUNCTION update_telemedicine_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_telemedicine_sessions_updated_at ON telemedicine_sessions;
CREATE TRIGGER update_telemedicine_sessions_updated_at
BEFORE UPDATE ON telemedicine_sessions
FOR EACH ROW
EXECUTE FUNCTION update_telemedicine_sessions_updated_at();

-- Ensure appointments have proper status default
ALTER TABLE appointments 
ALTER COLUMN status SET DEFAULT 'pending'::appointment_status;