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

    // Generate slug
    const storeSlug = body.store_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now()

    // Create store
    const { data, error } = await supabase
      .from('agent_stores')
      .insert({
        agent_id: user.id,
        store_name: body.store_name,
        store_slug: storeSlug,
        store_description: body.store_description,
        contact_info: {
          phone_number: body.phone_number,
          whatsapp_number: body.whatsapp_number,
          email: body.email,
        },
        status: 'pending_approval',
      })
      .select()
      .single()

    if (error) throw error

    // Initialize wallet for the new store
    const { error: walletError } = await supabase
      .from('agent_wallets')
      .insert({
        agent_id: user.id,
        store_id: data.id,
        available_balance: 0,
        pending_balance: 0,
        total_earnings: 0,
        total_withdrawn: 0,
      })

    if (walletError) {
      console.error('Failed to initialize wallet:', walletError)
      // Continue even if wallet initialization fails - it can be created later
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

