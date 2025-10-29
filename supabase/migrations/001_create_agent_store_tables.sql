-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== AGENT STORES TABLE =====
CREATE TABLE IF NOT EXISTS agent_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  store_slug VARCHAR(100) UNIQUE NOT NULL,
  store_description TEXT,
  store_logo TEXT,
  store_banner TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_approval', 'closed')),
  is_open BOOLEAN DEFAULT true,
  closure_reason TEXT,
  closed_at TIMESTAMPTZ,
  
  -- Business Hours (JSONB)
  business_hours JSONB DEFAULT '{
    "monday": {"open": "08:00", "close": "17:00", "is_open": true},
    "tuesday": {"open": "08:00", "close": "17:00", "is_open": true},
    "wednesday": {"open": "08:00", "close": "17:00", "is_open": true},
    "thursday": {"open": "08:00", "close": "17:00", "is_open": true},
    "friday": {"open": "08:00", "close": "17:00", "is_open": true},
    "saturday": {"open": "08:00", "close": "17:00", "is_open": true},
    "sunday": {"open": "08:00", "close": "17:00", "is_open": false}
  }',
  auto_close_outside_hours BOOLEAN DEFAULT false,
  
  -- Contact Info (JSONB)
  contact_info JSONB NOT NULL,
  
  -- WhatsApp Settings (JSONB)
  whatsapp_settings JSONB DEFAULT '{"auto_send_receipt": true, "order_notification": true}',
  
  -- Social Media (JSONB)
  social_media JSONB DEFAULT '{}',
  
  -- Commission Settings (JSONB)
  commission_settings JSONB DEFAULT '{
    "type": "percentage",
    "default_commission_rate": 10,
    "minimum_markup": 0,
    "maximum_markup": 50
  }',
  
  -- Wallet (JSONB)
  wallet JSONB DEFAULT '{
    "available_balance": 0,
    "pending_balance": 0,
    "total_earnings": 0,
    "total_withdrawn": 0
  }',
  
  -- Withdrawal Settings (JSONB)
  withdrawal_settings JSONB DEFAULT '{
    "minimum_withdrawal": 10,
    "processing_time": "24-48 hours",
    "allowed_methods": ["momo", "bank", "cash"],
    "preferred_method": "momo"
  }',
  
  -- Customization (JSONB)
  customization JSONB DEFAULT '{
    "theme": "default",
    "primary_color": "#1976d2",
    "secondary_color": "#dc004e",
    "show_prices": true,
    "allow_guest_checkout": false,
    "require_phone_verification": true
  }',
  
  -- Marketing (JSONB)
  marketing JSONB DEFAULT '{"referral_bonus": 0}',
  
  -- Policies (JSONB)
  policies JSONB DEFAULT '{}',
  
  -- Metrics (JSONB)
  metrics JSONB DEFAULT '{
    "total_orders": 0,
    "total_revenue": 0,
    "total_profit": 0,
    "total_customers": 0,
    "average_order_value": 0,
    "conversion_rate": 0,
    "rating": 0,
    "total_reviews": 0
  }',
  
  -- SEO (JSONB)
  seo JSONB DEFAULT '{}',
  
  -- Verification (JSONB)
  verification JSONB DEFAULT '{"is_verified": false}',
  
  -- Notifications (JSONB)
  notifications JSONB DEFAULT '{
    "email": {"new_order": true, "low_stock": true, "withdrawal": true},
    "sms": {"new_order": true, "withdrawal": true},
    "whatsapp": {"new_order": true, "daily_summary": false}
  }',
  
  -- Admin Notes (JSONB Array)
  admin_notes JSONB DEFAULT '[]',
  
  -- Violations (JSONB Array)
  violations JSONB DEFAULT '[]',
  
  -- Suspension History (JSONB Array)
  suspension_history JSONB DEFAULT '[]',
  
  -- Approval
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent_stores
CREATE INDEX IF NOT EXISTS idx_agent_stores_agent_id ON agent_stores(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_stores_store_slug ON agent_stores(store_slug);
CREATE INDEX IF NOT EXISTS idx_agent_stores_status ON agent_stores(status);
CREATE INDEX IF NOT EXISTS idx_agent_stores_created_at ON agent_stores(created_at DESC);

-- ===== AGENT PRODUCTS TABLE =====
CREATE TABLE IF NOT EXISTS agent_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES agent_stores(id) ON DELETE CASCADE NOT NULL,
  
  -- Product Details
  network VARCHAR(50) NOT NULL CHECK (network IN ('YELLO', 'TELECEL', 'AT_PREMIUM', 'airteltigo', 'at')),
  capacity INTEGER NOT NULL,
  mb INTEGER NOT NULL,
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  profit_margin DECIMAL(5, 2) NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  in_stock BOOLEAN DEFAULT true,
  
  -- Display
  display_name VARCHAR(200),
  description TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Promotional
  is_on_sale BOOLEAN DEFAULT false,
  sale_price DECIMAL(10, 2),
  sale_start_date TIMESTAMPTZ,
  sale_end_date TIMESTAMPTZ,
  
  -- Limits
  minimum_quantity INTEGER DEFAULT 1,
  maximum_quantity INTEGER DEFAULT 10,
  daily_limit INTEGER,
  
  -- Stats
  total_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_profit DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent_products
CREATE INDEX IF NOT EXISTS idx_agent_products_store_id ON agent_products(store_id);
CREATE INDEX IF NOT EXISTS idx_agent_products_network ON agent_products(network);
CREATE INDEX IF NOT EXISTS idx_agent_products_is_active ON agent_products(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_products_store_network ON agent_products(store_id, network);

-- ===== AGENT TRANSACTIONS TABLE =====
CREATE TABLE IF NOT EXISTS agent_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(20) UNIQUE NOT NULL,
  store_id UUID REFERENCES agent_stores(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID,
  
  -- Order Details
  original_purchase_id UUID,
  product_id UUID REFERENCES agent_products(id),
  
  -- Product Info
  network VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  mb INTEGER,
  phone_number VARCHAR(20) NOT NULL,
  quantity INTEGER DEFAULT 1,
  
  -- Financial
  base_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  net_profit DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('wallet', 'momo', 'cash', 'bank_transfer', 'paystack')),
  payment_reference VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Order Status
  order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- Processing (JSONB)
  processing_details JSONB DEFAULT '{"attempts": 0}',
  
  has_issue BOOLEAN DEFAULT false,
  issue_report_id UUID,
  
  -- Customer Info
  customer_name VARCHAR(200),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  customer_message TEXT,
  
  -- Delivery
  delivery_method VARCHAR(50) DEFAULT 'instant' CHECK (delivery_method IN ('instant', 'scheduled')),
  scheduled_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Promo/Discount
  promo_code VARCHAR(50),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Notes
  agent_notes TEXT,
  customer_notes TEXT,
  system_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for agent_transactions
CREATE INDEX IF NOT EXISTS idx_agent_transactions_store_id ON agent_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_agent_id ON agent_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_transaction_id ON agent_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_payment_status ON agent_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_order_status ON agent_transactions(order_status);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_created_at ON agent_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_store_created ON agent_transactions(store_id, created_at DESC);

-- ===== AGENT WITHDRAWALS TABLE =====
CREATE TABLE IF NOT EXISTS agent_withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  withdrawal_id VARCHAR(50) UNIQUE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES agent_stores(id) ON DELETE CASCADE NOT NULL,
  
  -- Amount Details
  requested_amount DECIMAL(10, 2) NOT NULL,
  fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment Method
  method VARCHAR(20) NOT NULL CHECK (method IN ('momo', 'bank', 'cash')),
  
  -- Account Details (JSONB)
  account_details JSONB NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'rejected', 'cancelled')),
  
  -- Processing (JSONB)
  processing_details JSONB DEFAULT '{"attempts": {"count": 0, "max_attempts": 3, "history": []}}',
  
  -- Approval Workflow (JSONB)
  approval_workflow JSONB DEFAULT '{"requires_approval": true}',
  
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  payment_reference VARCHAR(100),
  
  rejection_reason TEXT,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_category VARCHAR(50),
  
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  cancellation_source VARCHAR(50),
  
  agent_notes TEXT,
  admin_notes TEXT,
  
  -- System Notes (JSONB Array)
  system_notes JSONB DEFAULT '[]',
  
  -- Audit Trail (JSONB Array)
  audit_trail JSONB DEFAULT '[]',
  
  -- Compliance (JSONB)
  compliance JSONB DEFAULT '{}',
  
  -- Notifications (JSONB)
  notifications JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Indexes for agent_withdrawals
CREATE INDEX IF NOT EXISTS idx_agent_withdrawals_agent_id ON agent_withdrawals(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_withdrawals_store_id ON agent_withdrawals(store_id);
CREATE INDEX IF NOT EXISTS idx_agent_withdrawals_withdrawal_id ON agent_withdrawals(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_agent_withdrawals_status ON agent_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_agent_withdrawals_created_at ON agent_withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_withdrawals_store_created ON agent_withdrawals(store_id, created_at DESC);

-- ===== AGENT CUSTOMERS TABLE =====
CREATE TABLE IF NOT EXISTS agent_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES agent_stores(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  
  name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  whatsapp_number VARCHAR(20),
  
  customer_type VARCHAR(50) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale', 'one_time')),
  source VARCHAR(50) DEFAULT 'online' CHECK (source IN ('whatsapp', 'walk_in', 'referral', 'online', 'social_media')),
  referred_by UUID,
  
  groups TEXT[],
  tags TEXT[],
  
  loyalty_points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  average_order_value DECIMAL(10, 2) DEFAULT 0,
  
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  credit_used DECIMAL(10, 2) DEFAULT 0,
  credit_available DECIMAL(10, 2) DEFAULT 0,
  
  -- Preferences (JSONB)
  preferences JSONB DEFAULT '{}',
  
  notes TEXT,
  
  is_active BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  
  first_purchase_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent_customers
CREATE INDEX IF NOT EXISTS idx_agent_customers_store_id ON agent_customers(store_id);
CREATE INDEX IF NOT EXISTS idx_agent_customers_phone ON agent_customers(store_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_agent_customers_type ON agent_customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_agent_customers_is_active ON agent_customers(is_active);

-- ===== STORE REVIEWS TABLE =====
CREATE TABLE IF NOT EXISTS store_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES agent_stores(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  transaction_id UUID REFERENCES agent_transactions(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Aspects (JSONB)
  aspects JSONB DEFAULT '{}',
  
  -- Agent Response (JSONB)
  agent_response JSONB,
  
  is_verified BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for store_reviews
CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id ON store_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_customer_id ON store_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_rating ON store_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_store_reviews_store_rating ON store_reviews(store_id, rating DESC);

-- ===== STORE ANALYTICS TABLE =====
CREATE TABLE IF NOT EXISTS store_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES agent_stores(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  
  -- Traffic (JSONB)
  traffic JSONB DEFAULT '{
    "views": 0,
    "unique_visitors": 0,
    "whatsapp_clicks": 0,
    "social_media_clicks": 0
  }',
  
  -- Sales (JSONB)
  sales JSONB DEFAULT '{
    "total_orders": 0,
    "completed_orders": 0,
    "cancelled_orders": 0,
    "total_revenue": 0,
    "total_profit": 0,
    "average_order_value": 0
  }',
  
  -- Product Metrics (JSONB)
  product_metrics JSONB DEFAULT '{}',
  
  -- Customers (JSONB)
  customers JSONB DEFAULT '{
    "new_customers": 0,
    "returning_customers": 0,
    "conversion_rate": 0
  }',
  
  -- Hourly Orders (JSONB)
  hourly_orders JSONB DEFAULT '{}',
  
  -- Payment Methods (JSONB)
  payment_methods JSONB DEFAULT '{
    "wallet": 0,
    "momo": 0,
    "cash": 0,
    "bank": 0,
    "paystack": 0
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(store_id, date)
);

-- Indexes for store_analytics
CREATE INDEX IF NOT EXISTS idx_store_analytics_store_id ON store_analytics(store_id);
CREATE INDEX IF NOT EXISTS idx_store_analytics_date ON store_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_store_analytics_store_date ON store_analytics(store_id, date DESC);

-- ===== TRIGGER FOR UPDATED_AT =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS update_agent_stores_updated_at ON agent_stores;
CREATE TRIGGER update_agent_stores_updated_at BEFORE UPDATE ON agent_stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_products_updated_at ON agent_products;
CREATE TRIGGER update_agent_products_updated_at BEFORE UPDATE ON agent_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_withdrawals_updated_at ON agent_withdrawals;
CREATE TRIGGER update_agent_withdrawals_updated_at BEFORE UPDATE ON agent_withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_customers_updated_at ON agent_customers;
CREATE TRIGGER update_agent_customers_updated_at BEFORE UPDATE ON agent_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_reviews_updated_at ON store_reviews;
CREATE TRIGGER update_store_reviews_updated_at BEFORE UPDATE ON store_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Enable RLS on all tables
ALTER TABLE agent_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics ENABLE ROW LEVEL SECURITY;

-- Agent can view their own store
DROP POLICY IF EXISTS "Agents can view own store" ON agent_stores;
CREATE POLICY "Agents can view own store" ON agent_stores
  FOR SELECT USING (auth.uid() = agent_id);

-- Anyone can view active stores
DROP POLICY IF EXISTS "Public can view active stores" ON agent_stores;
CREATE POLICY "Public can view active stores" ON agent_stores
  FOR SELECT USING (status = 'active');

-- Agents can update their own store
DROP POLICY IF EXISTS "Agents can update own store" ON agent_stores;
CREATE POLICY "Agents can update own store" ON agent_stores
  FOR UPDATE USING (auth.uid() = agent_id);

-- Agents can view their products
DROP POLICY IF EXISTS "Agents can view own products" ON agent_products;
CREATE POLICY "Agents can view own products" ON agent_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_stores 
      WHERE agent_stores.id = agent_products.store_id 
      AND agent_stores.agent_id = auth.uid()
    )
  );

-- Public can view active products from active stores
DROP POLICY IF EXISTS "Public can view active products" ON agent_products;
CREATE POLICY "Public can view active products" ON agent_products
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM agent_stores 
      WHERE agent_stores.id = agent_products.store_id 
      AND agent_stores.status = 'active'
    )
  );

-- Agents can view their own transactions
DROP POLICY IF EXISTS "Agents can view own transactions" ON agent_transactions;
CREATE POLICY "Agents can view own transactions" ON agent_transactions
  FOR SELECT USING (auth.uid() = agent_id);

-- Agents can view their own withdrawals
DROP POLICY IF EXISTS "Agents can view own withdrawals" ON agent_withdrawals;
CREATE POLICY "Agents can view own withdrawals" ON agent_withdrawals
  FOR SELECT USING (auth.uid() = agent_id);

-- Agents can view their own customers
DROP POLICY IF EXISTS "Agents can view own customers" ON agent_customers;
CREATE POLICY "Agents can view own customers" ON agent_customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_stores 
      WHERE agent_stores.id = agent_customers.store_id 
      AND agent_stores.agent_id = auth.uid()
    )
  );

-- Public can view reviews for active stores
DROP POLICY IF EXISTS "Public can view reviews" ON store_reviews;
CREATE POLICY "Public can view reviews" ON store_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_stores 
      WHERE agent_stores.id = store_reviews.store_id 
      AND agent_stores.status = 'active'
    )
    AND is_visible = true
  );

-- Note: Add more RLS policies as needed for your specific requirements

