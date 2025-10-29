import { redirect } from 'next/navigation'
import { getCurrentUser } from './get-user'

export async function requireAuth() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      redirect('/login')
    }
    
    return user
  } catch (error) {
    console.error('Error in requireAuth:', error)
    // If Supabase is not configured, redirect to login
    redirect('/login')
  }
}

export async function requireRole(expectedRole: 'admin' | 'agent' | 'customer') {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      redirect('/login')
    }

    const role = user.user_metadata?.role || 'customer'
    
    if (role !== expectedRole) {
      redirect('/unauthorized')
    }
    
    return user
  } catch (error) {
    console.error('Error in requireRole:', error)
    // If Supabase is not configured, redirect to login
    redirect('/login')
  }
}

