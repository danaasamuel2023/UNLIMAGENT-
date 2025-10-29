# Paystack Integration Setup Guide

## 📋 Overview
This guide will help you set up Paystack for real payments, automatic wallet crediting, and secure transaction processing.

## 🎯 What You Get

### ✅ Real Payments
- Accept mobile money (MTN MoMo, Vodafone Cash, AirtelTigo)
- Accept card payments (Visa, Mastercard, etc.)
- Accept bank transfers
- Multiple payment options for customers

### ✅ Payment Acceptance
- Seamless checkout flow
- Paystack hosted pages
- Mobile-friendly payment interface

### ✅ Automatic Wallet Crediting
- Webhook auto-processes successful payments
- Instant wallet balance updates
- No manual intervention needed

### ✅ Secure Webhook Handling
- HMAC SHA512 signature validation
- Prevents webhook spoofing
- Secure transaction verification

### ✅ End-to-End Transaction Verification
- Transaction IDs tracked
- Reference codes for audit trail
- Complete transaction history

## 💰 Cost Structure

### Mobile Money (GH)
- **Fee**: 1.5% + GHS 0.20 per transaction
- **Minimum**: GHS 0.20
- **Maximum**: GHS 10.00 per transaction

### Card Payments
- **Fee**: 2.9% + GHS 0.20 per transaction
- **Mastercard/Visa**: Standard rates apply

### Note
- No setup fees
- No monthly fees
- Pay only for successful transactions
- 7-day settlement period

## 🚀 Step-by-Step Setup

### Step 1: Create Paystack Account

1. Go to https://paystack.com/register
2. Sign up with your business email
3. Complete business verification
4. Add your business details

**Important Documents Needed:**
- Business registration certificate
- Bank account details (for settlements)
- Valid ID

### Step 2: Get Your API Keys

1. Log in to Paystack Dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your keys:

```env
# For Testing (Test Mode)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# For Production (Live Mode)
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Configure Webhooks

1. In Paystack Dashboard, go to **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhooks** section
3. Click **"Add Webhook URL"**
4. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```
5. Select these events to listen to:
   - ✅ `charge.success`
   - ✅ `charge.failed` (optional)
   - ✅ `transfer.success` (optional, for payouts)
6. Click **Save**

### Step 4: Configure Environment Variables

Create or update your `.env` file:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Paystack API Keys
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Test the Integration

#### A. Test with Test Cards

Paystack provides test cards for development:

```javascript
// Success Test Card
Card Number: 5060666666666666667
CVV: 123
Expiry: Any future date
PIN: 0000 (Card Verification)

// Failure Test Card
Card Number: 5060666666666666668
CVV: 123
Expiry: Any future date
```

#### B. Test Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to deposit page**:
   ```
   http://localhost:3000/payment/deposit
   ```

3. **Enter test amount**: GHS 10
4. **Click "Continue to Payment"**
5. **Use test card**: Use card number above
6. **Complete payment**: Enter PIN 0000
7. **Check webhook**: Should receive callback
8. **Verify balance**: Go to `/wallet` - should show GHS 10

#### C. Verify Webhook Received

Check your server logs for:
```
💰 Processing deposit: GHS 10 (reference: DEP...)
✅ Deposit processed successfully: GHS 10 credited
```

### Step 6: Local Testing with ngrok

For local development with real webhooks:

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start your app**:
   ```bash
   npm run dev
   ```

3. **Expose local port**:
   ```bash
   ngrok http 3000
   ```

4. **Copy HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update webhook in Paystack**:
   ```
   https://abc123.ngrok.io/api/webhooks/paystack
   ```

6. **Test deposit**: Now webhooks will work locally

## 📊 Transaction Flow

### Deposit Flow:
```
Customer → Deposit Page → Paystack → Payment → Webhook → Wallet Credited
```

### Purchase Flow:
```
Customer → Browse Store → Product → Pay with Wallet → Order Fulfilled
```

## 🔒 Security Features

### Signature Validation
- Webhook signatures validated with HMAC SHA512
- Prevents webhook spoofing
- Code in: `app/api/webhooks/paystack/route.ts`

### Double-Credit Prevention
- Checks transaction status before crediting
- Prevents duplicate wallet credits
- Transaction locking during processing

### Amount Verification
- Verifies payment amount matches expected
- Handles amount discrepancies gracefully
- Logs all mismatches for review

## 🧪 Testing Checklist

### Before Going Live

- [ ] Test deposits with test cards
- [ ] Verify webhook receives events
- [ ] Check wallet balance updates
- [ ] Test purchase flow with wallet
- [ ] Verify transaction history
- [ ] Test error handling (failed payments)
- [ ] Check logs for any errors
- [ ] Update to live API keys
- [ ] Configure production webhook URL
- [ ] Test with real mobile money
- [ ] Monitor first real transactions

## 💡 Production Checklist

When ready to go live:

1. **Switch to Live Keys**:
   ```env
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

2. **Update Webhook URL**:
   - Use production domain: `https://yourdomain.com/api/webhooks/paystack`
   - Remove ngrok URL

3. **Update App URL**:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

4. **Enable Business Name**:
   - Customers will see your business name on checkout

5. **Set Settlement Account**:
   - Add bank account for payouts
   - Verify bank details

## 📈 Monitoring

### In Paystack Dashboard:

1. **Transactions**: View all payments
2. **Settlements**: See payouts to your bank
3. **Logs**: Check webhook delivery status
4. **Analytics**: Payment trends and metrics

### In Your App:

1. **Transaction History**: `/wallet`
2. **Server Logs**: Check for webhook logs
3. **Database**: Check `customer_transactions` table

## 🐛 Troubleshooting

### Webhook Not Working?
- Check Paystack dashboard → Webhooks → Status
- Verify URL is accessible
- Check signature validation logs
- Ensure `PAYSTACK_SECRET_KEY` is set correctly

### Balance Not Updating?
- Check webhook is receiving events
- Verify transaction in Paystack dashboard
- Check database for transaction record
- Review server logs for errors

### Double Crediting?
- System checks `status === 'completed'` before processing
- Transactions are locked during update
- Verify webhook is not processing duplicate events

## 📞 Support

- **Paystack Support**: support@paystack.com
- **Documentation**: https://paystack.com/docs
- **API Reference**: https://paystack.com/docs/api

## ✅ You're Ready!

Once you've completed the steps above, you can:
- ✅ Accept real payments
- ✅ Auto-credit customer wallets
- ✅ Process purchases instantly
- ✅ Track all transactions

Your system is now fully integrated with Paystack!

