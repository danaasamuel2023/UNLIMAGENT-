-- ===== CUSTOMER WALLET SYSTEM =====
-- Create customer wallets table
CREATE TABLE IF NOT EXISTS customer_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0 CHECK (balance >= 0),
  
  -- Transaction tracking
  total_deposits DECIMAL(12, 2) DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT customer_wallets_user_id_key UNIQUE (user_id)
);

-- Create customer transactions table
CREATE TABLE IF NOT EXISTS customer_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES customer_wallets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction details
  type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'purchase', 'refund', 'withdrawal')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  
  -- Balance tracking
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  
  -- Reference and payment info
  reference VARCHAR(255) UNIQUE NOT NULL,
  payment_gateway VARCHAR(50),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'processing')),
  
  -- Order reference (for purchases)
  order_transaction_id UUID REFERENCES agent_transactions(id),
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for customer_wallets
CREATE INDEX IF NOT EXISTS idx_customer_wallets_user_id ON customer_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_wallets_phone_number ON customer_wallets(phone_number);
CREATE INDEX IF NOT EXISTS idx_customer_wallets_status ON customer_wallets(status);

-- Indexes for customer_transactions
CREATE INDEX IF NOT EXISTS idx_customer_transactions_wallet_id ON customer_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_customer_transactions_user_id ON customer_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_transactions_type ON customer_transactions(type);
CREATE INDEX IF NOT EXISTS idx_customer_transactions_status ON customer_transactions(status);
CREATE INDEX IF NOT EXISTS idx_customer_transactions_reference ON customer_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_customer_transactions_created_at ON customer_transactions(created_at DESC);

-- Function to update customer wallet after transaction
CREATE OR REPLACE FUNCTION update_customer_wallet_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update wallet balance based on transaction type
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    IF NEW.type = 'deposit' OR NEW.type = 'refund' THEN
      UPDATE customer_wallets 
      SET balance = balance + NEW.amount,
          total_deposits = total_deposits + CASE WHEN NEW.type = 'deposit' THEN NEW.amount ELSE 0 END,
          updated_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'purchase' OR NEW.type = 'withdrawal' THEN
      UPDATE customer_wallets 
      SET balance = balance - NEW.amount,
          total_spent = total_spent + CASE WHEN NEW.type = 'purchase' THEN NEW.amount ELSE 0 END,
          updated_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;
    
    -- Update transaction completed_at
    NEW.completed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customer transactions
DROP TRIGGER IF EXISTS trigger_update_customer_wallet_on_transaction ON customer_transactions;
CREATE TRIGGER trigger_update_customer_wallet_on_transaction
  BEFORE UPDATE ON customer_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_wallet_on_transaction();

-- Function to create wallet for new users
CREATE OR REPLACE FUNCTION create_customer_wallet_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_wallets (user_id, phone_number)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'phone_number' OR '')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for creating wallet on user signup
DROP TRIGGER IF EXISTS trigger_create_customer_wallet_on_signup ON auth.users;
CREATE TRIGGER trigger_create_customer_wallet_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_customer_wallet_on_signup();

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_customer_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customer_wallets_updated_at ON customer_wallets;
CREATE TRIGGER update_customer_wallets_updated_at
  BEFORE UPDATE ON customer_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_wallet_updated_at();

-- Enable RLS
ALTER TABLE customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_wallets
DROP POLICY IF EXISTS "Users can view own wallet" ON customer_wallets;
CREATE POLICY "Users can view own wallet" ON customer_wallets
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wallet" ON customer_wallets;
CREATE POLICY "Users can update own wallet" ON customer_wallets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for customer_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON customer_transactions;
CREATE POLICY "Users can view own transactions" ON customer_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own transactions" ON customer_transactions;
CREATE POLICY "Users can create own transactions" ON customer_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add payment_status to agent_transactions
ALTER TABLE agent_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE agent_transactions ADD COLUMN IF NOT EXISTS customer_transaction_id UUID REFERENCES customer_transactions(id);

-- Comments
COMMENT ON TABLE customer_wallets IS 'Customer wallet balances and metadata';
COMMENT ON TABLE customer_transactions IS 'Customer transaction history including deposits, purchases, refunds';
COMMENT ON COLUMN customer_wallets.balance IS 'Available wallet balance';
COMMENT ON COLUMN customer_wallets.total_deposits IS 'Total amount deposited';
COMMENT ON COLUMN customer_wallets.total_spent IS 'Total amount spent on purchases';

