-- Add premium tier support to products
ALTER TABLE agent_products 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'basic')),
ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS priority_processing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enhanced_reliability BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS faster_delivery BOOLEAN DEFAULT false;

-- Add bundle type for network-specific features
ALTER TABLE agent_products
ADD COLUMN IF NOT EXISTS bundle_type VARCHAR(50);

-- Add index for tier
CREATE INDEX IF NOT EXISTS idx_agent_products_tier ON agent_products(tier);

-- Add index for priority processing
CREATE INDEX IF NOT EXISTS idx_agent_products_priority ON agent_products(priority_processing);

COMMENT ON COLUMN agent_products.tier IS 'Product tier: standard, premium, basic';
COMMENT ON COLUMN agent_products.benefits IS 'Array of benefits offered by this product';
COMMENT ON COLUMN agent_products.bundle_type IS 'Type of bundle (e.g., UP2U, iShare)';
COMMENT ON COLUMN agent_products.priority_processing IS 'Whether this product gets priority processing';
COMMENT ON COLUMN agent_products.enhanced_reliability IS 'Whether this product has enhanced reliability';
COMMENT ON COLUMN agent_products.faster_delivery IS 'Whether this product has faster delivery';

