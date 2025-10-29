'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const errorMsg = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const emailParam = searchParams.get('email')

    if (errorCode === 'otp_expired') {
      setError('The verification link has expired. Please request a new one.')
      if (emailParam) setEmail(emailParam)
    } else if (errorMsg) {
      setError(errorMsg)
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    setResending(true)
    setError('')
    setResendSuccess(false)

    try {
      // Get the stored email from URL params or user input
      const emailToResend = email || searchParams.get('email')
      
      if (!emailToResend) {
        setError('Please provide your email address.')
        return
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToResend,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`
        }
      })

      if (error) throw error

      setResendSuccess(true)
      setEmail('')
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification email to your inbox
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-center">
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
              error ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <svg 
                className={`h-6 w-6 ${error ? 'text-red-600' : 'text-green-600'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {error ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                )}
              </svg>
            </div>
            
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            )}

            {resendSuccess && (
              <div className="mt-4 rounded-md bg-green-50 p-3">
                <h3 className="text-sm font-medium text-green-800">
                  Verification email resent successfully! Check your inbox.
                </h3>
              </div>
            )}

            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {error ? 'Verification Link Expired' : 'Verify Your Email'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {error 
                ? 'Your verification link has expired. Please request a new one below.'
                : 'Click the link in the email we sent to verify your account.'
              }
            </p>

            {email && (
              <div className="mt-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-500">
                try signing up again
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

