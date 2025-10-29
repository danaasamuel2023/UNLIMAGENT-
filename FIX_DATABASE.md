# Fix Database Missing Columns

## Error Message
```
Could not find the 'customer_message' column of 'agent_transactions' in the schema cache
```

## Solution

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Add missing columns to agent_transactions
ALTER TABLE agent_transactions 
ADD COLUMN IF NOT EXISTS customer_message TEXT,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);

-- Verify they were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agent_transactions' 
AND column_name IN ('customer_message', 'customer_phone', 'customer_email');
```

## Quick Copy-Paste SQL

```sql
ALTER TABLE agent_transactions ADD COLUMN IF NOT EXISTS customer_message TEXT;
ALTER TABLE agent_transactions ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE agent_transactions ADD COLUMN IF NOT EXISTS customer_email VARCHAR(100);
```

## After Running

Refresh your browser and try creating an order again.

## Alternative: Run Migration

Or apply the migration file: `supabase/migrations/003_add_missing_columns.sql`

