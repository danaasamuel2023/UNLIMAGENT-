-- First, create the bucket in Supabase Dashboard:
-- Go to Storage -> Create Bucket
-- Name: agent-assets
-- Public: Yes

-- Then run this SQL:

-- Drop existing policies if they exist (optional)
DROP POLICY IF EXISTS "Agents can upload to agent-assets" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Agents can delete their files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view agent assets" ON storage.objects;

-- Create policies for storage objects
CREATE POLICY "Agents can upload to agent-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-assets');

CREATE POLICY "Agents can update their files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'agent-assets');

CREATE POLICY "Agents can delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'agent-assets');

CREATE POLICY "Public can view agent assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'agent-assets');

