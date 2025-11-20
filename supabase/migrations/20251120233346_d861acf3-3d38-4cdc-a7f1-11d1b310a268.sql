-- Create telemedicine sessions table
CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table for telemedicine
CREATE TABLE IF NOT EXISTS public.telemedicine_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.telemedicine_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('doctor', 'patient')),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for telemedicine_sessions
CREATE POLICY "Doctors can view their sessions"
  ON public.telemedicine_sessions FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can view their sessions"
  ON public.telemedicine_sessions FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can manage their sessions"
  ON public.telemedicine_sessions FOR ALL
  USING (doctor_id = auth.uid());

-- RLS Policies for telemedicine_messages
CREATE POLICY "Session participants can view messages"
  ON public.telemedicine_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.telemedicine_sessions 
      WHERE doctor_id = auth.uid() 
      OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can send messages"
  ON public.telemedicine_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.telemedicine_sessions 
      WHERE doctor_id = auth.uid() 
      OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.telemedicine_messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.telemedicine_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.telemedicine_sessions;

-- Create indexes for performance
CREATE INDEX idx_telemedicine_sessions_doctor ON public.telemedicine_sessions(doctor_id);
CREATE INDEX idx_telemedicine_sessions_patient ON public.telemedicine_sessions(patient_id);
CREATE INDEX idx_telemedicine_sessions_appointment ON public.telemedicine_sessions(appointment_id);
CREATE INDEX idx_telemedicine_messages_session ON public.telemedicine_messages(session_id);
CREATE INDEX idx_telemedicine_messages_created ON public.telemedicine_messages(created_at);

-- Trigger to update updated_at
CREATE TRIGGER update_telemedicine_sessions_updated_at
  BEFORE UPDATE ON public.telemedicine_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();