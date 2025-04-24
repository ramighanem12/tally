'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Auth from '@/components/Auth'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== '/') {
      router.push('/')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Auth />
  }

  return <>{children}</>
} 