-- Add walk-in patient type and SMS reminder fields to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_type text DEFAULT 'scheduled' CHECK (patient_type IN ('scheduled', 'walk_in'));
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_reminder_sent boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_reminder_sent_at timestamp with time zone;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES profiles(id);

-- Add patient phone number for SMS
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS email text;

-- Create appointment history table
CREATE TABLE IF NOT EXISTS appointment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on appointment_history
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view appointment history for their appointments
CREATE POLICY "Users can view appointment history" ON appointment_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_history.appointment_id
      AND (appointments.doctor_id = auth.uid() OR appointments.created_by = auth.uid())
    )
  );

-- Create SMS notification queue table
CREATE TABLE IF NOT EXISTS sms_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on sms_queue
ALTER TABLE sms_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can view their SMS queue
CREATE POLICY "Doctors can view their SMS queue" ON sms_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = sms_queue.appointment_id
      AND appointments.doctor_id = auth.uid()
    )
  );