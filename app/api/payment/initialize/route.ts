import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Initialize Paystack payment for purchase
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    // Validate required fields
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!body.phone_number) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^0[2-9][0-9]{8}$/
    if (!phoneRegex.test(body.phone_number)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use Ghana format (e.g., 0204120633)' },
        { status: 400 }
      )
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('agent_products')
      .select('*, agent_stores!inner(*)')
      .eq('id', body.product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.in_stock) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 })
    }

    // Validate and calculate amount
    const sellingPrice = parseFloat(product.selling_price)
    const requestedAmount = body.amount ? parseFloat(body.amount) : sellingPrice

    if (requestedAmount < sellingPrice) {
      return NextResponse.json(
        { error: 'Amount is less than the product price' },
        { status: 400 }
      )
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email || `customer${Date.now()}@example.com`,
        amount: Math.round(sellingPrice * 100), // Convert to pesewas (Paystack uses pesewas)
        currency: 'GHS',
        reference: transactionId,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback?type=purchase&reference=${transactionId}`,
        metadata: {
          payment_type: 'purchase',
          transaction_id: transactionId,
          product_id: product.id,
          store_id: product.store_id,
          store_slug: product.agent_stores.store_slug,
          phone_number: body.phone_number,
          network: product.network,
          capacity: product.capacity,
          amount: sellingPrice,
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData.message)
      return NextResponse.json(
        { error: paystackData.message || 'Failed to initialize payment' },
        { status: 500 }
      )
    }

    // Calculate profit
    const basePrice = parseFloat(product.base_price || 0)
    const profit = sellingPrice - basePrice

    // Create pending transaction record - use all columns that exist
    const transactionData: any = {
      agent_id: product.agent_stores.agent_id,
      store_id: product.store_id,
      product_id: product.id,
      transaction_id: transactionId,
      network: product.network,
      capacity: product.capacity,
      mb: product.mb,
      selling_price: product.selling_price,
      base_price: product.base_price || 0,
      // Use both profit and net_profit as they both exist in schema
      profit: profit,
      net_profit: profit,
      phone_number: body.phone_number,
      customer_email: body.email || null,
      order_status: 'pending',
      payment_status: 'pending',
      payment_method: 'paystack',
      payment_reference: transactionId,
    }

    // Try adding profit if column exists
    const { data: transaction, error: transactionError } = await supabase
      .from('agent_transactions')
      .insert(transactionData)
      .select()
      .single()

    if (transactionError) {
      console.error('Failed to create transaction record:', transactionError)
      // Transaction will be created when payment is verified
    }

    // Create or update customer record
    const { data: existingCustomer } = await supabase
      .from('agent_customers')
      .select('*')
      .eq('store_id', product.store_id)
      .eq('phone_number', body.phone_number)
      .maybeSingle()

    if (existingCustomer) {
      await supabase
        .from('agent_customers')
        .update({
          email: body.email || existingCustomer.email,
        })
        .eq('id', existingCustomer.id)
    } else {
      await supabase
        .from('agent_customers')
        .insert({
          store_id: product.store_id,
          agent_id: product.agent_stores.agent_id,
          name: body.phone_number,
          phone_number: body.phone_number,
          email: body.email || null,
          total_purchases: 0, // Will update after successful payment
          total_spent: 0,
          customer_type: 'retail',
        })
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: transactionId,
      transaction: transaction,
    })
  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
