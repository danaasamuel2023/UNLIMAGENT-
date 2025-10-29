import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getUserWithRole() {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error
    if (!user) return null

    // Get user role from metadata
    const role = user.user_metadata?.role || 'customer'
    
    return {
      ...user,
      role,
    }
  } catch (error) {
    console.error('Error getting user with role:', error)
    return null
  }
}

