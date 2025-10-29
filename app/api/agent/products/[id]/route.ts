import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get agent's store
    const { data: store, error: storeError } = await supabase
      .from('agent_stores')
      .select('id')
      .eq('agent_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Get product and verify it belongs to the agent's store
    const { data: product, error: productError } = await supabase
      .from('agent_products')
      .select('*')
      .eq('id', id)
      .eq('store_id', store.id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ data: product })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Get agent's store
    const { data: store, error: storeError } = await supabase
      .from('agent_stores')
      .select('id')
      .eq('agent_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verify product belongs to agent's store
    const { data: existingProduct, error: verifyError } = await supabase
      .from('agent_products')
      .select('id')
      .eq('id', id)
      .eq('store_id', store.id)
      .single()

    if (verifyError || !existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate profit if prices are updated
    let updateData: any = { ...body }
    if (body.selling_price !== undefined && body.base_price !== undefined) {
      const profit = body.selling_price - body.base_price
      const profitMargin = body.base_price > 0 ? (profit / body.base_price) * 100 : 0
      updateData.profit = profit
      updateData.profit_margin = profitMargin
    }

    // Update capacity in MB if capacity is updated
    if (body.capacity !== undefined) {
      updateData.mb = body.capacity * 1024 // Convert GB to MB
    }

    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.store_id
    delete updateData.agent_id
    delete updateData.created_at

    // Update product
    const { data, error } = await supabase
      .from('agent_products')
      .update(updateData)
      .eq('id', id)
      .eq('store_id', store.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

