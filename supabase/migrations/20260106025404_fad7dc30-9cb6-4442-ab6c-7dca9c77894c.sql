-- Create table for contact tags (migrating from localStorage)
CREATE TABLE public.contact_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(contact_id, tag)
);

-- Create table for contact notes (migrating from localStorage)
CREATE TABLE public.contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id TEXT NOT NULL UNIQUE,
  note TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create table for contact field overrides (migrating from localStorage)
CREATE TABLE public.contact_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(contact_id, field_name)
);

-- Enable RLS on all tables
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_overrides ENABLE ROW LEVEL SECURITY;

-- Policies for contact_tags - only admins can CRUD
CREATE POLICY "Admins can view contact tags"
ON public.contact_tags FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert contact tags"
ON public.contact_tags FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update contact tags"
ON public.contact_tags FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete contact tags"
ON public.contact_tags FOR DELETE
USING (public.is_admin(auth.uid()));

-- Policies for contact_notes - only admins can CRUD
CREATE POLICY "Admins can view contact notes"
ON public.contact_notes FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert contact notes"
ON public.contact_notes FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update contact notes"
ON public.contact_notes FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete contact notes"
ON public.contact_notes FOR DELETE
USING (public.is_admin(auth.uid()));

-- Policies for contact_overrides - only admins can CRUD
CREATE POLICY "Admins can view contact overrides"
ON public.contact_overrides FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert contact overrides"
ON public.contact_overrides FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update contact overrides"
ON public.contact_overrides FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete contact overrides"
ON public.contact_overrides FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_contact_tags_contact_id ON public.contact_tags(contact_id);
CREATE INDEX idx_contact_notes_contact_id ON public.contact_notes(contact_id);
CREATE INDEX idx_contact_overrides_contact_id ON public.contact_overrides(contact_id);