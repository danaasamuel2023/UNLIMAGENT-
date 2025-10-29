# MB Column Fix

## Issue
The 'mb' column exists in the `agent_transactions` table but some products might not have the `mb` value set, causing database errors when creating transactions.

## Solution
Added fallback calculation when inserting transactions:

```typescript
mb: product.mb || (product.capacity * 1024)
```

This ensures:
1. Uses existing `mb` value if it exists in the product
2. Calculates it from capacity if missing (capacity * 1024 to convert GB to MB)
3. Prevents database errors during transaction creation

## Files Modified
- `app/api/payment/initialize/route.ts` - Payment initialization
- `app/api/orders/create/route.ts` - Order creation

## Status
✅ Fixed and tested
✅ No linter errors

