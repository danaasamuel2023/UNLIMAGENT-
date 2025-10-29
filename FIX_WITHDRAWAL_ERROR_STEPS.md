# Fix "Failed to update withdrawal" Error

## Problem
The error "Failed to update withdrawal" is happening because of NULL constraint violations in the database.

## Solution Steps

### Step 1: Apply Database Fix

Go to your Supabase Dashboard → SQL Editor and run the contents of `run_fix.sql`.

**Or run this SQL directly:**

```sql
-- Fix agent_withdrawals table
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'agent_withdrawals' 
        AND column_name = 'payment_details'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE agent_withdrawals ALTER COLUMN payment_details DROP NOT NULL;
    END IF;
END $$;

UPDATE agent_withdrawals SET account_details = '{}' WHERE account_details IS NULL;
ALTER TABLE agent_withdrawals ADD COLUMN IF NOT EXISTS account_details JSONB NOT NULL DEFAULT '{}'::jsonb;
```

### Step 2: Restart Development Server

```bash
# Stop any running Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Start the dev server
npm run dev
```

### Step 3: Test the Fix

1. Go to http://localhost:3000/admin/withdrawals
2. Try to process a pending withdrawal
3. Check browser console for any errors
4. Check server logs in terminal

## What This Fixes

- **NULL Constraint Errors**: Makes `payment_details` nullable if it exists
- **Missing Columns**: Ensures `account_details` exists with proper defaults
- **Default Values**: Sets empty JSON `{}` for all rows

## Error Messages You Might See

### "null value in column payment_details violates not-null constraint"
→ Run the SQL fix above

### "column account_details does not exist"
→ The migration hasn't been applied yet

### "Failed to update withdrawal" with no details
→ Check browser console (F12) for the actual error

## Debugging Tips

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - The error message will tell you exactly what's wrong

2. **Check Server Logs**
   - Look at the terminal where `npm run dev` is running
   - Errors will be printed there

3. **Check Network Tab** (F12 → Network tab)
   - Find the failed API request
   - Click on it to see the response
   - The response body will have error details

## Testing Checklist

- [ ] SQL fix has been applied to database
- [ ] Dev server is running without errors
- [ ] Can view withdrawals page as admin
- [ ] Can click "Process Payment" button
- [ ] Modal appears with withdrawal details
- [ ] Can approve a withdrawal (status: pending → processing)
- [ ] Can complete a withdrawal (status: processing → completed)
- [ ] Can reject a withdrawal
- [ ] Wallet balance updates correctly

## If Error Persists

1. Check the exact error message in browser console
2. Copy the error message
3. Check if you're logged in as admin
4. Verify your user has `role: 'admin'` in Supabase auth.users table
5. Check the Supabase dashboard for any database errors

