-- Add demographic fields to participants table for comprehensive tracking
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS income_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS cohort_id TEXT,
ADD COLUMN IF NOT EXISTS cohort_start_date DATE,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS veteran_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS disability_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demographic_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demographic_updated_at TIMESTAMP WITH TIME ZONE;

-- Add index for zip code queries (geographic analysis)
CREATE INDEX IF NOT EXISTS idx_participants_zip_code ON public.participants(zip_code);

-- Add index for cohort queries
CREATE INDEX IF NOT EXISTS idx_participants_cohort ON public.participants(cohort_id);

-- Comment on columns for documentation
COMMENT ON COLUMN public.participants.zip_code IS 'Participant ZIP code for geographic analysis';
COMMENT ON COLUMN public.participants.income_range IS 'Income bracket for grant reporting';
COMMENT ON COLUMN public.participants.education_level IS 'Highest education level completed';
COMMENT ON COLUMN public.participants.cohort_id IS 'Program cohort identifier (e.g., ASPIRE-2025-Q1)';
COMMENT ON COLUMN public.participants.cohort_start_date IS 'Date participant joined their cohort';
COMMENT ON COLUMN public.participants.demographic_completed IS 'Whether all required demographic fields are filled';