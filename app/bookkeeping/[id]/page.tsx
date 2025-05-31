'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import BookkeepingLayout from './components/BookkeepingLayout'
import { supabase } from '@/lib/supabase'

export default function BookkeepingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Add effect to handle initial redirect
  useEffect(() => {
    // Get the first incomplete period or first period if none incomplete
    const getFirstPeriod = async () => {
      const { data: periods, error } = await supabase
        .from('bookkeeping_engagement_close_periods')
        .select('*')
        .eq('engagement_id', id)
        .eq('status', 'incomplete') // First try to get incomplete periods
        .order('period_year', { ascending: true })
        .order('period_month', { ascending: true })
        .order('period_quarter', { ascending: true })
        .limit(1)

      if (!error && periods && periods.length > 0) {
        router.push(`/bookkeeping/${id}/close/${periods[0].id}`)
      } else {
        // If no incomplete periods, get the most recent completed period
        const { data: completedPeriods, error: completedError } = await supabase
          .from('bookkeeping_engagement_close_periods')
          .select('*')
          .eq('engagement_id', id)
          .eq('status', 'complete')
          .order('period_year', { ascending: false })
          .order('period_month', { ascending: false })
          .order('period_quarter', { ascending: false })
          .limit(1)

        if (!completedError && completedPeriods && completedPeriods.length > 0) {
          router.push(`/bookkeeping/${id}/close/${completedPeriods[0].id}`)
        }
      }
    }

    getFirstPeriod()
  }, [id, router])

  return (
    <BookkeepingLayout 
      engagementId={id}
    >
      {/* Right Side - Loading state while redirecting */}
      <div className="flex-1 flex items-center justify-center bg-[#F3F6F6]">
        <div className="animate-pulse">Loading...</div>
      </div>
    </BookkeepingLayout>
  )
} 