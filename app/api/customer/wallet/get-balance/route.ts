import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('customer_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (walletError && walletError.code !== 'PGRST116') {
      throw walletError
    }

    if (!wallet) {
      // Create wallet if doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('customer_wallets')
        .insert({
          user_id: user.id,
          phone_number: user.phone || '',
          balance: 0,
          total_deposits: 0,
          total_spent: 0,
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return NextResponse.json({
        success: true,
        data: {
          balance: 0,
          total_deposits: 0,
          total_spent: 0,
          status: 'active',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: parseFloat(wallet.balance || 0),
        total_deposits: parseFloat(wallet.total_deposits || 0),
        total_spent: parseFloat(wallet.total_spent || 0),
        status: wallet.status,
        updated_at: wallet.updated_at,
      },
    })
  } catch (error: any) {
    console.error('Get balance error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

