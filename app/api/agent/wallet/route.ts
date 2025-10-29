import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get agent's store and wallet
    const { data: store, error: storeError } = await supabase
      .from('agent_stores')
      .select('wallet')
      .eq('agent_id', user.id)
      .single()

    if (storeError) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const wallet = store.wallet || {
      available_balance: 0,
      pending_balance: 0,
      total_earnings: 0,
      total_withdrawn: 0,
    }

    return NextResponse.json({ data: { wallet, store } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

