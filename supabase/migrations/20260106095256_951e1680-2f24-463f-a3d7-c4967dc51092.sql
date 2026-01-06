-- Add release form fields to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS release_signed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS release_date text,
ADD COLUMN IF NOT EXISTS release_signature_url text,
ADD COLUMN IF NOT EXISTS image_release_agreed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS confidentiality_agreed boolean DEFAULT false;

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for signature uploads (admin only)
CREATE POLICY "Admins can upload signatures"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'signatures' AND public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view signatures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'signatures');

CREATE POLICY "Admins can delete signatures"
ON storage.objects
FOR DELETE
USING (bucket_id = 'signatures' AND public.is_admin(auth.uid()));