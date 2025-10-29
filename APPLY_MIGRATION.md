# How to Apply the Premium Tier Migration

## Option 1: Using Supabase Dashboard (Recommended)

1. **Log in to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Migration SQL**
   - Open: `supabase/migrations/002_add_premium_tier.sql`
   - Copy all the SQL code
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press Ctrl+Enter
   - You should see a success message

## Option 2: Using Supabase CLI

If you want to set up the CLI:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## What the Migration Does

The migration adds the following columns to `agent_products`:

- `tier` - Product tier (standard, premium, basic)
- `benefits` - JSON array of benefits
- `priority_processing` - Boolean for priority processing
- `enhanced_reliability` - Boolean for enhanced reliability
- `faster_delivery` - Boolean for faster delivery
- `bundle_type` - Type of bundle (UP2U, iShare, etc.)

All columns are optional and have default values, so existing products won't break.

## Verify Migration

After running the migration, you can verify it worked:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'agent_products' 
AND column_name IN ('tier', 'benefits', 'priority_processing');
```

You should see the new columns listed.

## Test Premium Badges

After the migration is complete, you can test premium badges by:

1. **Update an existing product** (via SQL Editor):
```sql
UPDATE agent_products 
SET 
  tier = 'premium',
  bundle_type = 'UP2U',
  priority_processing = true,
  enhanced_reliability = true,
  faster_delivery = true,
  benefits = '["Priority support", "Fastest delivery"]'::jsonb
WHERE id = 'your-product-id';
```

2. **Or via your agent dashboard** when it's implemented

The premium badge will automatically appear on the store page!

## Next Steps

✅ Migration applied  
✅ Visit `/api-docs` to see the API documentation  
✅ Test premium badges on any store page  
✅ Test sharing functionality on store pages  

All features are now live!

