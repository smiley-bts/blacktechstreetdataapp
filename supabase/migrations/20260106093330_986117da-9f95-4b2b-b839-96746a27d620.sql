-- Create contacts table for real-time synced contacts
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id TEXT UNIQUE,
  uid TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  
  -- Demographics
  age_range TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Professional Info
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  role_description TEXT,
  
  -- CRM Status
  lifecycle_stage TEXT,
  lead_status TEXT,
  contact_owner TEXT,
  create_date TEXT,
  last_activity_date TEXT,
  last_modified_date TEXT,
  
  -- AI Experience & Survey
  ai_experience_level TEXT,
  ai_confidence TEXT,
  pre_workshop_mindset TEXT,
  post_workshop_mindset TEXT,
  income_range TEXT,
  
  -- Program/Cohort
  cohort1_ai_level TEXT,
  cohort1_industry TEXT,
  events_attended TEXT,
  sept27th_reg TEXT,
  
  -- Marketing
  marketing_contact_status TEXT,
  email_domain TEXT,
  record_source TEXT,
  
  -- Community
  community_involvement TEXT,
  volunteer_interest TEXT,
  linkedin_url TEXT,
  
  -- Feedback fields
  nps_score TEXT,
  after_event_opportunities TEXT,
  new_concept_learned TEXT,
  optional_quote TEXT,
  
  -- Build Day fields
  team_build_description TEXT,
  ai_tools_used TEXT,
  roles_on_team TEXT,
  team_impact TEXT,
  aha_moment TEXT,
  favorite_part TEXT,
  one_way_to_use_ai TEXT,
  wish_covered_more TEXT,
  attend_follow_up TEXT,
  
  -- AI Confidence
  post_event_ai_confidence TEXT,
  responsible_ai_preparedness TEXT,
  ai_task_understanding TEXT,
  strongest_skill_after_today TEXT,
  
  -- Team Dynamics
  knew_team_before TEXT,
  space_felt_welcoming TEXT,
  bias_responsibility TEXT,
  team_community_design TEXT,
  
  -- Extra data as JSONB for flexibility
  raw_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admins can manage contacts
CREATE POLICY "Admins can view contacts"
ON public.contacts FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert contacts"
ON public.contacts FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update contacts"
ON public.contacts FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete contacts"
ON public.contacts FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_record_id ON public.contacts(record_id);
CREATE INDEX idx_contacts_lifecycle_stage ON public.contacts(lifecycle_stage);
CREATE INDEX idx_contacts_events_attended ON public.contacts(events_attended);

-- Enable realtime for contacts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;