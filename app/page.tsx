'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/vault')
  }, [router])

  return null // No need to render anything since we're redirecting
}

