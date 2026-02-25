-- ============================================================
-- LAPTOP INVENTORY SYSTEM
-- 2026-02-25
-- ============================================================
-- Basic inventory tracking for laptop check-out/return at events.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.laptops (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label            TEXT NOT NULL UNIQUE,
  make             TEXT,
  model            TEXT,
  serial_number    TEXT,
  condition        TEXT NOT NULL DEFAULT 'good',
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by       UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.laptop_checkouts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laptop_id           UUID NOT NULL REFERENCES public.laptops(id) ON DELETE CASCADE,
  checked_out_to      TEXT NOT NULL,
  checked_out_to_email TEXT,
  event_id            UUID REFERENCES public.events(id),
  checked_out_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checked_out_by      UUID REFERENCES auth.users(id),
  returned_at         TIMESTAMP WITH TIME ZONE,
  returned_to         UUID REFERENCES auth.users(id),
  condition_on_return TEXT,
  notes               TEXT,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_laptop_checkouts_laptop_id ON public.laptop_checkouts(laptop_id);
CREATE INDEX IF NOT EXISTS idx_laptop_checkouts_active ON public.laptop_checkouts(laptop_id) WHERE returned_at IS NULL;

-- RLS
ALTER TABLE public.laptops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laptop_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read laptops"
  ON public.laptops FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/staff can manage laptops"
  ON public.laptops FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated can read laptop_checkouts"
  ON public.laptop_checkouts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/staff can manage laptop_checkouts"
  ON public.laptop_checkouts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Updated_at trigger for laptops
CREATE TRIGGER update_laptops_updated_at
  BEFORE UPDATE ON public.laptops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
