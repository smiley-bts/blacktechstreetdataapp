-- Create project archive status enum
CREATE TYPE public.project_status AS ENUM ('active', 'at_risk', 'archived', 'deleted');

-- Create project archives table for preserving participant work
CREATE TABLE public.project_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Original submission info
    original_submission_id TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    
    -- Team info
    team_rep_name TEXT NOT NULL,
    team_rep_email TEXT,
    team_members TEXT[] DEFAULT '{}',
    
    -- Project details
    project_name TEXT NOT NULL,
    description TEXT,
    
    -- Links and files
    lovable_project_url TEXT,
    project_links TEXT[] DEFAULT '{}',
    file_urls TEXT[] DEFAULT '{}',
    
    -- Archive-specific fields
    status project_status NOT NULL DEFAULT 'active',
    is_winner BOOLEAN DEFAULT FALSE,
    winner_category TEXT,
    
    -- Snapshot data
    snapshot_url TEXT,
    snapshot_taken_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Risk tracking
    at_risk_since TIMESTAMP WITH TIME ZONE,
    at_risk_reason TEXT,
    
    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Unique constraint on original submission
    UNIQUE(original_submission_id, event_name)
);

-- Enable RLS
ALTER TABLE public.project_archives ENABLE ROW LEVEL SECURITY;

-- Policies for project archives (admin only for write, public read)
CREATE POLICY "Project archives are viewable by everyone"
ON public.project_archives
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert project archives"
ON public.project_archives
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update project archives"
ON public.project_archives
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete project archives"
ON public.project_archives
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create indexes for common queries
CREATE INDEX idx_project_archives_event ON public.project_archives(event_name, event_date);
CREATE INDEX idx_project_archives_status ON public.project_archives(status);
CREATE INDEX idx_project_archives_winner ON public.project_archives(is_winner) WHERE is_winner = TRUE;
CREATE INDEX idx_project_archives_at_risk ON public.project_archives(status) WHERE status = 'at_risk';

-- Trigger for updated_at
CREATE TRIGGER update_project_archives_updated_at
BEFORE UPDATE ON public.project_archives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.project_archives IS 'Permanent archive of participant projects for reporting and showcases';
COMMENT ON COLUMN public.project_archives.is_winner IS 'Flag for winning projects (up to 4 per event)';
COMMENT ON COLUMN public.project_archives.snapshot_url IS 'URL to archived snapshot of project state';
COMMENT ON COLUMN public.project_archives.at_risk_since IS 'When the project was flagged as at-risk of deletion';