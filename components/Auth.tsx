'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Auth() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      setError(authError?.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return null // Let ProtectedLayout handle the authenticated state
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))]" />
      
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg">
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 500 500" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
              >
                <rect width="500" height="500" rx="100" fill="#93D0E5"/>
                <path d="M250 422L165.148 379.574C145.795 369.897 130.103 354.205 120.426 334.852L78 250L162.852 292.426C182.205 302.103 197.897 317.795 207.574 337.148L250 422Z" fill="#00285A"/>
                <path d="M422 250L379.574 334.852C369.897 354.205 354.205 369.897 334.852 379.574L250 422L292.426 337.148C302.103 317.795 317.795 302.103 337.148 292.426L422 250Z" fill="#00285A"/>
                <path d="M250 78L165.148 120.426C145.795 130.103 130.103 145.795 120.426 165.148L78 250L135.333 221.333L162.852 207.574C182.205 197.897 197.897 182.205 207.574 162.852L250 78Z" fill="#00285A"/>
                <path d="M250 78L292.426 162.852C302.103 182.205 317.795 197.897 337.148 207.574L422 250L379.574 165.148C369.897 145.795 354.205 130.103 334.852 120.426L250 78Z" fill="#00285A"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Welcome back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 dark:focus:border-slate-400
                    transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 dark:focus:border-slate-400
                    transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-900 dark:bg-slate-800
                hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium rounded-xl
                focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 dark:disabled:hover:bg-slate-800
                transition-all duration-200 shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 hover:scale-[1.02]
                active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          {/* Sign up section */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <button className="font-semibold text-slate-900 dark:text-white underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Sign up.
              </button>
            </p>
          </div>

          {/* Footer - Commented out for now */}
          {/* 
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Need access?{' '}
              <button className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                Contact administrator
              </button>
            </p>
          </div>
          */}
        </div>

        {/* Decorative Elements - Commented out */}
        {/* 
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl" />
        */}
      </div>
    </div>
  )
} 