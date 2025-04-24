'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ServicesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to sales tax page
    router.push('/services/sales-tax')
  }, [router])

  // Return empty div while redirecting
  return <div />
} 