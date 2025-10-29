# Setup Guide: Store Logo & Wallet Integration

## Quick Setup (5 Minutes)

### 1. Run Database Migration

Open Supabase SQL Editor and run:

```sql
-- Add store_logo_url column
ALTER TABLE agent_stores 
ADD COLUMN IF NOT EXISTS store_logo_url TEXT;
```

### 2. Create Storage Bucket

In Supabase Dashboard → Storage → Create Bucket:
- **Bucket ID:** `agent-assets`
- **Public:** ✅ Enabled
- Click "Create bucket"

### 3. Set Storage Policies

In Supabase SQL Editor:

```sql
-- Allow agents to upload logos
CREATE POLICY "Agents can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-assets');

-- Allow public to view logos
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'agent-assets');
```

---

## ✅ Done! 

Now you can:

### For Agents:
1. Go to `/agent/settings`
2. Upload your store logo
3. Logo appears on your public store immediately

### For Customers:
1. Visit any store page
2. See wallet balance in sidebar
3. Click "Add Funds" to top up
4. Pay with wallet on purchase

---

## Features

✅ **Agent Logo Upload** - Brand your store
✅ **Wallet Display** - Show balance on store pages  
✅ **Modern Design** - Professional appearance
✅ **Pay with Wallet** - Seamless payments
✅ **Quick Actions** - View wallet, add funds

---

**Already working:** Just create the storage bucket and run the migration!

