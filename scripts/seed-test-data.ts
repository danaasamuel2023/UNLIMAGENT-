/**
 * Test Data Seeding Script
 * 
 * This script creates sample test data for development and testing
 * 
 * Usage: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedTestData() {
  console.log('\n🌱 Starting test data seeding...\n')

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError || !users || users.users.length === 0) {
      console.log('❌ No users found. Please create at least one user first.')
      console.log('💡 Sign up at /signup or use the setup-admin script\n')
      return
    }

    // Find agent users
    const agentUsers = users.users.filter(u => 
      u.user_metadata?.role === 'agent'
    )

    if (agentUsers.length === 0) {
      console.log('⚠️  No agent users found. Creating sample agent stores...')
      console.log('💡 You can create agent stores manually through the UI\n')
      return
    }

    console.log(`Found ${agentUsers.length} agent user(s)\n`)

    // Process each agent
    for (const agent of agentUsers) {
      console.log(`📦 Processing agent: ${agent.email}`)

      // Check if agent has a store
      const { data: existingStore } = await supabase
        .from('agent_stores')
        .select('*')
        .eq('agent_id', agent.id)
        .single()

      let store
      if (existingStore) {
        store = existingStore
        console.log(`  ✅ Store already exists: ${store.store_name}`)
      } else {
        // Create sample store
        const storeSlug = `store-${Date.now()}`
        const { data: newStore, error: storeError } = await supabase
          .from('agent_stores')
          .insert({
            agent_id: agent.id,
            store_name: `Sample Store ${Math.random().toString(36).substring(7)}`,
            store_slug: storeSlug,
            store_description: 'A test store for development',
            contact_info: {
              phone_number: '+233 50 123 4567',
              whatsapp_number: '+233 50 123 4567',
              email: agent.email,
            },
            status: 'active',
          })
          .select()
          .single()

        if (storeError) {
          console.log(`  ❌ Error creating store: ${storeError.message}`)
          continue
        }

        store = newStore
        console.log(`  ✅ Created store: ${store.store_name}`)
      }

      // Check products
      const { data: products } = await supabase
        .from('agent_products')
        .select('*')
        .eq('store_id', store.id)

      if (products && products.length > 0) {
        console.log(`  ✅ Store has ${products.length} product(s)`)
      } else {
        // Create sample products
        console.log(`  📦 Creating sample products...`)

        const sampleProducts = [
          {
            network: 'YELLO',
            capacity: 1,
            base_price: 5.00,
            selling_price: 7.50,
            display_name: 'MTN 1GB Data',
            is_active: true,
            in_stock: true,
          },
          {
            network: 'YELLO',
            capacity: 2,
            base_price: 9.00,
            selling_price: 12.00,
            display_name: 'MTN 2GB Data',
            is_active: true,
            in_stock: true,
          },
          {
            network: 'YELLO',
            capacity: 5,
            base_price: 20.00,
            selling_price: 25.00,
            display_name: 'MTN 5GB Data',
            is_active: true,
            in_stock: true,
          },
          {
            network: 'TELECEL',
            capacity: 1,
            base_price: 4.50,
            selling_price: 7.00,
            display_name: 'Vodafone 1GB Data',
            is_active: true,
            in_stock: true,
          },
          {
            network: 'TELECEL',
            capacity: 5,
            base_price: 19.00,
            selling_price: 24.00,
            display_name: 'Vodafone 5GB Data',
            is_active: true,
            in_stock: true,
          },
        ]

        for (const product of sampleProducts) {
          const profit = product.selling_price - product.base_price
          const profitMargin = product.base_price > 0 ? (profit / product.base_price) * 100 : 0

          const { error } = await supabase
            .from('agent_products')
            .insert({
              store_id: store.id,
              network: product.network,
              capacity: product.capacity,
              mb: product.capacity * 1024,
              base_price: product.base_price,
              selling_price: product.selling_price,
              profit: profit,
              profit_margin: profitMargin,
              display_name: product.display_name,
              is_active: product.is_active,
              in_stock: product.in_stock,
            })

          if (error) {
            console.log(`    ❌ Error creating product: ${error.message}`)
          } else {
            console.log(`    ✅ Created: ${product.display_name}`)
          }
        }
      }

      // Create sample transactions
      const { data: transactions } = await supabase
        .from('agent_transactions')
        .select('*')
        .eq('agent_id', agent.id)
        .limit(1)

      if (!transactions || transactions.length === 0) {
        console.log(`  💰 Creating sample transactions...`)

        // Get first product
        const { data: firstProduct } = await supabase
          .from('agent_products')
          .select('*')
          .eq('store_id', store.id)
          .limit(1)
          .single()

        if (firstProduct) {
          const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
          const { error: txError } = await supabase
            .from('agent_transactions')
            .insert({
              agent_id: agent.id,
              store_id: store.id,
              product_id: firstProduct.id,
              transaction_id: transactionId,
              network: firstProduct.network,
              capacity: firstProduct.capacity,
              mb: firstProduct.mb,
              selling_price: firstProduct.selling_price,
              base_price: firstProduct.base_price,
              profit: firstProduct.profit,
              phone_number: '+233 50 987 6543',
              customer_email: 'test@example.com',
              order_status: 'pending',
              payment_status: 'pending',
            })

          if (txError) {
            console.log(`    ❌ Error creating transaction: ${txError.message}`)
          } else {
            console.log(`    ✅ Created transaction: ${transactionId}`)
          }
        }
      }

      console.log('')
    }

    console.log('✅ Test data seeding completed!\n')
    console.log('📊 Next steps:')
    console.log('   1. Visit http://localhost:3001/login')
    console.log('   2. Login with your agent account')
    console.log('   3. Navigate to http://localhost:3001/agent')
    console.log('   4. Create more products or view your store at /store/[slug]\n')

  } catch (error) {
    console.error('❌ Error seeding test data:', error)
  }
}

seedTestData()

