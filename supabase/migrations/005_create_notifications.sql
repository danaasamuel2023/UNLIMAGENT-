-- ===== ADMIN NOTIFICATIONS TABLE =====
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Notification Type
  type VARCHAR(50) NOT NULL CHECK (type IN ('withdrawal_request', 'store_approval', 'transaction_issue', 'agent_application', 'system_alert')),
  
  -- Related Entities
  related_entity_type VARCHAR(50), -- 'withdrawal', 'store', 'transaction', etc.
  related_entity_id UUID,
  
  -- Content
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  
  -- Action Data (JSONB)
  action_data JSONB DEFAULT '{}',
  
  -- Metadata (JSONB)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes for admin_notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(is_read) WHERE is_read = false;

-- Enable RLS on admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
DROP POLICY IF EXISTS "Admins can view notifications" ON admin_notifications;
CREATE POLICY "Admins can view notifications" ON admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can update notifications
DROP POLICY IF EXISTS "Admins can update notifications" ON admin_notifications;
CREATE POLICY "Admins can update notifications" ON admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to create notification for withdrawal requests
CREATE OR REPLACE FUNCTION notify_admin_of_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  -- Get store information for the notification
  INSERT INTO admin_notifications (
    type,
    related_entity_type,
    related_entity_id,
    title,
    message,
    priority,
    action_data,
    metadata
  )
  SELECT 
    'withdrawal_request',
    'withdrawal',
    NEW.id,
    'New Withdrawal Request',
    'Agent ' || (SELECT store_name FROM agent_stores WHERE agent_id = NEW.agent_id LIMIT 1) || ' requested withdrawal of ' || NEW.requested_amount || ' GHS',
    CASE 
      WHEN NEW.requested_amount > 1000 THEN 'high'
      ELSE 'normal'
    END,
    jsonb_build_object(
      'withdrawal_id', NEW.withdrawal_id,
      'agent_id', NEW.agent_id,
      'amount', NEW.requested_amount,
      'method', NEW.method,
      'status', NEW.status,
      'view_url', '/admin/withdrawals?view=' || NEW.id
    ),
    jsonb_build_object(
      'agent_id', NEW.agent_id,
      'withdrawal_id', NEW.withdrawal_id,
      'timestamp', NOW(),
      'auto_read', false
    )
  FROM agent_stores 
  WHERE agent_id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_admin_withdrawal ON agent_withdrawals;
CREATE TRIGGER trigger_notify_admin_withdrawal
  AFTER INSERT ON agent_withdrawals
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_admin_of_withdrawal();

