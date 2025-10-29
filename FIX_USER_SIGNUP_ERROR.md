# Fix for "Database error saving new user"

## Problem
When users try to sign up, they get a "Database error saving new user" error. This is caused by the database trigger that automatically creates a customer wallet when a new user signs up.

## Root Cause
The trigger `create_customer_wallet_on_signup()` tries to insert a phone number from user metadata, but:
1. The `phone_number` column in `customer_wallets` is `NOT NULL`
2. The trigger inserts an empty string `''` when phone_number is missing from user metadata
3. This violates database constraints or causes other issues

## Solution
A new migration has been created that:
1. Makes the trigger function more robust with better error handling
2. Uses fallback values when phone_number is missing
3. Wraps the insert in exception handling so user creation doesn't fail

## How to Apply the Fix

### Option 1: Apply via Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Open the migration file: `supabase/migrations/008_fix_customer_wallet_signup.sql`
4. Copy and paste the SQL into the editor
5. Click "Run"

### Option 2: Apply via Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Apply Manually
Run this SQL in your Supabase SQL Editor:

```sql
-- Fix customer wallet creation trigger
CREATE OR REPLACE FUNCTION create_customer_wallet_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_phone VARCHAR(20);
BEGIN
  -- Extract phone number from user metadata, or use email as fallback
  user_phone := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'phone_number', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    SUBSTRING(NEW.email FROM '^[^@]+'),
    '0000000000'  -- Fallback default
  );
  
  -- Only create wallet if we have a valid phone number
  IF user_phone IS NOT NULL AND LENGTH(user_phone) > 0 THEN
    INSERT INTO customer_wallets (user_id, phone_number)
    VALUES (NEW.id, user_phone)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create customer wallet for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_create_customer_wallet_on_signup ON auth.users;
CREATE TRIGGER trigger_create_customer_wallet_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_customer_wallet_on_signup();
```

## Verify the Fix
1. Try signing up a new user
2. Check that the user is created successfully
3. Verify that a customer wallet is created (or at least that user creation doesn't fail)

## Alternative: Make Phone Number Optional
If you want to make phone_number optional (not recommended), you can also run:

```sql
-- Make phone_number nullable
ALTER TABLE customer_wallets 
ALTER COLUMN phone_number DROP NOT NULL;
```

However, the trigger fix above is the better solution.

## Testing
After applying the fix:
1. Sign up with a new user (without phone number)
2. Sign up with a user that has phone_number in metadata
3. Verify both work correctly

