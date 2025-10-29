# Migration: Add store_logo_url Column

## Problem
The error "Could not find the 'store_logo_url' column" means the column hasn't been added to your `agent_stores` table yet.

## Solution

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run this SQL:

```sql
ALTER TABLE agent_stores 
ADD COLUMN IF NOT EXISTS store_logo_url TEXT;

COMMENT ON COLUMN agent_stores.store_logo_url IS 'URL of the store logo uploaded by the agent';
```

### Option 2: Use the Migration File

The migration file already exists at: `supabase/migrations/004_add_store_logo.sql`

Run it using:
```bash
supabase db push
```

### Verify the Migration

After running the migration, verify the column was added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_stores'
AND column_name = 'store_logo_url';
```

## After Migration

Once the column is added, the logo upload feature will work correctly.

