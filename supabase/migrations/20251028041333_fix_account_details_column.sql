-- Fix missing or NULL account_details/payment_details columns in agent_withdrawals table

-- Step 1: Check and fix payment_details column if it exists
DO $$ 
BEGIN
    -- If payment_details column exists, fix any NULL values
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'agent_withdrawals' 
        AND column_name = 'payment_details'
    ) THEN
        -- Update any NULL values to empty JSON object
        EXECUTE 'UPDATE agent_withdrawals SET payment_details = ''{}'' WHERE payment_details IS NULL';
    END IF;
END $$;

-- Step 2: Add account_details column if it doesn't exist (without NOT NULL first)
ALTER TABLE agent_withdrawals 
ADD COLUMN IF NOT EXISTS account_details JSONB;

-- Step 3: Update any existing NULL values to an empty JSON object
UPDATE agent_withdrawals 
SET account_details = '{}'
WHERE account_details IS NULL;

-- Step 4: Now make the column NOT NULL
ALTER TABLE agent_withdrawals 
ALTER COLUMN account_details SET NOT NULL;

-- Step 5: Handle payment_details column - make it nullable if it exists to avoid constraint errors
DO $$ 
BEGIN
    -- If payment_details column exists and has NOT NULL constraint, we need to handle it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'agent_withdrawals' 
        AND column_name = 'payment_details'
    ) THEN
        -- Drop NOT NULL constraint if it exists
        EXECUTE 'ALTER TABLE agent_withdrawals ALTER COLUMN payment_details DROP NOT NULL';
        
        -- Update any remaining NULL values to empty JSON object
        EXECUTE 'UPDATE agent_withdrawals SET payment_details = ''{}'' WHERE payment_details IS NULL';
    END IF;
END $$;

-- Add comment to the columns
COMMENT ON COLUMN agent_withdrawals.account_details IS 'Payment account details (JSONB) containing payment method specific information like Momo number, bank account, etc.';

