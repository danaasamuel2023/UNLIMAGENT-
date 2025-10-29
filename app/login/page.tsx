'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
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

        <div className="glass rounded-2xl p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 animate-shake">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <label 
                htmlFor="email" 
                className={`absolute left-4 transition-all duration-200 ${focused === 'email' || email ? 'top-2 text-xs text-blue-600 dark:text-blue-400' : 'top-4 text-sm text-gray-500 dark:text-gray-400'}`}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-2 px-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50 dark:bg-gray-800/50 dark:text-white"
              />
            </div>

            <div className="relative">
              <label 
                htmlFor="password" 
                className={`absolute left-4 transition-all duration-200 ${focused === 'password' || password ? 'top-2 text-xs text-blue-600 dark:text-blue-400' : 'top-4 text-sm text-gray-500 dark:text-gray-400'}`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-2 px-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50 dark:bg-gray-800/50 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <Link href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 了一个 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-bg flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
