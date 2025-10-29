# Paystack Webhook Setup Guide

## Overview
The webhook handler automatically processes successful Paystack payments and credits customer wallets.

## Webhook Endpoint
```
POST /api/webhooks/paystack
```

## Configuration

### 1. In Paystack Dashboard

1. Log in to your Paystack Dashboard: https://dashboard.paystack.com/
2. Go to **Settings** → **Webhooks**
3. Click **"Add Webhook URL"**
4. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```
5. Select these events to listen to:
   - `charge.success` ✅
   - Optionally: `charge.failed`
6. Click **Save**

### 2. Environment Variables

Make sure these are set in your `.env`:
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx  # For production
# OR
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # For testing
```

## How It Works

### Deposit Flow:
1. Customer initiates deposit → Transaction created (status: 'pending')
2. Customer completes Paystack payment
3. Paystack sends webhook to `/api/webhooks/paystack`
4. Webhook validates signature
5. Webhook credits customer wallet
6. Transaction marked as 'completed'
7. Balance updated

### Security:
- ✅ HMAC SHA512 signature validation
- ✅ Only processes `charge.success` events
- ✅ Prevents double-crediting
- ✅ Amount verification

## Testing Webhooks

### Local Testing (using ngrok or similar):

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Expose your local server:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. In Paystack dashboard, add webhook URL:
```
https://abc123.ngrok.io/api/webhooks/paystack
```

5. Test by making a payment

### Testing with Paystack CLI:
```bash
# Install Paystack CLI
npm install -g paystack

# Test webhook locally
paystack webhook listen http://localhost:3000/api/webhooks/paystack
```

## Webhook Events Handled

### charge.success
- Credits customer wallet
- Updates transaction status
- Sends confirmation (if SMS enabled)

### Other Events
Currently, only `charge.success` is processed. You can extend the handler to process:
- `charge.failed` - Handle failed payments
- `transfer.success` - Handle payouts
- `invoice.payment_failed` - Handle recurring payment failures

## Logging

The webhook logs all activities:
- ✅ Successful deposits
- ❌ Failed deposits
- ⚠️ Amount mismatches
- 📱 SMS notifications (if enabled)

Check your server logs to monitor webhook activity:
```bash
# View logs
tail -f logs/webhook.log
```

## Troubleshooting

### Webhook not receiving events?
1. Check Paystack dashboard → Webhooks → Test
2. Verify URL is correct and accessible
3. Check server logs for errors
4. Ensure `PAYSTACK_SECRET_KEY` is set

### Invalid signature?
- Verify secret key matches in Paystack
- Check request is not being modified by proxy

### Transaction not found?
- Verify reference is being passed in metadata
- Check transaction is created before payment

### Double crediting?
- Webhook checks `status === 'completed'` before processing
- Transaction is locked during processing

## Manual Verification

If webhook fails, you can manually verify and process:

```javascript
// In your admin panel or API
POST /api/customer/wallet/verify-payment?reference=DEP123456789
```

This will:
1. Verify payment with Paystack
2. Update transaction status
3. Credit wallet if successful

## Production Checklist

- [ ] Webhook URL configured in Paystack dashboard
- [ ] Secret key set in environment variables
- [ ] HTTPS enabled (required for webhooks)
- [ ] Webhook URL accessible from internet
- [ ] Test webhook with test payment
- [ ] Monitor webhook logs
- [ ] Set up error alerts
- [ ] Configure webhook retries in Paystack

## Webhook Payload Example

```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "domain": "test",
    "status": "success",
    "reference": "DEP1699123456789ABC",
    "amount": 1000000,
    "currency": "GHS",
    "customer": {
      "id": 12345,
      "email": "customer@example.com",
      "customer_code": "CUS_abc123"
    },
    "metadata": {
      "wallet_id": "uuid",
      "transaction_id": "uuid",
      "customer_id": "uuid",
      "payment_type": "deposit",
      "base_amount": "10000"
    },
    "created_at": "2023-11-01T10:00:00.000Z"
  }
}
```

## Notes

- Webhooks must be served over HTTPS in production
- Paystack retries failed webhooks (up to 3 times)
- Each webhook should be idempotent (can handle duplicates)
- Test thoroughly before production deployment

