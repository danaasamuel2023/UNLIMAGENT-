# Quick Start: Paystack Integration

## ✅ What You Get

With Paystack integration, you get:

✅ **Real Payments** - Accept mobile money, cards, and bank transfers  
✅ **Payment Acceptance** - Seamless checkout for customers  
✅ **Automatic Wallet Crediting** - Instant balance updates via webhook  
✅ **Secure Webhook Handling** - HMAC SHA512 signature validation  
✅ **End-to-End Verification** - Complete transaction tracking  

## 💰 Costs

- Mobile Money: **1.5% + GHS 0.20** per transaction
- Card Payments: **2.9% + GHS 0.20** per transaction
- No setup fees, no monthly fees
- Pay only for successful transactions

## 🚀 Setup in 5 Minutes

### Step 1: Get Paystack API Keys

1. Sign up at https://paystack.com/register
2. Go to Dashboard → Settings → API Keys & Webhooks
3. Copy your test keys

### Step 2: Configure Environment

Add to your `.env` file:

```env
# Paystack API Keys (Use test keys first)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Your app URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 3: Configure Webhook

1. In Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Select event: `charge.success`
4. Save

### Step 4: Test with Test Cards

**Success Card:**
```
Card: 5060666666666666667
CVV: 123
Expiry: 12/25
PIN: 0000
```

### Step 5: Test Flow

1. Visit: http://localhost:3000/payment/deposit
2. Enter amount: GHS 10
3. Use test card above
4. Complete payment
5. Check balance at: http://localhost:3000/wallet
6. Should show GHS 10 credited! ✅

## 🧪 Testing Checklist

- [ ] Sign up for Paystack account
- [ ] Get API keys (test mode)
- [ ] Add keys to `.env`
- [ ] Configure webhook in Paystack dashboard
- [ ] Test deposit with test card
- [ ] Verify webhook receives event
- [ ] Check wallet balance updated
- [ ] Test purchase flow
- [ ] Test with real mobile money (when ready)

## 📱 Customer Journey

1. **Deposit**: Customer adds funds via Paystack
2. **Paystack**: Processes payment (mobile money/card)
3. **Webhook**: Auto-credits customer wallet
4. **Balance**: Shows on product cards
5. **Purchase**: Customer buys with wallet balance
6. **Fulfillment**: Order auto-processed

## 🔒 Security

- HMAC SHA512 signature validation
- Double-credit prevention
- Amount verification
- Transaction locking
- RLS policies on database

## 📊 What Happens After Payment

### Automatic Process:
1. Customer pays via Paystack
2. Paystack sends webhook to your server
3. Webhook validates signature
4. Webhook credits customer wallet
5. Balance updates automatically
6. Transaction recorded in history

### No Manual Work Needed:
- ❌ No need to check Paystack dashboard
- ❌ No need to manually credit wallets
- ❌ No need to verify transactions
- ✅ Everything happens automatically!

## 🎯 Production Checklist

Before going live:

1. **Switch to live keys** in `.env`
2. **Update webhook URL** to production domain
3. **Test with real mobile money**
4. **Monitor first transactions**
5. **Set up bank account** for settlements

## 📈 Going Live Steps

1. **Change keys**:
   ```env
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

2. **Update webhook**: Use production URL in Paystack
3. **Test once**: Make real payment (GHS 1)
4. **Monitor**: Check logs and Paystack dashboard
5. **Go live**: Start accepting real payments!

## 💡 Testing Without Paystack

If you want to test without Paystack first:

You can manually credit wallets by:

1. Go to Supabase dashboard
2. Navigate to `customer_wallets` table
3. Update balance field manually
4. Or create an admin tool to credit wallets

This lets you test the purchase flow before setting up Paystack.

## 🆘 Need Help?

- Paystack Docs: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Check logs: View server logs for webhook events

## ✅ You're Ready!

With these settings, you have:

- ✅ Real payment processing
- ✅ Automatic wallet crediting
- ✅ Secure webhook handling
- ✅ Complete transaction verification

**Start testing now!**

---

## 📝 Files Created

- `PAYSTACK_SETUP_GUIDE.md` - Detailed setup guide
- `PAYSTACK_WEBHOOK_SETUP.md` - Webhook configuration
- `scripts/test-paystack.sh` - Test script
- `app/api/webhooks/paystack/route.ts` - Webhook handler ✅

Everything is ready to go! 🚀

