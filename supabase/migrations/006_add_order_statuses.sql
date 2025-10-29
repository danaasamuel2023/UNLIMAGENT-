-- Add additional order statuses to agent_transactions
ALTER TABLE agent_transactions 
DROP CONSTRAINT IF EXISTS agent_transactions_order_status_check;

ALTER TABLE agent_transactions 
ADD CONSTRAINT agent_transactions_order_status_check 
CHECK (order_status IN ('pending', 'processing', 'completed', 'delivered', 'failed', 'cancelled', 'refunded', 'waiting', 'on_hold'));

COMMENT ON COLUMN agent_transactions.order_status IS 'Order status: pending, processing, waiting, on_hold, completed, delivered, failed, cancelled, refunded';

