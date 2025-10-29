# Apply Database Migration Fix

## Issue
"Failed to update withdrawal" error likely due to NULL constraint on `payment_details` or missing `account_details` column.

## Solution

### Option 1: Apply via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the following SQL:

```sql
-- Fix payment_details/account_details columns in agent_withdrawals table

-- Step 1: Make payment_details nullable if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'agent_withdrawals' 
        AND column_name = 'payment_details'
    ) THEN
        -- Drop NOT NULL constraint
        ALTER TABLE agent_withdrawals ALTER COLUMN payment_details DROP NOT NULL;
        
        -- Set NULL values to empty JSON
        UPDATE agent_withdrawals SET payment_details = '{}' WHERE payment_details IS NULL;
    END IF;
END $$;

-- Step 2: Ensure account_details exists and has proper constraints
ALTER TABLE agent_withdrawals 
ADD COLUMN IF NOT EXISTS account_details JSONB;

-- Step 3: Set default for account_details
UPDATE agent_withdrawals 
SET account_details = '{}'
WHERE account_details IS NULL;

-- Step 4: Make account_details NOT NULL
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'agent_withdrawals' 
        AND column_name = 'account_details'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE agent_withdrawals ALTER COLUMN account_details SET NOT NULL;
    END IF;
END $$;

-- Verify the fix
SELECT 
    column_name, 
    is_nullable, 
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'agent_withdrawals'
AND column_name IN ('payment_details', 'account_details');
```

### Option 2: Check Current Table Structure

Run this query first to see the current state:

```sql
SELECT 
    column_name, 
    is_nullable, 
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'agent_withdrawals'
ORDER BY column_name;
```

## Expected Result

After applying the migration:
- `payment_details` (if exists) should be nullable
- `account_details` should exist and be NOT NULL
- Both columns should have empty JSON `{}` as defaults for existing records

## Testing

After applying the migration:
1. Try to create a new withdrawal from an agent
2. Try to update a withdrawal status from the admin panel
3. Check browser console and server logs for any errors

## Common Errors and Solutions

### Error: "null value in column payment_details violates not-null constraint"
**Solution**: Apply the migration to make the column nullable

### Error: "column account_details does not exist"
**Solution**: Run `ALTER TABLE agent_withdrawals ADD COLUMN account_details JSONB NOT NULL DEFAULT '{}'`

### Error: "duplicate key value violates unique constraint"
**Solution**: This is a different issue, likely with withdrawal_id. Check for duplicates.

