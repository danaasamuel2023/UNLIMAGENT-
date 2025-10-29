# Transaction Schema Fix

## Issues Fixed

### 1. MB Column Error
**Error:** `Could not find the 'mb' column of 'agent_transactions' in the schema cache`

**Solution:** Removed `mb` field from all transaction inserts since:
- It's optional (nullable) in the schema
- Some databases may not have it cached
- It's not essential - `capacity` field exists which is more important
- `mb` can be calculated if needed: `capacity * 1024`

### 2. Missing Required Fields
**Issues:**
- `net_profit` field was missing (required by schema)
- `payment_method` cannot be null (must be one of: wallet, momo, cash, bank_transfer, paystack)

**Solution:**
- Added `net_profit: product.profit` (assuming no platform fee)
- Changed `payment_method` from `null` to `'cash'` as default
- Ensured wallet payments use `'wallet'`

### 3. Non-existent Field
**Issue:** `customer_transaction_id` field doesn't exist in agent_transactions table

**Solution:** Removed this field from inserts

## Files Modified

### `app/api/payment/initialize/route.ts`
- Removed `mb` field
- Added `net_profit` field
- Added `payment_reference` field

### `app/api/orders/create/route.ts`
- Removed `mb` field
- Removed `customer_transaction_id` field
- Added `net_profit` field
- Changed `payment_method` to use proper values ('wallet' or 'cash')
- Added `payment_reference` field

## Schema Match
Now all inserted fields match the `agent_transactions` table schema:
- ✅ Required fields present
- ✅ No invalid fields
- ✅ No nullable fields used as non-null
- ✅ Payment method values are valid

## Status
✅ Fixed and tested
✅ No linter errors
✅ Schema-compliant

