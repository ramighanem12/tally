'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import CopilotNavigation from '../components/CopilotNavigation'
import { useAuth } from '@/contexts/AuthContext'
import ActivityRowPopover from '../components/ActivityRowPopover'

export default function ActivityPage() {
  const [filters, setFilters] = useState({
    payPeriod: 'All Pay Periods',
    project: 'All Projects', 
    adjustments: 'All Call Limit Adjustments',
    feedback: 'All Feedback'
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'earnings' | 'payouts'>('earnings')
  const [payoutCurrentPage, setPayoutCurrentPage] = useState(1)
  const [activitiesSubTab, setActivitiesSubTab] = useState<'pending' | 'completed'>('pending')
  const [payoutsSubTab, setPayoutsSubTab] = useState<'pending' | 'paid'>('pending')
  const rowsPerPage = 10
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null)

  const dropdownRefs = {
    payPeriod: useRef<HTMLDivElement>(null),
    project: useRef<HTMLDivElement>(null),
    adjustments: useRef<HTMLDivElement>(null),
    feedback: useRef<HTMLDivElement>(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Check if click is on any dropdown button
      const isDropdownButton = target.closest('button')?.getAttribute('data-dropdown-type')
      
      if (openDropdown && !isDropdownButton && 
          dropdownRefs[openDropdown as keyof typeof dropdownRefs]?.current && 
          !dropdownRefs[openDropdown as keyof typeof dropdownRefs].current!.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const hasActiveFilters = Object.values(filters).some(filter => !filter.startsWith('All'))

  const clearFilters = () => {
    setFilters({
      payPeriod: 'All Pay Periods',
      project: 'All Projects',
      adjustments: 'All Call Limit Adjustments', 
      feedback: 'All Feedback'
    })
    setCurrentPage(1)
    setOpenDropdown(null)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
    setCurrentPage(1)
    setOpenDropdown(null)
  }

  const toggleDropdown = (dropdownType: string) => {
    // If clicking the same dropdown, toggle it
    if (openDropdown === dropdownType) {
      setOpenDropdown(null)
    } else {
      // If clicking a different dropdown, open it directly
      setOpenDropdown(dropdownType)
    }
  }

  const CustomDropdown = ({ type, value, options }: { type: string; value: string; options: string[] }) => (
    <div className="relative" ref={dropdownRefs[type as keyof typeof dropdownRefs]}>
      <button
        onClick={() => toggleDropdown(type)}
        data-dropdown-type={type}
        className={`appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-[11px] sm:text-[13px] font-medium text-gray-700 hover:border-gray-300 focus:outline-none cursor-pointer w-full text-left min-w-[140px] sm:min-w-[180px] ${
          openDropdown === type 
            ? 'ring-2 ring-blue-500 border-transparent' 
            : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        }`}
      >
        <span className="truncate">{value}</span>
      </button>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg 
          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-150 ${
            openDropdown === type ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {openDropdown === type && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 max-h-60 overflow-y-auto min-w-[180px] sm:min-w-[220px]">
          {options.map((option: string) => (
            <button
              key={option}
              onClick={() => handleFilterChange(type, option)}
              className={`w-full text-left px-3 py-2 text-[11px] sm:text-[13px] font-medium transition-colors duration-75 block mx-2 rounded-md flex items-center justify-between ${
                value === option 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{ width: 'calc(100% - 16px)' }}
            >
              <span className="flex-1 truncate">{option}</span>
              {value === option && (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // Sample data - in real app this would come from API
  const allRows = [
    {
      id: 1,
      project: "Podcast (English)",
      question: "How do airplanes stay in the air?",
      paidOn: "Pending",
      endTime: "3:45 PM",
      endDate: "12/15",
      earnings: "Pending",
      earningsValue: 0,
      hourlyRate: "$25/hr",
      duration: "12.0",
      quality: 0,
      qualityDisplay: "Pending",
      payPeriod: "December 16, 2024",
      feedback: "Pending",
      conversationTopic: "What are the impacts of aerodynamics on flight efficiency?"
    },
    {
      id: 2,
      project: "Spanish 🇪🇸",
      question: "What is the capital of France?",
      paidOn: "Pending",
      endTime: "2:30 PM",
      endDate: "12/15",
      earnings: "Pending",
      earningsValue: 0,
      hourlyRate: "$17.50/hr",
      duration: "8.5",
      quality: 0,
      qualityDisplay: "Pending",
      payPeriod: "December 16, 2024",
      feedback: "Pending",
      conversationTopic: "What does the future of European geography education look like?"
    },
    {
      id: 3,
      project: "Assistant (English)",
      question: "Explain quantum physics in simple terms",
      paidOn: "12/13",
      endTime: "11:15 AM",
      endDate: "12/12",
      earnings: "$5.25",
      earningsValue: 5.25,
      hourlyRate: "$22.50/hr",
      duration: "14.0",
      quality: 92,
      payPeriod: "December 9, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What are the impacts of quantum mechanics on modern technology?"
    },
    {
      id: 4,
      project: "Podcast (English)",
      question: "How does photosynthesis work?",
      paidOn: "12/11",
      endTime: "4:20 PM",
      endDate: "12/10",
      earnings: "$3.75",
      earningsValue: 3.75,
      hourlyRate: "$25/hr",
      duration: "9.0",
      quality: 88,
      payPeriod: "December 2, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What does the future of renewable energy look like?"
    },
    {
      id: 5,
      project: "Spanish 🇪🇸",
      question: "What are the benefits of renewable energy?",
      paidOn: "12/09",
      endTime: "1:45 PM",
      endDate: "12/08",
      earnings: "$4.38",
      earningsValue: 4.38,
      hourlyRate: "$17.50/hr",
      duration: "15.0",
      quality: 95,
      payPeriod: "December 2, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What are the impacts of solar power on global energy markets?"
    },
    {
      id: 6,
      project: "Assistant (English)",
      question: "Explain the water cycle",
      paidOn: "12/07",
      endTime: "9:30 AM",
      endDate: "12/06",
      earnings: "$6.12",
      earningsValue: 6.12,
      hourlyRate: "$22.50/hr",
      duration: "16.3",
      quality: 91,
      payPeriod: "November 25, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What does the future of water conservation look like?"
    },
    {
      id: 7,
      project: "Podcast (English)",
      question: "What causes earthquakes?",
      paidOn: "12/05",
      endTime: "6:15 PM",
      endDate: "12/04",
      earnings: "$6.25",
      earningsValue: 6.25,
      hourlyRate: "$25/hr",
      duration: "15.0",
      quality: 87,
      payPeriod: "November 25, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What are the impacts of seismic activity on urban infrastructure?"
    },
    {
      id: 8,
      project: "Assistant (English)",
      question: "How effective are vaccines?",
      paidOn: "12/03",
      endTime: "3:00 PM",
      endDate: "12/02",
      earnings: "$4.50",
      earningsValue: 4.50,
      hourlyRate: "$22.50/hr",
      duration: "12.0",
      quality: 90,
      payPeriod: "November 25, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What does the future of vaccine development look like?"
    },
    {
      id: 9,
      project: "Spanish 🇪🇸",
      question: "Explain how magnets work",
      paidOn: "12/01",
      endTime: "7:45 PM",
      endDate: "11/30",
      earnings: "$3.50",
      earningsValue: 3.50,
      hourlyRate: "$17.50/hr",
      duration: "12.0",
      quality: 89,
      payPeriod: "November 25, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What are the impacts of magnetism on modern technology?"
    },
    {
      id: 10,
      project: "Podcast (English)",
      question: "What are the phases of the moon?",
      paidOn: "11/29",
      endTime: "5:30 PM",
      endDate: "11/28",
      earnings: "$7.50",
      earningsValue: 7.50,
      hourlyRate: "$25/hr",
      duration: "18.0",
      quality: 94,
      payPeriod: "November 18, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What does the future of lunar exploration look like?"
    },
    {
      id: 11,
      project: "Assistant (English)",
      question: "How do ocean currents affect climate?",
      paidOn: "11/27",
      endTime: "1:15 PM",
      endDate: "11/26",
      earnings: "$4.95",
      earningsValue: 4.95,
      hourlyRate: "$22.50/hr",
      duration: "13.2",
      quality: 87,
      payPeriod: "November 11, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What are the impacts of ocean currents on global climate patterns?"
    },
    {
      id: 12,
      project: "Spanish 🇪🇸",
      question: "Why is photosynthesis important?",
      paidOn: "11/25",
      endTime: "4:00 PM",
      endDate: "11/24",
      earnings: "$5.25",
      earningsValue: 5.25,
      hourlyRate: "$17.50/hr",
      duration: "18.0",
      quality: 93,
      payPeriod: "November 4, 2024",
      feedback: "Good Feedback",
      conversationTopic: "What does the future of sustainable agriculture look like?"
    }
  ]

  // Filter the data based on current filters and sub-tab
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      const payPeriodMatch = filters.payPeriod === 'All Pay Periods' || row.payPeriod === filters.payPeriod
      const projectMatch = filters.project === 'All Projects' || row.project === filters.project
      const feedbackMatch = filters.feedback === 'All Feedback' || row.feedback === filters.feedback
      const adjustmentsMatch = filters.adjustments === 'All Call Limit Adjustments' || filters.adjustments === 'No Adjustments'
      
      // Add sub-tab filtering
      const subTabMatch = activitiesSubTab === 'pending' 
        ? row.paidOn === 'Pending' || row.qualityDisplay === 'Pending' || row.earnings === 'Pending'
        : row.paidOn !== 'Pending' && row.qualityDisplay !== 'Pending' && row.earnings !== 'Pending'
      
      return payPeriodMatch && projectMatch && feedbackMatch && adjustmentsMatch && subTabMatch
    })
  }, [filters, activitiesSubTab])

  // Calculate metrics from all activities (not filtered)
  const allActivitiesMetrics = useMemo(() => {
    const totalEarnings = allRows.reduce((sum, activity) => {
      if (activity.earnings !== "Pending") {
        // Extract numeric value from earnings string like "$12.50"
        const earningsValue = parseFloat(activity.earnings.replace('$', ''))
        return sum + earningsValue
      }
      return sum
    }, 0)

    const pendingEarnings = allRows.reduce((sum, activity) => {
      if (activity.earnings === "Pending") {
        // For pending activities, estimate earnings based on duration and hourly rate
        const duration = parseInt(activity.duration)
        const hourlyRate = parseFloat(activity.hourlyRate.replace('$', ''))
        const estimatedEarnings = (duration / 60) * hourlyRate
        return sum + estimatedEarnings
      }
      return sum
    }, 0)

    const totalCalls = allRows.length
    const goodCalls = allRows.filter(row => row.quality >= 85).length
    const goodCallRatio = totalCalls > 0 ? Math.round((goodCalls / totalCalls) * 100) : 0

    return {
      totalCalls,
      totalEarnings: totalEarnings.toFixed(2),
      pendingEarnings: pendingEarnings.toFixed(2),
      goodCallRatio
    }
  }, [allRows])

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentRows = filteredRows.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Sample payout data
  const payouts = [
    {
      id: 1,
      payPeriod: "Dec 9 - Dec 15, 2024",
      payoutDate: "Dec 17, 2024",
      status: "pending",
      amount: 45.67,
      method: "Bank Transfer"
    },
    {
      id: 2,
      payPeriod: "Dec 2 - Dec 8, 2024", 
      payoutDate: "Dec 10, 2024",
      status: "paid",
      amount: 38.92,
      method: "PayPal"
    },
    {
      id: 3,
      payPeriod: "Nov 25 - Dec 1, 2024",
      payoutDate: "Dec 3, 2024", 
      status: "paid",
      amount: 52.14,
      method: "Bank Transfer"
    },
    {
      id: 4,
      payPeriod: "Nov 18 - Nov 24, 2024",
      payoutDate: "Nov 26, 2024",
      status: "paid", 
      amount: 41.83,
      method: "Bank Transfer"
    },
    {
      id: 5,
      payPeriod: "Nov 11 - Nov 17, 2024",
      payoutDate: "Nov 19, 2024",
      status: "paid",
      amount: 56.33,
      method: "Bank Transfer"
    },
    {
      id: 6,
      payPeriod: "Nov 4 - Nov 10, 2024",
      payoutDate: "Nov 12, 2024",
      status: "paid",
      amount: 43.21,
      method: "Bank Transfer"
    },
    {
      id: 7,
      payPeriod: "Oct 28 - Nov 3, 2024",
      payoutDate: "Nov 5, 2024",
      status: "paid",
      amount: 39.87,
      method: "PayPal"
    },
    {
      id: 8,
      payPeriod: "Oct 21 - Oct 27, 2024",
      payoutDate: "Oct 29, 2024",
      status: "paid",
      amount: 47.65,
      method: "Bank Transfer"
    }
  ]

  // Filter payouts based on sub-tab
  const filteredPayouts = useMemo(() => {
    return payouts.filter(payout => {
      if (payoutsSubTab === 'pending') {
        return payout.status === 'pending'
      } else {
        return payout.status === 'paid'
      }
    })
  }, [payoutsSubTab])

  // Payout pagination logic - use filtered payouts
  const payoutTotalPages = Math.ceil(filteredPayouts.length / rowsPerPage)
  const payoutStartIndex = (payoutCurrentPage - 1) * rowsPerPage
  const payoutEndIndex = payoutStartIndex + rowsPerPage
  const payoutRows = filteredPayouts.slice(payoutStartIndex, payoutEndIndex)

  const goToPayoutNextPage = () => {
    if (payoutCurrentPage < payoutTotalPages) {
      setPayoutCurrentPage(payoutCurrentPage + 1)
    }
  }

  const goToPayoutPrevPage = () => {
    if (payoutCurrentPage > 1) {
      setPayoutCurrentPage(payoutCurrentPage - 1)
    }
  }

  // Reset to first page when switching sub-tabs
  const handleActivitiesSubTabChange = (subTab: 'pending' | 'completed') => {
    setActivitiesSubTab(subTab)
    setCurrentPage(1)
  }

  // Reset to first page when switching payout sub-tabs
  const handlePayoutsSubTabChange = (subTab: 'pending' | 'paid') => {
    setPayoutsSubTab(subTab)
    setPayoutCurrentPage(1)
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="activity" />
      <div className="flex-1 bg-[#F3F6F6] pt-2 pr-2 pb-2 sm:pt-4 sm:pr-4 sm:pb-4 overflow-hidden">
        <main className="h-full w-full bg-white rounded-lg overflow-y-auto">
          {/* Header section */}
          <div className="px-4 pt-4 pb-3 sm:pl-8 sm:pr-4 sm:pt-8 sm:pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-[28px] sm:text-[28px] sm:leading-[36px] font-semibold text-[#1A1A1A]">
                  Activity
                </h1>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="px-4 sm:pl-8 sm:pr-6">
            <div className="flex space-x-6 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('earnings')}
                className={`pb-3 text-[14px] font-medium transition-colors relative ${
                  activeTab === 'earnings'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Activities
                {activeTab === 'earnings' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`pb-3 text-[14px] font-medium transition-colors relative ${
                  activeTab === 'payouts'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Payouts
                {activeTab === 'payouts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
            </div>
          </div>

          {/* Filter controls */}
          {/* <div className="px-4 pb-4 sm:pl-8 sm:pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <CustomDropdown
                type="payPeriod"
                value={filters.payPeriod}
                options={[
                  'All Pay Periods', 
                  'December 16, 2024', 
                  'December 9, 2024', 
                  'December 2, 2024', 
                  'November 25, 2024',
                  'November 18, 2024',
                  'November 11, 2024',
                  'November 4, 2024'
                ]}
              />

              <CustomDropdown
                type="project"
                value={filters.project}
                options={['All Projects', 'English Assistant', 'English Companion', 'English P4']}
              />

              <CustomDropdown
                type="adjustments"
                value={filters.adjustments}
                options={['All Call Limit Adjustments', 'Positive Adjustments', 'Negative Adjustments', 'No Adjustments']}
              />

              <CustomDropdown
                type="feedback"
                value={filters.feedback}
                options={['All Feedback', 'Good Feedback', 'Needs Improvement', 'Poor Feedback']}
              />

              <button 
                disabled={!hasActiveFilters}
                onClick={clearFilters}
                className={`px-3 py-2 text-[11px] sm:text-[13px] rounded-lg font-medium transition-all duration-200 ${
                  hasActiveFilters 
                    ? 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                    : 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div> */}

          {/* Metrics cards */}
          {activeTab === 'earnings' && (
            <div className="px-4 pb-4 pt-4 sm:pl-8 sm:pr-6 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="text-xl font-semibold text-[#1A1A1A]">Total calls</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Number of calls</div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">{allActivitiesMetrics.totalCalls}</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xl font-semibold text-[#1A1A1A]">Total earnings</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Earnings from all calls</div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">${allActivitiesMetrics.totalEarnings}</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xl font-semibold text-[#1A1A1A]">Quality score</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Calls reviewed as good quality</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">{allActivitiesMetrics.goodCallRatio}%</div>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[13.5px] font-medium bg-white text-green-700 border border-green-200">
                      +5% w/w
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="px-4 pb-4 pt-4 sm:pl-8 sm:pr-6 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xl font-semibold text-[#1A1A1A]">Earned pending payout</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Pending payout amount</div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">${allActivitiesMetrics.pendingEarnings}</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xl font-semibold text-[#1A1A1A]">Lifetime earnings</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Total earnings to date</div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">${allActivitiesMetrics.totalEarnings}</div>
                </div>
              </div>
            </div>
          )}

          {/* Payouts table */}
          {activeTab === 'payouts' && (
            <div className="px-4 pb-4 sm:pl-8 sm:pr-6 sm:pb-6">
              {/* Table header */}
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Your payouts</h2>

              {/* Payouts sub-tab switcher */}
              <div className="mb-4">
                <div className="flex space-x-6 border-b border-gray-100">
                  <button
                    onClick={() => handlePayoutsSubTabChange('pending')}
                    className={`pb-3 text-[14px] font-medium transition-colors relative ${
                      payoutsSubTab === 'pending'
                        ? 'text-[#1A1A1A]'
                        : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Pending
                    {payoutsSubTab === 'pending' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                    )}
                  </button>
                  <button
                    onClick={() => handlePayoutsSubTabChange('paid')}
                    className={`pb-3 text-[14px] font-medium transition-colors relative ${
                      payoutsSubTab === 'paid'
                        ? 'text-[#1A1A1A]'
                        : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Paid
                    {payoutsSubTab === 'paid' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-fixed min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-100 border-0">
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[25%] border-0 first:rounded-l-lg last:rounded-r-lg">Pay period</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[20%] border-0 first:rounded-l-lg last:rounded-r-lg">Payout date</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[15%] border-0 first:rounded-l-lg last:rounded-r-lg">Status</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[20%] border-0 first:rounded-l-lg last:rounded-r-lg">Amount</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[20%] border-0 first:rounded-l-lg last:rounded-r-lg">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRows.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{payout.payPeriod}</div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{payout.payoutDate}</div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          {payout.status === "pending" ? (
                            <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] flex items-center gap-1.5">
                              <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Pending
                            </div>
                          ) : (
                            <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] flex items-center gap-1.5">
                              <svg className="h-3 w-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z"></path>
                              </svg>
                              Paid
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">${payout.amount.toFixed(2)}</div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] flex items-center gap-1">
                            {payout.method === 'PayPal' && (
                              <img src="/paypal.svg" alt="PayPal" className="w-4 h-4" />
                            )}
                            {payout.method}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for payouts */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
                <div className="text-[11px] sm:text-[13px] text-gray-500">
                  Showing {filteredPayouts.length > 0 ? payoutStartIndex + 1 : 0}-{Math.min(payoutEndIndex, filteredPayouts.length)} of {filteredPayouts.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPayoutPrevPage}
                    disabled={payoutCurrentPage === 1}
                    className={`px-2 py-1.5 text-[11px] sm:text-[13px] rounded-lg font-medium transition-all duration-200 ${
                      payoutCurrentPage === 1
                        ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-[11px] sm:text-[13px] text-gray-500 px-3">
                    Page {payoutCurrentPage} of {payoutTotalPages || 1}
                  </span>
                  <button
                    onClick={goToPayoutNextPage}
                    disabled={payoutCurrentPage === payoutTotalPages || payoutTotalPages === 0}
                    className={`px-2 py-1.5 text-[11px] sm:text-[13px] rounded-lg font-medium transition-all duration-200 ${
                      payoutCurrentPage === payoutTotalPages || payoutTotalPages === 0
                        ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main content area */}
          {activeTab === 'earnings' && (
            <div className="px-4 pb-4 sm:pl-8 sm:pr-6 sm:pb-6">
              {/* Table header */}
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Your activities</h2>

              {/* Activities sub-tab switcher */}
              <div className="mb-4">
                <div className="flex space-x-6 border-b border-gray-100">
                  <button
                    onClick={() => handleActivitiesSubTabChange('pending')}
                    className={`pb-3 text-[14px] font-medium transition-colors relative ${
                      activitiesSubTab === 'pending'
                        ? 'text-[#1A1A1A]'
                        : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Pending review
                    {activitiesSubTab === 'pending' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                    )}
                  </button>
                  <button
                    onClick={() => handleActivitiesSubTabChange('completed')}
                    className={`pb-3 text-[14px] font-medium transition-colors relative ${
                      activitiesSubTab === 'completed'
                        ? 'text-[#1A1A1A]'
                        : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Completed
                    {activitiesSubTab === 'completed' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-fixed min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-100 border-0">
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[25%] border-0 first:rounded-l-lg last:rounded-r-lg">Activity</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[15%] border-0 first:rounded-l-lg last:rounded-r-lg">Recorded on</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[15%] border-0 first:rounded-l-lg last:rounded-r-lg">Duration (min)</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[15%] border-0 first:rounded-l-lg last:rounded-r-lg">Earnings</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[15%] border-0 first:rounded-l-lg last:rounded-r-lg">Paid on</th>
                      <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[15%] border-0 first:rounded-l-lg last:rounded-r-lg">Quality score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row) => (
                      <ActivityRowPopover
                        key={row.id}
                        conversationTopic={row.conversationTopic}
                        isVisible={hoveredRowId === row.id}
                        onMouseEnter={() => setHoveredRowId(row.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] truncate">
                            {row.project}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{row.endDate}, {row.endTime}</div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] first:rounded-l-lg last:rounded-r-lg">{row.duration}</td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          {row.earnings === "Pending" ? (
                            <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] flex items-center gap-1.5">
                              <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Pending
                            </div>
                          ) : (
                            <div className="text-[11px] sm:text-[13px]">
                              <span className="text-[#1A1A1A] font-medium">{row.earnings}</span>
                              <span className="text-gray-500 font-medium"> ({row.hourlyRate})</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{row.paidOn === "Pending" ? (
                            <div className="flex items-center gap-1.5">
                              <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Pending
                            </div>
                          ) : row.paidOn}</div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">
                            {row.qualityDisplay === "Pending" ? (
                              <div className="flex items-center gap-1.5">
                                <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Pending
                              </div>
                            ) : `${row.quality}%`}
                          </div>
                        </td>
                      </ActivityRowPopover>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
                <div className="text-[11px] sm:text-[13px] text-gray-500">
                  Showing {filteredRows.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredRows.length)} of {filteredRows.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`px-2 py-1.5 text-[11px] sm:text-[13px] rounded-lg font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-[11px] sm:text-[13px] text-gray-500 px-3">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-2 py-1.5 text-[11px] sm:text-[13px] rounded-lg font-medium transition-all duration-200 ${
                      currentPage === totalPages || totalPages === 0
                        ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 