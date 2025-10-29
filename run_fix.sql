-- Fix agent_withdrawals table to handle NULL constraints properly

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

-- Set default for account_details
UPDATE agent_withdrawals 
SET account_details = '{}'
WHERE account_details IS NULL;

-- Make account_details NOT NULL
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'agent_withdrawals' 
        AND column_name = 'account_details'
    ) THEN
        -- First, ensure no NULL values
        UPDATE agent_withdrawals SET account_details = '{}' WHERE account_details IS NULL;
        
        -- Then make it NOT NULL
        ALTER TABLE agent_withdrawals ALTER COLUMN account_details SET NOT NULL;
        ALTER TABLE agent_withdrawals ALTER COLUMN account_details SET DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add comment to the column
COMMENT ON COLUMN agent_withdrawals.account_details IS 'Payment account details (JSONB) containing payment method specific information';

-- Verify the fix
SELECT 
    column_name, 
    is_nullable, 
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'agent_withdrawals'
AND column_name IN ('payment_details', 'account_details')
ORDER BY column_name;

