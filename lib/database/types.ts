/**
 * Database Types for Agent Store System
 * Compatible with Supabase/PostgreSQL
 */

export type Database = {
  public: {
    Tables: {
      agent_stores: {
        Row: AgentStore
        Insert: AgentStoreInsert
        Update: AgentStoreUpdate
      }
      agent_products: {
        Row: AgentProduct
        Insert: AgentProductInsert
        Update: AgentProductUpdate
      }
      agent_transactions: {
        Row: AgentTransaction
        Insert: AgentTransactionInsert
        Update: AgentTransactionUpdate
      }
      agent_withdrawals: {
        Row: AgentWithdrawal
        Insert: AgentWithdrawalInsert
        Update: AgentWithdrawalUpdate
      }
      agent_customers: {
        Row: AgentCustomer
        Insert: AgentCustomerInsert
        Update: AgentCustomerUpdate
      }
      store_reviews: {
        Row: StoreReview
        Insert: StoreReviewInsert
        Update: StoreReviewUpdate
      }
      store_analytics: {
        Row: StoreAnalytics
        Insert: StoreAnalyticsInsert
        Update: StoreAnalyticsUpdate
      }
    }
  }
}

// ===== AGENT STORE =====
export interface AgentStore {
  id: string
  agent_id: string
  store_name: string
  store_slug: string
  store_description?: string
  store_logo?: string
  store_banner?: string
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'closed'
  is_open: boolean
  closure_reason?: string
  closed_at?: string
  
  // Business Hours
  business_hours: {
    monday: { open: string; close: string; is_open: boolean }
    tuesday: { open: string; close: string; is_open: boolean }
    wednesday: { open: string; close: string; is_open: boolean }
    thursday: { open: string; close: string; is_open: boolean }
    friday: { open: string; close: string; is_open: boolean }
    saturday: { open: string; close: string; is_open: boolean }
    sunday: { open: string; close: string; is_open: boolean }
  }
  auto_close_outside_hours: boolean
  
  // Contact
  contact_info: {
    phone_number: string
    alternate_phone?: string
    email?: string
    whatsapp_number: string
    address?: {
      street?: string
      city?: string
      region?: string
      digital_address?: string
    }
  }
  
  // WhatsApp Integration
  whatsapp_settings: {
    group_link?: string
    community_link?: string
    broadcast_list_id?: string
    auto_send_receipt: boolean
    welcome_message?: string
    order_notification: boolean
    support_hours_message?: string
  }
  
  // Social Media
  social_media: {
    facebook?: string
    instagram?: string
    twitter?: string
    telegram?: string
  }
  
  // Commission Settings
  commission_settings: {
    type: 'percentage' | 'fixed' | 'tiered' | 'custom'
    default_commission_rate: number
    fixed_commission_amount?: number
    tiered_commissions?: Array<{ min_amount: number; max_amount: number; rate: number }>
    minimum_markup: number
    maximum_markup: number
  }
  
  // Financial
  wallet: {
    available_balance: number
    pending_balance: number
    total_earnings: number
    total_withdrawn: number
    last_withdrawal?: string
  }
  
  // Withdrawal Settings
  withdrawal_settings: {
    minimum_withdrawal: number
    processing_time: string
    allowed_methods: string[]
    preferred_method: 'momo' | 'bank' | 'cash'
    momo_details?: {
      network?: string
      number?: string
      name?: string
    }
    bank_details?: {
      bank_name?: string
      account_number?: string
      account_name?: string
      branch?: string
    }
    auto_withdrawal?: {
      enabled: boolean
      threshold: number
      frequency: 'daily' | 'weekly' | 'monthly'
    }
  }
  
  // Customization
  customization: {
    theme: 'default' | 'dark' | 'light' | 'blue' | 'green' | 'custom'
    primary_color: string
    secondary_color: string
    custom_css?: string
    show_prices: boolean
    allow_guest_checkout: boolean
    require_phone_verification: boolean
  }
  
  // Marketing
  marketing: {
    referral_code?: string
    referral_bonus: number
    promotions?: Array<{
      code: string
      discount: number
      type: 'percentage' | 'fixed'
      valid_from: string
      valid_to: string
      usage_limit?: number
      used_count: number
      active: boolean
    }>
    loyalty_program?: {
      enabled: boolean
      points_per_cedi: number
      redeem_rate: number
    }
  }
  
  // Policies
  policies?: {
    terms_and_conditions?: string
    privacy_policy?: string
    refund_policy?: string
    delivery_policy?: string
  }
  
  // Metrics
  metrics: {
    total_orders: number
    total_revenue: number
    total_profit: number
    total_customers: number
    average_order_value: number
    conversion_rate: number
    rating: number
    total_reviews: number
  }
  
  // SEO
  seo?: {
    meta_title?: string
    meta_description?: string
    keywords?: string[]
  }
  
  // Verification
  verification: {
    is_verified: boolean
    verification_date?: string
    documents?: Array<{
      type: 'id_card' | 'business_cert' | 'tax_cert'
      url: string
      uploaded_at?: string
      verified: boolean
    }>
    business_registration_number?: string
    tax_identification_number?: string
  }
  
  // Notifications
  notifications: {
    email: {
      new_order: boolean
      low_stock: boolean
      withdrawal: boolean
    }
    sms: {
      new_order: boolean
      withdrawal: boolean
    }
    whatsapp: {
      new_order: boolean
      daily_summary: boolean
    }
  }
  
  admin_notes?: Array<{
    note: string
    added_by: string
    added_at: string
  }>
  
  violations?: Array<{
    type: string
    description: string
    date: string
    penalty?: string
  }>
  
  suspension_history?: Array<{
    reason: string
    suspended_by?: string
    suspended_at: string
    lifted_at?: string
  }>
  
  approved_at?: string
  approved_by?: string
  last_active_at: string
  created_at: string
  updated_at: string
}

export type AgentStoreInsert = Omit<AgentStore, 'id' | 'created_at' | 'updated_at'>
export type AgentStoreUpdate = Partial<Omit<AgentStore, 'id' | 'created_at' | 'updated_at'>>

// ===== AGENT PRODUCT =====
export interface AgentProduct {
  id: string
  store_id: string
  network: 'YELLO' | 'TELECEL' | 'AT_PREMIUM' | 'airteltigo' | 'at'
  capacity: number
  mb: number
  base_price: number
  selling_price: number
  profit: number
  profit_margin: number
  is_active: boolean
  in_stock: boolean
  display_name?: string
  description?: string
  featured: boolean
  sort_order: number
  is_on_sale: boolean
  sale_price?: number
  sale_start_date?: string
  sale_end_date?: string
  minimum_quantity: number
  maximum_quantity: number
  daily_limit?: number
  total_sold: number
  total_revenue: number
  total_profit: number
  created_at: string
  updated_at: string
}

export type AgentProductInsert = Omit<AgentProduct, 'id' | 'created_at' | 'updated_at'>
export type AgentProductUpdate = Partial<Omit<AgentProduct, 'id' | 'created_at' | 'updated_at'>>

// ===== AGENT TRANSACTION =====
export interface AgentTransaction {
  id: string
  transaction_id: string
  store_id: string
  agent_id: string
  customer_id?: string
  original_purchase_id?: string
  product_id?: string
  network: string
  capacity: number
  phone_number: string
  quantity: number
  base_price: number
  selling_price: number
  agent_profit: number
  platform_fee: number
  net_profit: number
  payment_method: 'wallet' | 'momo' | 'cash' | 'bank_transfer' | 'paystack'
  payment_reference?: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  order_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  processing_details?: {
    method?: 'auto' | 'manual' | 'geonettech_api' | 'telecel_api'
    started_at?: string
    completed_at?: string
    attempts: number
    last_error?: string
  }
  has_issue: boolean
  issue_report_id?: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  delivery_method: 'instant' | 'scheduled'
  scheduled_delivery?: string
  delivered_at?: string
  promo_code?: string
  discount_amount: number
  agent_notes?: string
  customer_notes?: string
  system_notes?: string
  created_at: string
  completed_at?: string
}

export type AgentTransactionInsert = Omit<AgentTransaction, 'id' | 'created_at'>
export type AgentTransactionUpdate = Partial<Omit<AgentTransaction, 'id' | 'created_at'>>

// ===== AGENT WITHDRAWAL =====
export interface AgentWithdrawal {
  id: string
  withdrawal_id: string
  agent_id: string
  store_id: string
  requested_amount: number
  fee: number
  net_amount: number
  method: 'momo' | 'bank' | 'cash'
  account_details: {
    momo_network?: string
    momo_number?: string
    momo_name?: string
    bank_name?: string
    bank_code?: string
    account_number?: string
    account_name?: string
    branch?: string
    cash_pickup_location?: string
  }
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected' | 'cancelled'
  processing_details?: {
    initiated_at?: string
    initiated_by?: string
    provider?: string
    gateway?: string
    recipient_creation?: {
      recipient_code?: string
      recipient_id?: string
      recipient_name?: string
      recipient_account?: string
      recipient_bank?: string
      recipient_type?: string
      currency?: string
      created_at?: string
      api_response?: any
      errors?: string[]
    }
    transfer_initiation?: {
      transfer_code?: string
      transfer_id?: string
      transfer_reference?: string
      amount?: number
      currency?: string
      reason?: string
      source?: string
      initiated_at?: string
      api_response?: any
      errors?: string[]
    }
    transfer_status?: {
      current_status?: string
      status_code?: string
      status_message?: string
      last_checked_at?: string
      api_response?: any
      status_history?: Array<{
        status: string
        message: string
        checked_at: string
        api_response?: any
      }>
    }
    webhook_data?: any
    verification?: any
    attempts?: {
      count: number
      max_attempts: number
      history?: any[]
    }
    completed_at?: string
    completion_message?: string
    final_api_response?: any
    failure_reason?: string
    failure_code?: string
    failed_at?: string
    failure_api_response?: any
    is_retryable?: boolean
    next_retry_at?: string
    transaction_fee?: number
    vat_charge?: number
    total_charges?: number
    fee_breakdown?: any
    bank_response_code?: string
    bank_response_message?: string
    settlement_time?: string
    ip_address?: string
    user_agent?: string
    device_info?: string
    processing_duration?: number
  }
  processed_by?: string
  processed_at?: string
  payment_reference?: string
  approval_workflow?: {
    requested_at: string
    approved_by?: string
    approved_at?: string
    approval_notes?: string
    approval_level?: string
    requires_approval: boolean
  }
  rejection_reason?: string
  rejected_by?: string
  rejected_at?: string
  rejection_category?: string
  cancelled_at?: string
  cancelled_by?: string
  cancellation_reason?: string
  cancellation_source?: string
  agent_notes?: string
  admin_notes?: string
  system_notes?: Array<{
    note: string
    created_at: string
    created_by: string
    severity: 'info' | 'warning' | 'error' | 'critical'
  }>
  audit_trail?: Array<{
    action: string
    performed_by?: string
    performed_at: string
    performed_by_type?: string
    details?: string
    metadata?: any
    ip_address?: string
    user_agent?: string
  }>
  compliance?: {
    aml_checked?: boolean
    aml_check_result?: string
    aml_checked_at?: string
    kyc_verified?: boolean
    kyc_verified_at?: string
    fraud_check?: boolean
    fraud_score?: number
    fraud_checked_at?: string
    risk_level?: string
    flagged?: boolean
    flag_reason?: string
  }
  notifications?: any
  created_at: string
  updated_at: string
  completed_at?: string
  expires_at?: string
}

export type AgentWithdrawalInsert = Omit<AgentWithdrawal, 'id' | 'created_at' | 'updated_at'>
export type AgentWithdrawalUpdate = Partial<Omit<AgentWithdrawal, 'id' | 'created_at' | 'updated_at'>>

// ===== AGENT CUSTOMER =====
export interface AgentCustomer {
  id: string
  store_id: string
  customer_id?: string
  name: string
  phone_number: string
  email?: string
  whatsapp_number?: string
  customer_type: 'regular' | 'vip' | 'wholesale' | 'one_time'
  source: 'whatsapp' | 'walk_in' | 'referral' | 'online' | 'social_media'
  referred_by?: string
  groups?: string[]
  tags?: string[]
  loyalty_points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  total_purchases: number
  total_spent: number
  last_purchase_date?: string
  average_order_value: number
  credit_limit: number
  credit_used: number
  credit_available: number
  preferences?: {
    preferred_network?: string
    preferred_payment_method?: string
    communication_preference?: 'whatsapp' | 'sms' | 'email' | 'call'
  }
  notes?: string
  is_active: boolean
  is_blocked: boolean
  block_reason?: string
  first_purchase_date?: string
  created_at: string
  updated_at: string
}

export type AgentCustomerInsert = Omit<AgentCustomer, 'id' | 'created_at' | 'updated_at'>
export type AgentCustomerUpdate = Partial<Omit<AgentCustomer, 'id' | 'created_at' | 'updated_at'>>

// ===== STORE REVIEW =====
export interface StoreReview {
  id: string
  store_id: string
  customer_id: string
  transaction_id?: string
  rating: number
  review?: string
  aspects?: {
    service?: number
    pricing?: number
    speed?: number
    communication?: number
  }
  agent_response?: {
    response: string
    responded_at: string
  }
  is_verified: boolean
  is_visible: boolean
  is_flagged: boolean
  flag_reason?: string
  created_at: string
  updated_at: string
}

export type StoreReviewInsert = Omit<StoreReview, 'id' | 'created_at' | 'updated_at'>
export type StoreReviewUpdate = Partial<Omit<StoreReview, 'id' | 'created_at' | 'updated_at'>>

// ===== STORE ANALYTICS =====
export interface StoreAnalytics {
  id: string
  store_id: string
  date: string
  traffic: {
    views: number
    unique_visitors: number
    whatsapp_clicks: number
    social_media_clicks: number
  }
  sales: {
    total_orders: number
    completed_orders: number
    cancelled_orders: number
    total_revenue: number
    total_profit: number
    average_order_value: number
  }
  product_metrics?: any
  customers: {
    new_customers: number
    returning_customers: number
    conversion_rate: number
  }
  hourly_orders?: any
  payment_methods: {
    wallet: number
    momo: number
    cash: number
    bank: number
    paystack: number
  }
  created_at: string
}

export type StoreAnalyticsInsert = Omit<StoreAnalytics, 'id' | 'created_at'>
export type StoreAnalyticsUpdate = Partial<Omit<StoreAnalytics, 'id' | 'created_at'>>

