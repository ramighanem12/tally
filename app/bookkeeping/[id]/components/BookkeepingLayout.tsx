'use client'
import { useState, useEffect, useCallback, useRef, useLayoutEffect, ReactElement, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams, useSelectedLayoutSegments, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import CopilotNavigation from '../../../components/CopilotNavigation'
import EmptyState from './EmptyState'
import CreateClosePeriodModal from './CreateClosePeriodModal'
import { ClosePeriod } from '../../types'
import MasterEmptyState from './MasterEmptyState'
import { format } from 'date-fns'
import React from 'react'
import PeriodButton from './PeriodButton'

interface EngagementDetails {
  id: string
  status: string
  client: {
    id: string
    name: string
  }
}

interface BookkeepingLayoutProps {
  engagementId: string
  children: ReactElement
}

function formatPeriod(period: ClosePeriod): string {
  switch (period.period_format) {
    case 'monthly':
      return format(new Date(period.period_year, period.period_month! - 1), 'MMMM yyyy')
    case 'quarterly':
      return `Q${period.period_quarter} ${period.period_year}`
    case 'yearly':
      return period.period_year.toString()
  }
}

// Add helper to check if period is past due
const isPastDue = (period: ClosePeriod) => {
  const now = new Date()
  const periodDate = new Date(period.period_year, 
    period.period_month ? period.period_month - 1 : // For monthly
    period.period_quarter ? period.period_quarter * 3 - 1 : // For quarterly
    11, // For yearly, use December
    // Use last day of month instead of first day
    period.period_month ? new Date(period.period_year, period.period_month, 0).getDate() :
    period.period_quarter ? new Date(period.period_year, period.period_quarter * 3, 0).getDate() :
    31 // December 31st for yearly
  )
  return periodDate < now
}

export default function BookkeepingLayout({ 
  engagementId, 
  children
}: BookkeepingLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [engagement, setEngagement] = useState<EngagementDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isContentLoading, setIsContentLoading] = useState(false)

  const incompleteTabRef = useRef<HTMLButtonElement>(null)
  const completeTabRef = useRef<HTMLButtonElement>(null)
  const [activeTab, setActiveTab] = useState<'incomplete' | 'complete'>('incomplete')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [periods, setPeriods] = useState<ClosePeriod[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const segments = useSelectedLayoutSegments()

  // Remove the selectedPeriod state and use the URL param
  const params = useParams()
  const closeId = params.closeId as string

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [engagementResult, periodsResult] = await Promise.all([
        supabase
          .from('bookkeeping_engagements')
          .select(`
            id,
            status,
            client:clients!inner(
              id,
              name
            )
          `)
          .eq('id', engagementId)
          .single(),
        
        supabase
          .from('bookkeeping_engagement_close_periods')
          .select('*')
          .eq('engagement_id', engagementId)
          // Order by year ascending for in-progress periods
          .order('period_year', { ascending: true })
          .order('period_month', { ascending: true })
          .order('period_quarter', { ascending: true })
      ])

      if (engagementResult.error) throw engagementResult.error
      if (periodsResult.error) throw periodsResult.error

      // Sort the periods after fetching
      const sortedPeriods = periodsResult.data.sort((a, b) => {
        // Complete periods at the bottom, sorted by most recent first
        if (a.status === 'complete' && b.status === 'complete') {
          return b.period_year - a.period_year || 
                 (b.period_month || 0) - (a.period_month || 0) || 
                 (b.period_quarter || 0) - (a.period_quarter || 0)
        }
        // Incomplete periods at the top, sorted by earliest first
        if (a.status === 'incomplete' && b.status === 'incomplete') {
          return a.period_year - b.period_year || 
                 (a.period_month || 0) - (b.period_month || 0) || 
                 (a.period_quarter || 0) - (b.period_quarter || 0)
        }
        // Keep incomplete periods above complete ones
        return a.status === 'incomplete' ? -1 : 1
      })

      setEngagement({
        id: engagementResult.data.id,
        status: engagementResult.data.status,
        client: Array.isArray(engagementResult.data.client) 
          ? engagementResult.data.client[0] 
          : engagementResult.data.client
      })

      setPeriods(sortedPeriods)
      setMounted(true)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load engagement details')
    } finally {
      setLoading(false)
    }
  }, [engagementId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useLayoutEffect(() => {
    if (!mounted) return;
    
    const currentTabRef = activeTab === 'incomplete' ? incompleteTabRef : completeTabRef;
    
    const timeoutId = setTimeout(() => {
      if (currentTabRef.current && periods.length > 0) {
        setIndicatorStyle({
          left: currentTabRef.current.offsetLeft,
          width: currentTabRef.current.offsetWidth
        })
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [activeTab, mounted, periods.length])

  // Add effect to set active tab based on selected period
  useEffect(() => {
    if (closeId && periods.length > 0) {
      const selectedPeriod = periods.find(p => p.id === closeId)
      if (selectedPeriod) {
        setActiveTab(selectedPeriod.status === 'complete' ? 'complete' : 'incomplete')
      }
    }
  }, [closeId, periods])

  const handleTabChange = (tab: 'incomplete' | 'complete') => {
    setActiveTab(tab)

    // Auto-select first period in the new tab if one exists
    const periodsInTab = periods.filter(period => 
      tab === 'incomplete' 
        ? period.status === 'incomplete'
        : period.status === 'complete'
    )

    if (periodsInTab.length > 0) {
      const periodToSelect = periodsInTab[0]
      // Update URL without full navigation
      window.history.pushState({}, '', `/bookkeeping/${engagementId}/close/${periodToSelect.id}`)
      router.replace(`/bookkeeping/${engagementId}/close/${periodToSelect.id}`, { scroll: false })
    }
  }

  // Memoize filtered periods
  const filteredPeriods = useMemo(() => 
    periods.filter(period => 
      activeTab === 'incomplete' 
        ? period.status === 'incomplete'
        : period.status === 'complete'
    ),
    [periods, activeTab] // Only recalculate when periods or activeTab changes
  )

  // Memoize past due and upcoming periods
  const { pastDuePeriods, upcomingPeriods } = useMemo(() => {
    if (activeTab === 'complete') return { pastDuePeriods: [], upcomingPeriods: [] }
    
    return {
      pastDuePeriods: filteredPeriods.filter(p => isPastDue(p)),
      upcomingPeriods: filteredPeriods.filter(p => !isPastDue(p))
    }
  }, [filteredPeriods, activeTab])

  const handlePeriodClick = (period: ClosePeriod) => {
    // Just update URL without full navigation
    window.history.pushState({}, '', `/bookkeeping/${engagementId}/close/${period.id}`)
    // Force router to update pathname/params without navigation
    router.replace(`/bookkeeping/${engagementId}/close/${period.id}`, { scroll: false })
  }

  const handleCreateSuccess = (newPeriod: ClosePeriod) => {
    setPeriods(currentPeriods => {
      const typedNewPeriod = {
        ...newPeriod,
        status: newPeriod.status as 'incomplete' | 'complete'
      }
      return [typedNewPeriod, ...currentPeriods]
    })
    // Same here - update URL without refresh
    window.history.pushState({}, '', `/bookkeeping/${engagementId}/close/${newPeriod.id}`)
    router.replace(`/bookkeeping/${engagementId}/close/${newPeriod.id}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden">
        <CopilotNavigation selectedTab="bookkeeping" />
        <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
          <main className="h-full w-full bg-white overflow-hidden flex flex-col md:flex-row rounded-lg">
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse">Loading...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="bookkeeping" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
        <div className="h-full bg-white overflow-hidden flex rounded-lg">
          <main className="h-full w-full flex flex-col md:flex-row">
            {/* Left Side */}
            <div className="w-full md:w-[320px] lg:w-[400px] flex flex-col border-b md:border-b-0 md:border-r border-[#E4E5E1]">
              {/* Left Header */}
              <div className="pl-4 pr-4 py-3 border-b border-[#E4E5E1] flex-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => router.push('/bookkeeping')}
                      className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#F3F6F6] group"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6B7280] group-hover:text-[#1A1A1A] transition-colors">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <h1 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A] truncate max-w-[190px]">
                      {engagement?.client?.name}
                    </h1>
                  </div>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A]"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="hidden sm:inline">Add close</span>
                  </button>
                </div>
              </div>

              {periods.length > 0 ? (
                <>
                  {/* Tab Switcher */}
                  <div className="px-4 pt-3 flex gap-6 border-b border-[#E4E5E1] relative">
                    <div 
                      className="absolute bottom-0 h-[2px] bg-[#1A1A1A] transition-all duration-150 ease-out"
                      style={{
                        left: indicatorStyle.left,
                        width: indicatorStyle.width
                      }}
                    />
                    
                    <button 
                      ref={incompleteTabRef}
                      onClick={() => handleTabChange('incomplete')}
                      className={`pb-3 text-[15px] leading-[20px] font-oracle ${
                        activeTab === 'incomplete'
                          ? 'text-[#1A1A1A] font-medium'
                          : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
                      }`}
                    >
                      In Progress
                    </button>

                    <button 
                      ref={completeTabRef}
                      onClick={() => handleTabChange('complete')}
                      className={`pb-3 text-[15px] leading-[20px] font-oracle ${
                        activeTab === 'complete'
                          ? 'text-[#1A1A1A] font-medium'
                          : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
                      }`}
                    >
                      Closed
                    </button>
                  </div>

                  {/* Scrollable Content with filtered periods */}
                  <div className="px-4 pt-4 pb-6 overflow-y-auto">
                    {/* Both views are always in DOM, just hidden/shown */}
                    <div className={activeTab === 'incomplete' ? 'block' : 'hidden'}>
                      {/* Past Due Section */}
                      {pastDuePeriods.length > 0 && (
                        <>
                          <div className="mb-2 px-1">
                            <span className="text-[14px] font-medium text-[#6B7280]">Past Due</span>
                          </div>
                          {pastDuePeriods.map((period) => (
                            <PeriodButton 
                              key={period.id}
                              period={period}
                              isSelected={period.id === closeId}
                              onClick={() => handlePeriodClick(period)}
                            />
                          ))}
                        </>
                      )}

                      {/* Up Next Section */}
                      {upcomingPeriods.length > 0 && (
                        <>
                          <div className="mb-2 px-1">
                            <span className="text-[14px] font-medium text-[#6B7280]">Up Next</span>
                          </div>
                          {upcomingPeriods.map((period) => (
                            <PeriodButton 
                              key={period.id}
                              period={period}
                              isSelected={period.id === closeId}
                              onClick={() => handlePeriodClick(period)}
                            />
                          ))}
                        </>
                      )}
                    </div>

                    <div className={activeTab === 'complete' ? 'block' : 'hidden'}>
                      {filteredPeriods.map((period) => (
                        <PeriodButton 
                          key={period.id}
                          period={period}
                          isSelected={period.id === closeId}
                          onClick={() => handlePeriodClick(period)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Show master empty state when no periods exist
                <div className="flex-1 flex items-center justify-center">
                  <MasterEmptyState />
                </div>
              )}
            </div>

            {/* Right Side */}
            {children}
          </main>
        </div>
      </div>

      <CreateClosePeriodModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateSuccess}
        engagementId={engagementId}
      />
    </div>
  )
} 