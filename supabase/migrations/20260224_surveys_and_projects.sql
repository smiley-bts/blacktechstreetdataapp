-- ============================================================
-- SURVEYS + PROJECT SUBMISSIONS
-- MarkusV4 | 2026-02-24
-- ============================================================
-- Adds:
--   1. pre_survey_form_id / post_survey_form_id on events
--   2. survey_responses table (pre + post, linked to event + registration)
--   3. project_submissions table (file uploads linked to registration)
-- ============================================================

-- ── EXTEND EVENTS TABLE ───────────────────────────────────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS pre_survey_form_id   TEXT,  -- Tally form ID for pre-event survey
  ADD COLUMN IF NOT EXISTS post_survey_form_id  TEXT,  -- Tally form ID for post-event survey
  ADD COLUMN IF NOT EXISTS project_upload_open  BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.events.pre_survey_form_id  IS 'Tally form ID for pre-event survey';
COMMENT ON COLUMN public.events.post_survey_form_id IS 'Tally form ID for post-event survey';
COMMENT ON COLUMN public.events.project_upload_open IS 'Whether project submissions are currently accepted';

-- ── SURVEY RESPONSES TABLE ────────────────────────────────────
-- Stores both pre-event and post-event survey responses from Tally.
-- `survey_type` = 'pre' | 'post'
-- Linked to event_registrations by email when possible.
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id     UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  survey_type         TEXT NOT NULL CHECK (survey_type IN ('pre', 'post')),

  -- Respondent identity (from Tally)
  email               TEXT,
  full_name           TEXT,
  first_name          TEXT,
  last_name           TEXT,

  -- Tally metadata
  tally_form_id       TEXT,
  tally_submission_id TEXT UNIQUE,  -- deduplication key

  -- All survey fields stored as JSONB for flexibility
  -- Shape varies per form — we store raw + extract key fields
  responses           JSONB NOT NULL DEFAULT '{}',

  -- Common pre-survey fields (extracted for querying)
  age_range           TEXT,
  zip_code            TEXT,
  current_role        TEXT,
  education_level     TEXT,
  industry            TEXT,
  ai_experience_level TEXT,
  ai_confidence_pre   INTEGER,  -- numeric 1-5 scale if applicable
  community_involvement TEXT,

  -- Common post-survey fields (extracted for querying)
  ai_confidence_post  INTEGER,  -- numeric 1-5 scale
  nps_score           INTEGER,  -- 0-10 likelihood to recommend
  biggest_aha         TEXT,
  plan_to_use_ai      TEXT,
  skill_strongest     TEXT,
  mindset_before      TEXT,
  mindset_after       TEXT,
  felt_welcoming      TEXT,
  suggestions         TEXT,

  submitted_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_event      ON public.survey_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_survey_type       ON public.survey_responses(survey_type);
CREATE INDEX IF NOT EXISTS idx_survey_email      ON public.survey_responses(email);
CREATE INDEX IF NOT EXISTS idx_survey_reg        ON public.survey_responses(registration_id);
CREATE INDEX IF NOT EXISTS idx_survey_tally_sub  ON public.survey_responses(tally_submission_id);

-- ── PROJECT SUBMISSIONS TABLE ─────────────────────────────────
-- Stores participant project uploads linked to an event registration.
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id   UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,

  -- Submitter info
  email             TEXT,
  full_name         TEXT,
  team_name         TEXT,

  -- Project details
  project_title     TEXT NOT NULL,
  project_description TEXT,
  project_category  TEXT,  -- e.g. 'health', 'education', 'economic', 'other'
  project_tags      TEXT[] DEFAULT '{}',

  -- File upload (Supabase Storage)
  file_url          TEXT,   -- public URL of uploaded file
  file_name         TEXT,
  file_type         TEXT,   -- MIME type
  file_size_bytes   BIGINT,
  storage_path      TEXT,   -- internal Supabase storage path

  -- Additional links
  demo_url          TEXT,
  slides_url        TEXT,

  -- Tally source (if submitted via Tally form)
  tally_form_id       TEXT,
  tally_submission_id TEXT UNIQUE,

  submitted_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_event   ON public.project_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_projects_reg     ON public.project_submissions(registration_id);
CREATE INDEX IF NOT EXISTS idx_projects_email   ON public.project_submissions(email);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE public.survey_responses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Surveys: admin full access, anyone can insert (webhook)
CREATE POLICY "Admins manage survey responses"
  ON public.survey_responses FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can submit survey response"
  ON public.survey_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Survey responses are readable by admins"
  ON public.survey_responses FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Projects: admin full access, anyone can insert + select own
CREATE POLICY "Admins manage project submissions"
  ON public.project_submissions FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can submit a project"
  ON public.project_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Projects are publicly viewable"
  ON public.project_submissions FOR SELECT
  USING (true);

-- ── COMMENTS ──────────────────────────────────────────────────
COMMENT ON TABLE public.survey_responses    IS 'Pre and post event survey responses from Tally';
COMMENT ON TABLE public.project_submissions IS 'Participant project uploads linked to event registrations';
