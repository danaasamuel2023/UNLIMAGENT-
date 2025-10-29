# Troubleshooting Internal Server Error

## Common Cause: Missing Environment Variables

The Internal Server Error is likely caused by missing Supabase environment variables.

### Required Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Data Mart Reseller API (Ghana MTN Data Platform)
DATA_MART_API_URL=https://server-datamart-reseller.onrender.com/api
DATA_MART_API_KEY=your_data_mart_api_key

# Paystack Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_892fedc086cb4aac104e65863ebf726a6b5cef37
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_063e0fb9fde355bb7a0dce30d5631c57ed15dc86

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### After Creating `.env.local`

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The error should be resolved

## Other Potential Issues

### 1. Database Tables Not Created

If you get errors about missing tables, run the migrations:

```bash
# If using Supabase CLI
supabase db push

# Or apply migrations manually through Supabase dashboard
```

### 2. Row Level Security (RLS) Policies

Make sure RLS policies allow public access to:
- `agent_stores` table (WHERE status = 'active')
- `agent_products` table (WHERE is_active = true)

Check the migration file `supabase/migrations/001_create_agent_store_tables.sql`

### 3. Missing Database Connection

Verify your Supabase project is running and the connection credentials are correct.

## Quick Debug Steps

1. Check if `.env.local` exists
2. Verify all environment variables are set
3. Check browser console for specific error messages
4. Check terminal/console for server error messages
5. Ensure Supabase database has the correct schema applied

