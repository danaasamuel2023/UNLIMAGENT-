-- Add store_logo_url column to agent_stores table

ALTER TABLE agent_stores 
ADD COLUMN IF NOT EXISTS store_logo_url TEXT;

-- Add comment
COMMENT ON COLUMN agent_stores.store_logo_url IS 'URL of the store logo uploaded by the agent';

