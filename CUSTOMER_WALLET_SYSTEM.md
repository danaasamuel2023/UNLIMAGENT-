# Customer Wallet & Payment System

## Overview
This system allows customers to deposit money into their wallets and pay for agent store purchases directly, with automatic order fulfillment after payment.

## Features Implemented

### 1. Customer Wallet System
- **Database Tables**: `customer_wallets`, `customer_transactions`
- **Automatic wallet creation** for new users
- **Balance tracking** with automatic updates
- **Transaction history** with detailed metadata

### 2. Deposit System
- **Route**: `/payment/deposit`
- **Payment Gateway**: Paystack integration
- **Features**:
  - Minimum deposit: GHS 1.00
  - Maximum deposit: GHS 50,000
  - 2.5% transaction fee
  - Secure payment processing
  - Real-time balance updates

### 3. Purchase Flow
- **Wallet Payment**: Automatically uses wallet balance if available
- **Balance Display**: Shows customer balance on product cards
- **Insufficient Balance**: Redirects to deposit page with shortfall amount
- **Auto-fulfillment**: Paid orders are automatically processed

### 4. Order Processing
- **Paid Orders**: Automatically fulfilled via Data Mart API
- **Pending Orders**: Require manual agent processing (if not paid)
- **Status Tracking**: Real-time order status updates

## Setup Instructions

### 1. Run Database Migration
```bash
# Apply the wallet system migration
psql -h [your-supabase-host] -U postgres -d postgres -f supabase/migrations/003_customer_wallet_system.sql
```

Or via Supabase Dashboard:
- Go to SQL Editor
- Run the contents of `supabase/migrations/003_customer_wallet_system.sql`

### 2. Configure Environment Variables
```env
# Add to your .env file
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

### 3. Test the System

#### Customer Deposit Flow:
1. User logs in (or signs up)
2. Navigate to `/payment/deposit`
3. Enter amount and email
4. Complete Paystack payment
5. Wallet balance updates automatically

#### Purchase Flow:
1. Browse agent stores at `/store/[slug]`
2. See wallet balance on product cards (if logged in)
3. Click "Purchase Now"
4. If balance sufficient: Payment deducted from wallet
5. Order automatically fulfilled

## API Endpoints

### Customer Wallet
- `GET /api/customer/wallet/get-balance` - Get wallet balance
- `POST /api/customer/wallet/deposit` - Initialize deposit
- `GET /api/customer/wallet/verify-payment` - Verify Paystack payment

### Order Processing
- `POST /api/orders/create` - Create order (with wallet payment)
- `POST /api/orders/fulfill` - Auto-fulfill paid orders

## User Flow

### For Customers:
1. **Sign Up/Login**
2. **Deposit Funds**: Visit `/payment/deposit`
3. **Browse Stores**: View products on agent stores
4. **See Balance**: Wallet balance displayed on product cards
5. **Purchase**: Pay with wallet balance
6. **Auto-delivery**: Orders fulfilled automatically

### For Agents:
1. Customer orders appear in agent dashboard
2. If paid: Order status is "processing" → automatically fulfilled
3. If unpaid: Order status is "pending" → agent collects payment manually
4. Agent revenue tracking works as before

## Database Schema

### customer_wallets
- `id`: UUID
- `user_id`: UUID (references auth.users)
- `phone_number`: VARCHAR
- `balance`: DECIMAL (available balance)
- `total_deposits`: DECIMAL
- `total_spent`: DECIMAL
- `status`: VARCHAR ('active', 'suspended', 'closed')

### customer_transactions
- `id`: UUID
- `wallet_id`: UUID (references customer_wallets)
- `user_id`: UUID
- `type`: VARCHAR ('deposit', 'purchase', 'refund', 'withdrawal')
- `amount`: DECIMAL
- `balance_before`: DECIMAL
- `balance_after`: DECIMAL
- `reference`: VARCHAR (unique)
- `payment_gateway`: VARCHAR
- `status`: VARCHAR ('pending', 'completed', 'failed', etc.)
- `order_transaction_id`: UUID (for purchases)

## Transaction Types

1. **Deposit**: Customer adds funds via Paystack
2. **Purchase**: Customer buys from agent store
3. **Refund**: Agent/customer refund
4. **Withdrawal**: Customer withdrawal (not implemented yet)

## Security Features

- **RLS Policies**: Customers can only view their own wallets/transactions
- **Balance Validation**: Prevents over-spending
- **Transaction Locks**: Atomic operations for wallet updates
- **Payment Verification**: Paystack webhook support

## Future Enhancements

- [ ] Wallet transaction history page
- [ ] Transaction export
- [ ] Multi-currency support
- [ ] Loyalty points system
- [ ] Referral bonuses
- [ ] Customer withdrawal requests

## Notes

- Wallet balance is displayed only to logged-in users
- Guest checkout still works (requires manual payment)
- All wallet operations are logged in transaction history
- Failed payments don't deduct from wallet

