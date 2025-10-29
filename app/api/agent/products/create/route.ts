import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

    // Calculate profit
    const profit = body.selling_price - body.base_price
    const profitMargin = body.base_price > 0 ? (profit / body.base_price) * 100 : 0

    // Create product
    const { data, error } = await supabase
      .from('agent_products')
      .insert({
        store_id: store.id,
        network: body.network,
        capacity: body.capacity,
        mb: body.capacity * 1024, // Convert GB to MB
        base_price: body.base_price,
        selling_price: body.selling_price,
        profit: profit,
        profit_margin: profitMargin,
        display_name: body.display_name,
        description: body.description,
        is_active: body.is_active ?? true,
        in_stock: body.in_stock ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

