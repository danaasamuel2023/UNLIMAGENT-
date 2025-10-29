import { getCurrentUser } from '@/lib/auth/get-user'
import { createAdminClient } from '@/lib/supabase/admin'
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
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('customer_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (transactionsError) {
      throw transactionsError
    }

    return NextResponse.json({
      success: true,
      data: transactions || [],
    })
  } catch (error: any) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

