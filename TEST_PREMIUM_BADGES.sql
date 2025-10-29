-- ============================================
-- TEST PREMIUM BADGES - SQL Commands
-- ============================================
-- Run this in Supabase SQL Editor to test premium badges
-- Replace 'YOUR_STORE_ID' and 'YOUR_PRODUCT_ID' with actual IDs from your database

-- Option 1: Make an existing product premium
-- ============================================
UPDATE agent_products 
SET 
  tier = 'premium',
  bundle_type = 'UP2U',
  priority_processing = true,
  enhanced_reliability = true,
  faster_delivery = true,
  benefits = '["Priority support", "Fastest delivery", "24/7 assistance"]'::jsonb
WHERE id = 'YOUR_PRODUCT_ID';

-- Option 2: Create a new premium product (example)
-- ============================================
-- INSERT INTO agent_products (
--   store_id,
--   network,
--   capacity,
--   mb,
--   base_price,
--   selling_price,
--   profit,
--   profit_margin,
--   display_name,
--   tier,
--   bundle_type,
--   priority_processing,
--   enhanced_reliability,
--   faster_delivery,
--   benefits,
--   is_active,
--   in_stock
-- ) VALUES (
--   'YOUR_STORE_ID',
--   'YELLO',
--   10,
--   10240,
--   50.00,
--   65.00,
--   15.00,
--   30.00,
--   'MTN Premium 10GB',
--   'premium',
--   'UP2U',
--   true,
--   true,
--   true,
--   '["Priority processing", "Enhanced reliability", "Faster delivery"]'::jsonb,
--   true,
--   true
-- );

-- Option 3: Set bundle types for existing products
-- ============================================
-- UPDATE agent_products 
-- SET bundle_type = 'UP2U'
-- WHERE network = 'YELLO' AND bundle_type IS NULL;

-- UPDATE agent_products 
-- SET bundle_type = 'iShare'
-- WHERE network IN ('AT', 'airteltigo') AND bundle_type IS NULL;

-- Check the results
-- ============================================
SELECT 
  id,
  network,
  capacity,
  display_name,
  tier,
  bundle_type,
  priority_processing,
  enhanced_reliability,
  faster_delivery,
  benefits
FROM agent_products
WHERE tier = 'premium'
ORDER BY created_at DESC;

