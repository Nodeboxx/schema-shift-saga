-- Create analytics views and tables
CREATE TABLE IF NOT EXISTS analytics_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES profiles(id),
  clinic_id uuid REFERENCES clinics(id),
  metric_name text NOT NULL,
  metric_value jsonb NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytics_cache_period_check CHECK (period_end > period_start)
);

-- Enable RLS
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view their analytics" ON analytics_cache
  FOR SELECT
  USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can manage analytics cache" ON analytics_cache
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Create analytics summary view for prescriptions
CREATE OR REPLACE VIEW prescription_analytics AS
SELECT 
  user_id as doctor_id,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as prescription_count,
  COUNT(DISTINCT patient_id) as unique_patients,
  AVG(page_count) as avg_pages
FROM prescriptions
GROUP BY user_id, DATE_TRUNC('day', created_at);

-- Create analytics summary view for appointments
CREATE OR REPLACE VIEW appointment_analytics AS
SELECT 
  doctor_id,
  DATE_TRUNC('day', start_time) as date,
  COUNT(*) as appointment_count,
  COUNT(DISTINCT patient_id) as unique_patients,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  COUNT(*) FILTER (WHERE patient_type = 'walk_in') as walk_in_count
FROM appointments
GROUP BY doctor_id, DATE_TRUNC('day', start_time);

-- Create patient demographics view
CREATE OR REPLACE VIEW patient_demographics AS
SELECT 
  doctor_id,
  COUNT(*) as total_patients,
  COUNT(*) FILTER (WHERE sex = 'Male') as male_count,
  COUNT(*) FILTER (WHERE sex = 'Female') as female_count,
  AVG(CASE 
    WHEN age ~ '^\d+$' THEN age::integer 
    ELSE NULL 
  END) as avg_age,
  COUNT(*) FILTER (WHERE blood_group IS NOT NULL) as patients_with_blood_group
FROM patients
WHERE doctor_id IS NOT NULL
GROUP BY doctor_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_cache_doctor ON analytics_cache(doctor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_metric ON analytics_cache(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_period ON analytics_cache(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_date ON prescriptions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_start_date ON appointments(doctor_id, start_time);