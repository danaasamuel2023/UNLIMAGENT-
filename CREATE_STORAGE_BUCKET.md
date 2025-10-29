# Create Storage Bucket for Agent Logos

## Issue
The logo upload is failing because the storage bucket doesn't exist yet.

## Quick Fix (2 Minutes)

### Option 1: Via Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Navigate to Storage**: Click "Storage" in the left sidebar
3. **Create Bucket**:
   - Click "New Bucket" or "Create Bucket"
   - **Bucket Name**: `agent-assets`
   - **Public**: ✅ Enable (check this box)
   - Click "Create"

4. **Set Policies** (Run in SQL Editor):
   ```sql
   -- Policy for agents to upload files
   CREATE POLICY "Agents can upload to agent-assets"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'agent-assets');

   -- Policy for public to view files
   CREATE POLICY "Public can view agent assets"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'agent-assets');
   ```

### Option 2: Via SQL (If you prefer SQL)

1. **Go to SQL Editor** in Supabase Dashboard
2. **Create the bucket**:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('agent-assets', 'agent-assets', true);
   ```

3. **Set policies**:
   ```sql
   -- Allow agents to upload
   CREATE POLICY "Agents can upload to agent-assets"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'agent-assets');

   -- Allow public to view
   CREATE POLICY "Public can view agent assets"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'agent-assets');

   -- Allow agents to update their files
   CREATE POLICY "Agents can update their files"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'agent-assets');

   -- Allow agents to delete their files
   CREATE POLICY "Agents can delete their files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'agent-assets');
   ```

## ✅ Done!

After creating the bucket and setting policies, the logo upload will work immediately.

### Test It:
1. Go to `/agent/settings`
2. Click "Upload Logo"
3. Select an image
4. Logo will upload and display on your store!

---

## Alternative: Without Storage Bucket

If you prefer NOT to use Supabase Storage, you can:
1. Upload logos to a service like Cloudinary, Imgur, or any image hosting service
2. Store the URL in the database
3. No bucket needed!

But the current implementation expects the `agent-assets` bucket to exist.

