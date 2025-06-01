'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import CopilotNavigation from '../components/CopilotNavigation'
import { useAuth } from '@/contexts/AuthContext'
import ActivityRowPopover from '../components/ActivityRowPopover'
import { allRows } from '../data/sampleData'

export default function ActivityPage() {
  const [filters, setFilters] = useState({
    payPeriod: 'All Pay Periods',
    project: 'All Projects', 
    adjustments: 'All Call Limit Adjustments',
    feedback: 'All Feedback'
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activitiesSubTab, setActivitiesSubTab] = useState<'pending' | 'completed'>('pending')
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

  // Calculate counts for each tab
  const pendingCount = useMemo(() => {
    return allRows.filter(row => 
      row.paidOn === 'Pending' || row.qualityDisplay === 'Pending' || row.earnings === 'Pending'
    ).length
  }, [allRows])

  const completedCount = useMemo(() => {
    return allRows.filter(row => 
      row.paidOn !== 'Pending' && row.qualityDisplay !== 'Pending' && row.earnings !== 'Pending'
    ).length
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

  // Reset to first page when switching sub-tabs
  const handleActivitiesSubTabChange = (subTab: 'pending' | 'completed') => {
    setActivitiesSubTab(subTab)
    setCurrentPage(1)
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
          <div className="px-4 pb-4 sm:pl-8 sm:pr-6 sm:pb-6">
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
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    5% from last week
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
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
                  Pending review ({pendingCount})
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
                  Completed ({completedCount})
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
        </main>
      </div>
    </div>
  )
} 