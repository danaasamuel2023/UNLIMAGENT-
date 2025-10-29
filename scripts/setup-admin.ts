/**
 * Admin Setup Utility
 * 
 * This script helps you create your first admin user after running the database migration.
 * 
 * Usage:
 * 1. Run the database migration in Supabase
 * 2. Sign up normally through /signup
 * 3. Come back here and run: npx tsx scripts/setup-admin.ts your-email@example.com
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Please make sure you have:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdmin(email: string) {
  console.log(`\n🔧 Setting up admin for: ${email}\n`)

  try {
    // Get user by email
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .eq('email', email)
      .single()

    if (userError || !users) {
      console.log('❌ User not found. Please sign up first at /signup')
      return
    }

    // Update user metadata to make them admin
    const { error: updateError } = await supabase
      .from('auth.users')
      .update({
        raw_user_meta_data: {
          ...users.raw_user_meta_data,
          role: 'admin'
        }
      })
      .eq('email', email)

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message)
      return
    }

    console.log('✅ Successfully set up admin account!')
    console.log(`\n📧 Email: ${email}`)
    console.log(`🔑 Role: admin`)
    console.log(`\n🌐 You can now login at: http://localhost:3001/login`)
    console.log(`📊 Admin dashboard: http://localhost:3001/admin\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx scripts/setup-admin.ts your-email@example.com')
  process.exit(1)
}

setupAdmin(email)

