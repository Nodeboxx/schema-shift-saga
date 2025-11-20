-- Create patient journey tracking tables
CREATE TABLE IF NOT EXISTS patient_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES profiles(id),
  condition_name text NOT NULL,
  diagnosis_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  treatment_plan jsonb DEFAULT '{}',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create health milestones table
CREATE TABLE IF NOT EXISTS health_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES patient_journeys(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date,
  completed_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create health advice notifications table
CREATE TABLE IF NOT EXISTS health_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  journey_id uuid REFERENCES patient_journeys(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  advice_type text DEFAULT 'general' CHECK (advice_type IN ('general', 'medication', 'lifestyle', 'diet', 'exercise', 'followup')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  read_at timestamp with time zone,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'read', 'dismissed')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create patient questionnaire templates table
CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES profiles(id),
  clinic_id uuid REFERENCES clinics(id),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]',
  category text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create patient questionnaire responses table
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES questionnaire_templates(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  journey_id uuid REFERENCES patient_journeys(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  responses jsonb NOT NULL DEFAULT '{}',
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE patient_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_journeys
CREATE POLICY "Doctors can manage their patient journeys" ON patient_journeys
  FOR ALL
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can view their own journeys" ON patient_journeys
  FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- RLS Policies for health_milestones
CREATE POLICY "Doctors can manage milestones" ON health_milestones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = health_milestones.journey_id
      AND patient_journeys.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view their milestones" ON health_milestones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      JOIN patients ON patients.id = patient_journeys.patient_id
      WHERE patient_journeys.id = health_milestones.journey_id
      AND patients.user_id = auth.uid()
    )
  );

-- RLS Policies for health_advice
CREATE POLICY "Doctors can manage health advice" ON health_advice
  FOR ALL
  USING (created_by = auth.uid());

CREATE POLICY "Patients can view their advice" ON health_advice
  FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can update advice status" ON health_advice
  FOR UPDATE
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- RLS Policies for questionnaire_templates
CREATE POLICY "Doctors can manage their templates" ON questionnaire_templates
  FOR ALL
  USING (doctor_id = auth.uid() OR doctor_id IS NULL);

CREATE POLICY "Anyone can view active templates" ON questionnaire_templates
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for questionnaire_responses
CREATE POLICY "Doctors can view responses" ON questionnaire_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionnaire_templates
      WHERE questionnaire_templates.id = questionnaire_responses.template_id
      AND questionnaire_templates.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Patients can manage their responses" ON questionnaire_responses
  FOR ALL
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_patient_journeys_patient ON patient_journeys(patient_id);
CREATE INDEX idx_patient_journeys_doctor ON patient_journeys(doctor_id);
CREATE INDEX idx_health_milestones_journey ON health_milestones(journey_id);
CREATE INDEX idx_health_advice_patient ON health_advice(patient_id);
CREATE INDEX idx_health_advice_scheduled ON health_advice(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_questionnaire_responses_patient ON questionnaire_responses(patient_id);