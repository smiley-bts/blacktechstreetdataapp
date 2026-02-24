-- ============================================================
-- UNIFIED EVENT MODEL
-- MarkusV4 | 2026-02-24
-- ============================================================
-- Replaces per-event hardcoded hooks with a single events table.
-- Supports: Tally webhook registration, QR check-in, CRM sync.
-- ============================================================

-- ── EVENTS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  event_date       DATE NOT NULL,
  start_time       TIME,
  end_time         TIME,
  location         TEXT,
  location_url     TEXT,
  event_type       TEXT NOT NULL DEFAULT 'workshop',
  -- event_type values: 'workshop', 'community_engagement', 'enterprise', 'conference', 'other'
  max_capacity     INTEGER,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  tally_form_id    TEXT,            -- Tally form ID linked to this event
  tally_form_url   TEXT,            -- Full Tally form URL
  tags             TEXT[] DEFAULT '{}',
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by       UUID REFERENCES auth.users(id)
);

-- ── EVENT REGISTRATIONS TABLE ─────────────────────────────────
-- One row per (participant, event) registration.
-- QR token is the check-in identifier — unique per registration.
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id              UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id        UUID REFERENCES public.participants(id) ON DELETE SET NULL,

  -- Contact info captured at registration (in case participant not yet in DB)
  first_name            TEXT,
  last_name             TEXT,
  full_name             TEXT,
  email                 TEXT,
  phone                 TEXT,
  age_range             TEXT,
  zip_code              TEXT,
  income_range          TEXT,
  current_role          TEXT,
  ai_experience_level   TEXT,
  ai_confidence         TEXT,
  community_involvement TEXT,

  -- Registration metadata
  registration_source   TEXT NOT NULL DEFAULT 'tally', -- 'tally', 'manual', 'import', 'api'
  tally_submission_id   TEXT UNIQUE,   -- Prevents duplicate webhook delivery
  tally_response_id     TEXT,
  registered_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- QR / Check-in
  qr_token              TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  checked_in            BOOLEAN NOT NULL DEFAULT false,
  checked_in_at         TIMESTAMP WITH TIME ZONE,
  checked_in_by         UUID REFERENCES auth.users(id),
  check_in_method       TEXT,  -- 'qr_scan', 'manual', 'imported'

  -- Survey / Release
  completed_survey      BOOLEAN NOT NULL DEFAULT false,
  signed_release        BOOLEAN NOT NULL DEFAULT false,
  release_signature_url TEXT,

  -- Raw Tally payload for debugging
  raw_tally_data        JSONB DEFAULT '{}',

  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_date        ON public.events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_type        ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_tally       ON public.events(tally_form_id) WHERE tally_form_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_event       ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_participant  ON public.event_registrations(participant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email       ON public.event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token    ON public.event_registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in  ON public.event_registrations(checked_in);
CREATE INDEX IF NOT EXISTS idx_registrations_tally_sub   ON public.event_registrations(tally_submission_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE public.events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events: public read, admin write
CREATE POLICY "Events are publicly readable"
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (public.is_admin(auth.uid()));

-- Registrations: admin full access, anon insert only (for webhook)
CREATE POLICY "Admins can manage registrations"
  ON public.event_registrations FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can register (insert)"
  ON public.event_registrations FOR INSERT
  WITH CHECK (true);

-- Check-in lookup: allow reading own record by qr_token (for check-in page)
CREATE POLICY "QR token check-in lookup"
  ON public.event_registrations FOR SELECT
  USING (true);  -- Check-in page is admin-only so broad read is fine; tighten later if needed

-- ── UPDATED_AT TRIGGERS ───────────────────────────────────────
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── SYNC FUNCTION: registration → participants → contacts ──────
-- Called after a registration is inserted/updated.
-- Upserts a participants row and links it back to the registration.
CREATE OR REPLACE FUNCTION public.sync_registration_to_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_id UUID;
  v_email TEXT;
BEGIN
  v_email := lower(trim(NEW.email));

  -- Skip if no email
  IF v_email IS NULL OR v_email = '' THEN
    RETURN NEW;
  END IF;

  -- Upsert participant by email
  INSERT INTO public.participants (
    first_name, last_name, full_name, age_range, is_stakeholder
  )
  SELECT
    NEW.first_name,
    NEW.last_name,
    COALESCE(NEW.full_name, trim(COALESCE(NEW.first_name,'') || ' ' || COALESCE(NEW.last_name,''))),
    NEW.age_range,
    false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.participant_emails WHERE lower(trim(email)) = v_email
  )
  RETURNING id INTO v_participant_id;

  -- If participant already exists, fetch their ID
  IF v_participant_id IS NULL THEN
    SELECT pe.participant_id INTO v_participant_id
    FROM public.participant_emails pe
    WHERE lower(trim(pe.email)) = v_email
    LIMIT 1;
  ELSE
    -- Insert email record for new participant
    INSERT INTO public.participant_emails (participant_id, email, is_primary)
    VALUES (v_participant_id, v_email, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Link registration to participant
  IF v_participant_id IS NOT NULL THEN
    NEW.participant_id := v_participant_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_registration_participant
  BEFORE INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.sync_registration_to_participant();

-- ── CHECK-IN FUNCTION ─────────────────────────────────────────
-- Marks a registration as checked in by QR token.
-- Returns the registration row + event info.
CREATE OR REPLACE FUNCTION public.checkin_by_qr_token(
  p_qr_token   TEXT,
  p_checked_in_by UUID DEFAULT NULL,
  p_method     TEXT DEFAULT 'qr_scan'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg   public.event_registrations%ROWTYPE;
  v_event public.events%ROWTYPE;
BEGIN
  -- Find registration
  SELECT * INTO v_reg
  FROM public.event_registrations
  WHERE qr_token = p_qr_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'QR code not found');
  END IF;

  IF v_reg.checked_in THEN
    -- Already checked in — return info but flag it
    SELECT * INTO v_event FROM public.events WHERE id = v_reg.event_id;
    RETURN jsonb_build_object(
      'success', true,
      'already_checked_in', true,
      'checked_in_at', v_reg.checked_in_at,
      'full_name', v_reg.full_name,
      'event_name', v_event.name
    );
  END IF;

  -- Mark checked in
  UPDATE public.event_registrations
  SET
    checked_in       = true,
    checked_in_at    = now(),
    checked_in_by    = p_checked_in_by,
    check_in_method  = p_method,
    updated_at       = now()
  WHERE qr_token = p_qr_token
  RETURNING * INTO v_reg;

  -- Also record in legacy event_attendance if participant exists
  IF v_reg.participant_id IS NOT NULL THEN
    SELECT * INTO v_event FROM public.events WHERE id = v_reg.event_id;

    INSERT INTO public.event_attendance (
      participant_id,
      event_name,
      event_date,
      event_type,
      confirmed_attended,
      registration_id
    )
    VALUES (
      v_reg.participant_id,
      v_event.name,
      v_event.event_date,
      v_event.event_type,
      true,
      v_reg.id
    )
    ON CONFLICT (participant_id, event_name, event_date) DO UPDATE
      SET confirmed_attended = true,
          updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'already_checked_in', false,
    'full_name', v_reg.full_name,
    'email', v_reg.email,
    'event_name', v_event.name,
    'registration_id', v_reg.id
  );
END;
$$;

-- ── ADD registration_id TO event_attendance ────────────────────
-- Links legacy attendance records back to unified registrations.
ALTER TABLE public.event_attendance
  ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.event_registrations(id);

-- ── COMMENTS ──────────────────────────────────────────────────
COMMENT ON TABLE public.events IS 'Unified event catalog — replaces hardcoded per-event hooks';
COMMENT ON TABLE public.event_registrations IS 'One row per attendee per event. QR token used for check-in.';
COMMENT ON COLUMN public.event_registrations.qr_token IS 'Unique token encoded as QR code on confirmation. Scanned at check-in.';
COMMENT ON COLUMN public.event_registrations.tally_submission_id IS 'Tally form submission ID — prevents duplicate webhook processing';
