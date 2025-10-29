-- Add store_logo_url column to agent_stores table
-- Run this in your Supabase SQL Editor

ALTER TABLE agent_stores 
ADD COLUMN IF NOT EXISTS store_logo_url TEXT;

-- Add comment
COMMENT ON COLUMN agent_stores.store_logo_url IS 'URL of the store logo uploaded by the agent';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_stores'
AND column_name = 'store_logo_url';

