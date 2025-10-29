'use server'

import { getDataMartBalance, getDataMartProducts, purchaseDataBundle } from '@/lib/services/dataMartApi'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Process order through Data Mart API
 */
interface ProcessOrderParams {
  transactionId: string
  phoneNumber: string
  capacity: string
  productName: string
}

export async function processOrderThroughDataMart({ 
  transactionId, 
  phoneNumber, 
  capacity, 
  productName 
}: ProcessOrderParams) {
  try {
    // Generate reference
    const reference = `REF${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Call Data Mart API
    const result = await purchaseDataBundle({
      capacity,
      product_name: productName,
      beneficiary_number: phoneNumber,
      reference,
    })

    if (!result || !result.success) {
      return { 
        success: false, 
        error: 'Failed to process order through Data Mart API' 
      }
    }

    // Update transaction in database
    const supabase = createAdminClient()
    const { error: updateError } = await supabase
      .from('agent_transactions')
      .update({
        api_reference: result.data.reference,
        api_transaction_id: result.data.transaction_id,
        external_status: result.data.status,
        order_status: result.data.status === 'pending' ? 'processing' : 'completed',
        balance_after_purchase: result.data.balance_after,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId)

    if (updateError) {
      console.error('Failed to update transaction:', updateError)
      return { success: false, error: 'Failed to update transaction record' }
    }

    revalidatePath('/agent/orders')
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Data Mart processing error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Sync products from Data Mart
 */
export async function syncProductsFromDataMart() {
  try {
    const products = await getDataMartProducts()
    
    if (products.length === 0) {
      return { success: false, error: 'No products found' }
    }

    // TODO: Store products in database
    // For now, just return the products
    return { success: true, data: products }
  } catch (error) {
    console.error('Product sync error:', error)
    return { success: false, error: 'Failed to sync products' }
  }
}

/**
 * Check Data Mart balance
 */
export async function checkDataMartBalance() {
  try {
    const balance = await getDataMartBalance()
    return { success: true, balance }
  } catch (error) {
    console.error('Balance check error:', error)
    return { success: false, error: 'Failed to check balance' }
  }
}

