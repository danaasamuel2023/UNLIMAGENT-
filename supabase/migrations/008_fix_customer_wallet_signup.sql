-- Fix customer wallet creation trigger to handle missing phone numbers
-- The phone_number column is NOT NULL but we're inserting empty string which can cause issues

-- Option 1: Update the function to use a default phone number or make it nullable
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

-- Also update existing wallets that might have empty phone numbers
UPDATE customer_wallets
SET phone_number = COALESCE(
  NULLIF(phone_number, ''),
  (SELECT SUBSTRING(email FROM '^[^@]+') FROM auth.users WHERE id = customer_wallets.user_id),
  '0000000000'
)
WHERE phone_number IS NULL OR phone_number = '';

-- Add comment
COMMENT ON FUNCTION create_customer_wallet_on_signup() IS 'Creates a customer wallet when a new user signs up. Handles missing phone numbers gracefully.';

