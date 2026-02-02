-- =============================================
-- PHASE 1: Participant Identity System Schema
-- =============================================

-- Create participants table (the single source of truth per human)
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  age_range TEXT,
  ai_experience_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  -- Metadata
  original_contact_id TEXT, -- Reference to old contacts.record_id for migration
  is_stakeholder BOOLEAN DEFAULT false,
  notes TEXT
);

-- Create participant_emails table (allows multiple emails per person)
CREATE TABLE public.participant_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  source TEXT, -- e.g., 'hubspot', 'june2025_registration', 'manual'
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID,
  UNIQUE(email) -- Each email can only belong to one participant
);

-- Create event_attendance table (actual attendance records)
CREATE TABLE public.event_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT, -- 'workshop', 'build_day', 'happy_hour', 'ltf', etc.
  confirmed_attended BOOLEAN DEFAULT true,
  registered_only BOOLEAN DEFAULT false, -- True if only registered but didn't attend
  source TEXT, -- Where this data came from
  day_label TEXT, -- For multi-day events: 'Day 1', 'Day 2'
  completed_survey BOOLEAN DEFAULT false,
  signed_release BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(participant_id, event_name, event_date, day_label)
);

-- Create merge_history table (audit trail for all merges)
CREATE TABLE public.merge_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kept_participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE SET NULL,
  merged_participant_id UUID, -- The ID that was merged away (now deleted)
  merged_participant_name TEXT, -- Store name for reference
  merged_emails TEXT[], -- Emails that were moved to kept participant
  merged_data_snapshot JSONB, -- Full snapshot of merged record before deletion
  merge_reason TEXT, -- 'auto_dedup', 'manual', 'email_match', etc.
  merged_by UUID,
  merged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_participants_email ON public.participants(primary_email);
CREATE INDEX idx_participants_name ON public.participants(full_name);
CREATE INDEX idx_participants_phone ON public.participants(phone);
CREATE INDEX idx_participant_emails_email ON public.participant_emails(email);
CREATE INDEX idx_participant_emails_participant ON public.participant_emails(participant_id);
CREATE INDEX idx_event_attendance_participant ON public.event_attendance(participant_id);
CREATE INDEX idx_event_attendance_event ON public.event_attendance(event_name, event_date);
CREATE INDEX idx_merge_history_kept ON public.merge_history(kept_participant_id);

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merge_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participants
CREATE POLICY "Admins can view participants"
  ON public.participants FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert participants"
  ON public.participants FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update participants"
  ON public.participants FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete participants"
  ON public.participants FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS Policies for participant_emails
CREATE POLICY "Admins can view participant_emails"
  ON public.participant_emails FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert participant_emails"
  ON public.participant_emails FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update participant_emails"
  ON public.participant_emails FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete participant_emails"
  ON public.participant_emails FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS Policies for event_attendance
CREATE POLICY "Admins can view event_attendance"
  ON public.event_attendance FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert event_attendance"
  ON public.event_attendance FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update event_attendance"
  ON public.event_attendance FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete event_attendance"
  ON public.event_attendance FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS Policies for merge_history
CREATE POLICY "Admins can view merge_history"
  ON public.merge_history FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert merge_history"
  ON public.merge_history FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Updated_at trigger for participants
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();