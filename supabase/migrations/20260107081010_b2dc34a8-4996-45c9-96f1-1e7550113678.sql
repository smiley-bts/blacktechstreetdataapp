-- Create storage policies for the signatures bucket to allow authenticated users to upload

-- Allow authenticated users to upload signatures
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signatures');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'signatures');

-- Allow public read access to signatures (bucket is already public)
CREATE POLICY "Public can view signatures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'signatures');