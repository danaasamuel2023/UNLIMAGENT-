import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Add the column if it doesn't exist
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE agent_stores 
        ADD COLUMN IF NOT EXISTS store_logo_url TEXT;
        
        COMMENT ON COLUMN agent_stores.store_logo_url IS 'URL of the store logo uploaded by the agent';
      `
    })

    if (error) {
      console.error('Migration error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

