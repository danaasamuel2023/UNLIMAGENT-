/**
 * Script to grant admin access to a user
 * 
 * Run this script from the project root:
 * node scripts/grant-admin-access.js
 * 
 * Or use: npx tsx scripts/grant-admin-access.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function grantAdminAccess(email) {
  console.log(`\n🔍 Looking for user: ${email}`)
  
  // Get all users
  const { data: users, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('❌ Error fetching users:', error.message)
    return
  }
  
  // Find the user
  const user = users.users.find(u => u.email === email)
  
  if (!user) {
    console.error(`❌ User not found: ${email}`)
    console.log('\n📋 Available users:')
    users.users.slice(0, 5).forEach(u => console.log(`  - ${u.email} (${u.user_metadata?.role || 'customer'})`))
    if (users.users.length > 5) console.log(`  ... and ${users.users.length - 5} more`)
    return
  }
  
  console.log(`✅ Found user: ${user.email}`)
  console.log(`   Current role: ${user.user_metadata?.role || 'customer'}`)
  
  // Update user metadata
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin',
        name: user.user_metadata?.name || 'Admin'
      }
    }
  )
  
  if (updateError) {
    console.error('❌ Error updating user:', updateError.message)
    return
  }
  
  console.log('✅ Admin access granted!')
  console.log('\n📝 Next steps:')
  console.log('1. Log out of the application')
  console.log('2. Log back in with:', email)
  console.log('3. Visit: http://localhost:3000/admin')
  console.log('\n✨ You should now have admin access!')
}

// Get email from command line or use first argument
const email = process.argv[2]

if (!email) {
  console.log('❌ Usage: node scripts/grant-admin-access.js <email>')
  console.log('Example: node scripts/grant-admin-access.js user@example.com')
  process.exit(1)
}

grantAdminAccess(email).catch(console.error)

