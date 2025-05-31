'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Auth from '@/components/Auth'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to main app
        router.push('/projects')
      } else {
        // User is not authenticated, they'll see the login form
        // The Auth component will handle this
      }
    }
  }, [user, loading, router])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If user is not authenticated, show login
  if (!user) {
    return <Auth />
  }
  
  // This shouldn't render since we redirect above, but just in case
  return null
}

