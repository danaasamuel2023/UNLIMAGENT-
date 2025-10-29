'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'customer' as 'admin' | 'agent' | 'customer',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`,
          data: {
            name: formData.name,
            role: formData.role,
          },
        },
      })

      if (error) throw error

      if (data.user && data.user.email_confirmed_at) {
        router.push('/dashboard')
        router.refresh()
      } else if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        
        if (!signInError) {
          router.push('/dashboard')
          router.refresh()
        } else {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        }
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Agent Store
            </h1>
          </Link>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start your journey with us today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 animate-shake">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div className="relative">
              <label 
                htmlFor="name" 
                className={`absolute left-4 transition-all duration-200 ${focused === 'name' || formData.name ? 'top-2 text-xs text-blue-600' : 'top-4 text-sm text-gray-500'}`}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-2 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label 
                htmlFor="email" 
                className={`absolute left-4 transition-all duration-200 ${focused === 'email' || formData.email ? 'top-2 text-xs text-blue-600' : 'top-4 text-sm text-gray-500'}`}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-2 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50"
              />
            </div>

            {/* Account Type */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50"
              >
                <option value="customer">Customer</option>
                <option value="agent">Agent (Store Owner)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Agents can create and manage their own stores
              </p>
            </div>

            {/* Password */}
            <div className="relative">
              <label 
                htmlFor="password" 
                className={`absolute left-4 transition-all duration-200 ${focused === 'password' || formData.password ? 'top-2 text-xs text-blue-600' : 'top-4 text-sm text-gray-500'}`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-2 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label 
                htmlFor="confirmPassword" 
                className={`absolute left-4 transition-all duration-200 ${focused === 'confirmPassword' || formData.confirmPassword ? 'top-2 text-xs text-blue-600' : 'top-4 text-sm text-gray-500'}`}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onFocus={() => setFocused('confirmPassword')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-2 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>

          {/* Dev Mode Notice */}
          <p className="mt-4 text-center text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            ⚠️ Development Mode: Email verification disabled
          </p>
        </div>
      </div>
    </div>
  )
}
