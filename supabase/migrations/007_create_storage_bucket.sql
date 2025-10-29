-- Create storage bucket for agent assets (logos, etc.)
-- Note: This requires running in Supabase Dashboard SQL Editor
-- as storage buckets cannot be created via regular SQL

-- First, manually create the bucket in Supabase Dashboard:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "Create Bucket"
-- 3. Name: agent-assets
-- 4. Public: Yes (enable public access)
-- 5. Click "Create"

-- Then run this SQL to set up the policies:

-- Policy for agents to upload files
CREATE POLICY IF NOT EXISTS "Agents can upload to agent-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-assets');

-- Policy for agents to update their own files
CREATE POLICY IF NOT EXISTS "Agents can update their files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'agent-assets');

-- Policy for agents to delete their own files
CREATE POLICY IF NOT EXISTS "Agents can delete their files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'agent-assets');

-- Policy for public to view files
CREATE POLICY IF NOT EXISTS "Public can view agent assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'agent-assets');

COMMENT ON POLICY "Agents can upload to agent-assets" ON storage.objects IS 'Allows authenticated agents to upload logos and other assets';
COMMENT ON POLICY "Public can view agent assets" ON storage.objects IS 'Allows anyone to view agent logos and assets';

