-- Create storage bucket for ASPIRE project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true);

-- Create RLS policy to allow public read access
CREATE POLICY "Project files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-files');

-- Create RLS policy to allow authenticated uploads (for admin)
CREATE POLICY "Authenticated users can upload project files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- Create RLS policy to allow authenticated updates
CREATE POLICY "Authenticated users can update project files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- Create RLS policy to allow authenticated deletes
CREATE POLICY "Authenticated users can delete project files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');