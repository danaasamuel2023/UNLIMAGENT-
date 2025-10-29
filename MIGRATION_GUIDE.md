# 🚀 Database Migration & Testing Guide

This guide will help you set up the database and test the complete Agent Store System.

## Prerequisites

✅ Next.js project is set up
✅ Supabase project created at https://supabase.com
✅ Environment variables configured in `.env.local`

---

## Step 1: Run Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Run the Migration**
   - Open the file: `supabase/migrations/001_create_agent_store_tables.sql`
   - Copy **ALL** contents of the migration file
   - Paste into the SQL Editor
   - Click "Run" (or press `Ctrl+Enter`)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check the "Table Editor" to see the new tables:
     - ✅ `agent_stores`
     - ✅ `agent_products`
     - ✅ `agent_transactions`
     - ✅ `agent_withdrawals`
     - ✅ `agent_customers`
     - ✅ `store_reviews`
     - ✅ `store_analytics`

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 2: Create Your First Admin Account

1. **Sign Up**
   - Visit http://localhost:3001/signup
   - Create an account with your email
   - Verify your email (if required)

2. **Make Yourself Admin**
   ```bash
   npx tsx scripts/setup-admin.ts your-email@example.com
   ```

3. **Login**
   - Visit http://localhost:3001/login
   - Login with your admin credentials

---

## Step 3: Create Test Agent Account

1. **Create Agent User**
   - Option A: Sign up at http://localhost:3001/signup with a different email
   - Option B: Use the Supabase Auth dashboard to create a user

2. **Set User as Agent**
   - Go to Supabase Dashboard → Authentication → Users
   - Find your test agent user
   - Click "Edit"
   - Update User Metadata:
   ```json
   {
     "role": "agent"
   }
   ```

3. **Login as Agent**
   - Visit http://localhost:3001/login
   - Login with agent credentials

---

## Step 4: Seed Test Data

Run the test data seeding script to create sample stores, products, and transactions:

```bash
npx tsx scripts/seed-test-data.ts
```

This will:
- ✅ Create sample store for agent
- ✅ Add sample products (MTN 1GB, 2GB, 5GB, Vodafone 1GB, 5GB)
- ✅ Create sample transactions
- ✅ Set up wallet balance

---

## Step 5: Test Agent Dashboard

1. **Login as Agent**
   - Visit http://localhost:3001/login
   - Login with your agent account

2. **Access Agent Dashboard**
   - Visit http://localhost:3001/agent
   - You should see:
     - Wallet summary (available balance, total earnings)
     - Recent transactions

3. **Test Store Management**
   - Visit http://localhost:3001/agent/store
   - View store information
   - Edit store settings

4. **Test Product Management**
   - Visit http://localhost:3001/agent/products
   - View products list
   - Click "Add Product" to create new products
   - Edit existing products

5. **Test Orders**
   - Visit http://localhost:3001/agent/orders
   - View transaction history
   - Update order status

6. **Test Earnings & Withdrawals**
   - Visit http://localhost:3001/agent/earnings
   - View wallet details
   - Request withdrawal (if balance > GHS 10)

---

## Step 6: Test Public Store Page

1. **Get Store Slug**
   - Login as agent
   - Visit http://localhost:3001/agent/store
   - Note the "Store Slug" (e.g., `store-1234567890`)

2. **Access Public Store**
   - Visit http://localhost:3001/store/[slug]
   - Example: http://localhost:3001/store/store-1234567890
   - You should see:
     - Store name and description
     - Product catalog
     - WhatsApp contact button

3. **Test Purchase Flow**
   - Click "Buy Now" on any product
   - Enter phone number
   - Submit order
   - Check order appears in agent dashboard

---

## Step 7: Test Order Processing

1. **Login as Agent**
   - Go to http://localhost:3001/agent/orders

2. **Process Order**
   - Click on a transaction
   - Update order status to "processing"
   - Update payment status to "completed"
   - Mark order as "completed"

3. **Check Wallet**
   - Go to http://localhost:3001/agent/earnings
   - Verify balance updated with profit

---

## Troubleshooting

### ❌ Migration Errors

**Error: "relation already exists"**
- Drop the tables manually or use `DROP TABLE IF EXISTS` before running migration
- Check if migration already ran

**Error: "extension uuid-ossp does not exist"**
- The extension should auto-create
- Manually run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### ❌ Authentication Issues

**Can't login after migration**
- Clear browser cache
- Check Supabase Auth settings
- Verify user exists in Authentication → Users

**Role not working**
- Check user metadata in Supabase
- Ensure `role` field is set to 'admin' or 'agent'

### ❌ Data Issues

**No products showing**
- Run seed script: `npx tsx scripts/seed-test-data.ts`
- Or create products manually via UI

**Store not found**
- Ensure store_slug matches URL
- Check agent created a store

---

## Next Steps

✅ **Database migration completed**
✅ **Admin account created**
✅ **Agent dashboard functional**
✅ **Public store pages working**
✅ **Order flow tested**

### What's Next?

1. **Customize Store Design** - Add logos, banners, colors
2. **Add More Products** - Import product catalog
3. **Configure Business Hours** - Set store availability
4. **Test Withdrawals** - Process withdrawal requests
5. **Add Analytics** - Track sales and performance
6. **Integrate Payment Gateway** - Connect Paystack
7. **Email Notifications** - Set up email alerts

---

## Support

Need help? Check:
- 📖 Documentation in `/docs`
- 🐛 Issues on GitHub
- 💬 Community Discord
- 📧 Email support

---

**🎉 Congratulations! Your Agent Store System is ready!**

