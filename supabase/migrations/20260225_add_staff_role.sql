-- ============================================================
-- ADD STAFF ROLE
-- 2026-02-25
-- ============================================================
-- Adds 'staff' to the app_role enum for non-admin team members.
-- Staff can access all features except user management.
-- ============================================================

-- Add 'staff' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

-- Update is_admin to include staff (used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('admin', 'owner', 'staff')
  );
$$;

-- New helper: check if user can manage other users (admin + owner only)
CREATE OR REPLACE FUNCTION public.can_manage_users(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('admin', 'owner')
  );
$$;

-- Add checked_out fields to event_registrations (for check-out tracking)
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS checked_out BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS checked_out_by UUID REFERENCES auth.users(id);
