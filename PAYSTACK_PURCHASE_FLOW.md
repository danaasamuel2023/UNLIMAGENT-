# Paystack Purchase Flow Implementation

## Overview
Complete payment flow where store users can purchase data bundles and get redirected to Paystack for secure payment processing.

## User Flow

### 1. **Store Page** (`app/store/[slug]/page.tsx`)
- Displays store products
- Users can browse and select data bundles
- Shows product details: network, capacity, price

### 2. **Purchase Initiation** (`components/store/BuyNowButton.tsx`)
- User clicks "Buy Now" button
- Shows form to collect:
  - Phone Number (required)
  - Email (optional)
- Validates phone number (minimum 10 digits)

### 3. **Payment Initialization** (`app/api/payment/initialize/route.ts`)
**What happens:**
- Fetches product details
- Validates product availability and stock
- Generates unique transaction ID
- Creates Paystack payment request with metadata
- Stores pending transaction in database
- Returns Paystack authorization URL

**Metadata stored:**
```json
{
  "payment_type": "purchase",
  "transaction_id": "TXN...",
  "product_id": "...",
  "store_id": "...",
  "phone_number": "...",
  "network": "MTN",
  "capacity": 1,
  "amount": 10.50
}
```

### 4. **Paystack Redirect**
- User is redirected to Paystack checkout page
- Selects payment method (Mobile Money, Card, Bank, etc.)
- Completes payment on Paystack

### 5. **Payment Callback** (`app/payment/callback/page.tsx`)
**What happens:**
- Paystack redirects back with reference
- Verifies payment status
- Shows loading state
- Redirects to success page on verification

### 6. **Payment Verification** (`app/api/payment/verify-purchase/route.ts`)
**What happens:**
- Verifies payment with Paystack API
- Updates transaction status to "completed"
- Changes order status to "processing"
- Auto-fulfills the order
- Returns success confirmation

### 7. **Webhook Processing** (`app/api/webhooks/paystack/route.ts`)
**What happens:**
- Paystack sends webhook when payment succeeds
- Handles `charge.success` events
- Processes purchase payments
- Updates transaction and order status
- Auto-fulfills if not already done

**Payment Flow:**
```
User → Form → Paystack → Payment → Webhook → Verification → Success
```

### 8. **Success Page** (`app/payment/success/page.tsx`)
**What displays:**
- ✅ "Purchase Successful!" message
- Transaction ID
- Network and bundle details
- Phone number data will be sent to
- Amount paid
- Order status
- Timeline information
- Action buttons:
  - Continue Shopping
  - Track Order

### 9. **Order Tracking** (`app/track/[id]/page.tsx`)
**What displays:**
- Real-time order status
- Payment status
- Product details
- Order timeline
- Delivery information

## API Endpoints

### Payment Initialization
```typescript
POST /api/payment/initialize
Body: {
  product_id: string
  phone_number: string
  email?: string
  amount: number
}
Response: {
  authorization_url: string
  access_code: string
  reference: string
}
```

### Payment Verification
```typescript
GET /api/payment/verify-purchase?reference=xxx
Response: {
  success: true
  data: {
    transaction: {...}
    message: string
  }
}
```

### Webhook Handler
```typescript
POST /api/webhooks/paystack
Headers: {
  x-paystack-signature: string
}
Body: Paystack event
Response: {
  message: 'Purchase processed successfully'
}
```

### Order Tracking
```typescript
GET /api/orders/track/[id]
Response: {
  data: {
    transaction_id: string
    order_status: 'pending' | 'processing' | 'completed'
    payment_status: 'pending' | 'completed'
    ...
  }
}
```

## Database Tables

### `agent_transactions`
Stores transaction records:
- `transaction_id`: Unique transaction ID
- `payment_status`: 'pending' | 'completed'
- `order_status`: 'pending' | 'processing' | 'completed'
- `payment_reference`: Paystack reference
- Product and customer details

## Environment Variables Required

```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Error Handling

### Payment Cancelled
- User can click "Back" on Paystack
- Returns to store page
- No database record created

### Payment Failed
- Shows error message
- Allows retry
- Transaction marked as failed

### Network Errors
- Retry mechanism
- User-friendly error messages
- Transaction rollback on critical failures

## Security Features

1. **Transaction ID Validation**
   - Unique IDs prevent duplicates
   - Timestamp-based generation

2. **Webhook Signature Verification**
   - HMAC SHA-512 validation
   - Prevents malicious requests

3. **Amount Verification**
   - Validates amount matches product price
   - Prevents price manipulation

4. **Stock Checks**
   - Verifies product availability
   - Prevents overselling

## User Experience

✅ Clear loading states
✅ Immediate feedback
✅ Success confirmation
✅ Order tracking
✅ Error recovery
✅ Mobile-responsive design
✅ Smooth transitions

## Testing Checklist

- [ ] Purchase flow works end-to-end
- [ ] Paystack redirect works
- [ ] Payment callback processes correctly
- [ ] Webhook updates database
- [ ] Success page displays correctly
- [ ] Order tracking shows status
- [ ] Error handling works
- [ ] Mobile experience is smooth
- [ ] Transaction IDs are unique
- [ ] Stock validation works

## Next Steps

1. Test with real Paystack account
2. Configure webhook URL in Paystack dashboard
3. Test all payment methods
4. Verify SMS notifications (if implemented)
5. Monitor transaction logs
6. Set up error alerts

## Support

For issues or questions:
- Check transaction logs
- Verify webhook configuration
- Test with Paystack test keys
- Review order status in database

