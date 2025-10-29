import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-user'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    
    // Get agent's store
    const { data: store, error: storeError } = await supabase
      .from('agent_stores')
      .select('*')
      .eq('agent_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const logoFile = formData.get('logo') as File

    if (!logoFile) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!logoFile.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (logoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 for now (simple solution without storage bucket)
    const buffer = await logoFile.arrayBuffer()
    const base64String = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${logoFile.type};base64,${base64String}`

    // Update store with base64 logo
    const { error: updateError } = await supabase
      .from('agent_stores')
      .update({ store_logo_url: dataUrl })
      .eq('id', store.id)

    if (updateError) {
      console.error('Update store error:', updateError)
      return NextResponse.json(
        { success: false, error: `Failed to update store: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        logo_url: dataUrl,
      },
    })
  } catch (error: any) {
    console.error('Upload logo error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

