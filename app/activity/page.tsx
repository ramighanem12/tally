'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import CopilotNavigation from '../components/CopilotNavigation'

export default function ActivityPage() {
  const [filters, setFilters] = useState({
    payPeriod: 'All Pay Periods',
    project: 'All Projects', 
    adjustments: 'All Call Limit Adjustments',
    feedback: 'All Feedback'
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const rowsPerPage = 10

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
      project: "English Assistant",
      question: "How do airplanes stay in the air?",
      paidOn: "Pending",
      paidOnType: "pending",
      endTime: "3:45 PM",
      endDate: "12/14",
      earnings: "Pending",
      earningsValue: 0,
      hourlyRate: "$30/hr",
      duration: "15.0",
      quality: 95,
      qualityDisplay: "Pending",
      payPeriod: "December 16, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 2,
      project: "English Companion",
      question: "What is the lifecycle of a dragonfly from nymph to adult?",
      paidOn: "12/12",
      paidOnType: "paid",
      endTime: "1:20 PM",
      endDate: "12/11",
      earnings: "$5.21",
      earningsValue: 5.21,
      hourlyRate: "$25/hr",
      duration: "12.5",
      quality: 88,
      qualityDisplay: null,
      payPeriod: "December 9, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 3,
      project: "English P4",
      question: "Why do some animals hibernate in winter?",
      paidOn: "12/10",
      endTime: "11:15 AM",
      endDate: "12/9",
      earnings: "$3.50",
      earningsValue: 3.50,
      hourlyRate: "$17.50/hr",
      duration: "12.0",
      quality: 92,
      payPeriod: "December 2, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 4,
      project: "English Assistant",
      question: "How do plants make their own food through photosynthesis?",
      paidOn: "12/8",
      endTime: "4:30 PM",
      endDate: "12/7",
      earnings: "$6.25",
      earningsValue: 6.25,
      hourlyRate: "$30/hr",
      duration: "12.5",
      quality: 76,
      payPeriod: "November 25, 2024",
      feedback: "Needs Improvement"
    },
    {
      id: 5,
      project: "English Companion",
      question: "What causes earthquakes and how are they measured?",
      paidOn: "12/5",
      endTime: "2:10 PM",
      endDate: "12/4",
      earnings: "$6.25",
      earningsValue: 6.25,
      hourlyRate: "$25/hr",
      duration: "15.0",
      quality: 100,
      payPeriod: "November 18, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 6,
      project: "English Assistant",
      question: "How do volcanoes form and erupt?",
      paidOn: "12/3",
      endTime: "9:45 AM",
      endDate: "12/2",
      earnings: "$5.50",
      earningsValue: 5.50,
      hourlyRate: "$30/hr",
      duration: "11.0",
      quality: 85,
      payPeriod: "December 2, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 7,
      project: "English P4",
      question: "What is the water cycle and how does it work?",
      paidOn: "12/1",
      endTime: "3:20 PM",
      endDate: "11/30",
      earnings: "$4.38",
      earningsValue: 4.38,
      hourlyRate: "$17.50/hr",
      duration: "15.0",
      quality: 98,
      payPeriod: "November 11, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 8,
      project: "English Companion",
      question: "Why do leaves change color in autumn?",
      paidOn: "11/29",
      endTime: "1:15 PM",
      endDate: "11/28",
      earnings: "$4.17",
      earningsValue: 4.17,
      hourlyRate: "$25/hr",
      duration: "10.0",
      quality: 91,
      payPeriod: "November 4, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 9,
      project: "English Assistant",
      question: "How do magnets work and what are magnetic fields?",
      paidOn: "11/27",
      endTime: "10:30 AM",
      endDate: "11/26",
      earnings: "$4.50",
      earningsValue: 4.50,
      hourlyRate: "$30/hr",
      duration: "9.0",
      quality: 89,
      payPeriod: "November 25, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 10,
      project: "English P4",
      question: "What causes the phases of the moon?",
      paidOn: "11/25",
      endTime: "4:45 PM",
      endDate: "11/24",
      earnings: "$2.92",
      earningsValue: 2.92,
      hourlyRate: "$17.50/hr",
      duration: "10.0",
      quality: 94,
      payPeriod: "November 18, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 11,
      project: "English Assistant",
      question: "How do ocean currents affect global climate?",
      paidOn: "11/23",
      endTime: "2:30 PM",
      endDate: "11/22",
      earnings: "$6.75",
      earningsValue: 6.75,
      hourlyRate: "$30/hr",
      duration: "13.5",
      quality: 87,
      payPeriod: "November 11, 2024",
      feedback: "Good Feedback"
    },
    {
      id: 12,
      project: "English Companion",
      question: "What is photosynthesis and why is it important?",
      paidOn: "11/21",
      endTime: "5:15 PM",
      endDate: "11/20",
      earnings: "$3.13",
      earningsValue: 3.13,
      hourlyRate: "$25/hr",
      duration: "7.5",
      quality: 93,
      payPeriod: "November 4, 2024",
      feedback: "Good Feedback"
    }
  ]

  // Filter the data based on current filters
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      const payPeriodMatch = filters.payPeriod === 'All Pay Periods' || row.payPeriod === filters.payPeriod
      const projectMatch = filters.project === 'All Projects' || row.project === filters.project
      const feedbackMatch = filters.feedback === 'All Feedback' || row.feedback === filters.feedback
      // For adjustments, we'll assume "No Adjustments" for all rows for now
      const adjustmentsMatch = filters.adjustments === 'All Call Limit Adjustments' || filters.adjustments === 'No Adjustments'
      
      return payPeriodMatch && projectMatch && feedbackMatch && adjustmentsMatch
    })
  }, [filters])

  // Calculate metrics based on filtered data
  const metrics = useMemo(() => {
    const totalCalls = filteredRows.length
    const totalEarnings = filteredRows.reduce((sum, row) => sum + row.earningsValue, 0)
    const goodCalls = filteredRows.filter(row => row.quality >= 85).length
    const goodCallRatio = totalCalls > 0 ? Math.round((goodCalls / totalCalls) * 100) : 0

    return {
      totalCalls,
      totalEarnings: totalEarnings.toFixed(2),
      goodCallRatio
    }
  }, [filteredRows])

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
          <div className="px-4 pb-4 sm:pl-8 sm:pr-6">
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
          </div>

          {/* Metrics cards */}
          <div className="px-4 pb-4 sm:pl-8 sm:pr-6 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 relative">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-base sm:text-lg font-semibold text-[#1A1A1A] mb-0">Total calls</div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Number of calls</div>
                <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">{metrics.totalCalls}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 relative">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-base sm:text-lg font-semibold text-[#1A1A1A] mb-0">Total earnings</div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Earnings from all calls</div>
                <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">${metrics.totalEarnings}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 relative">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.60L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <div className="text-base sm:text-lg font-semibold text-[#1A1A1A] mb-0">Good call ratio</div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Percentage of calls with good feedback</div>
                <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">{metrics.goodCallRatio}%</div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="px-4 pb-4 sm:pl-8 sm:pr-6 sm:pb-6">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-0">
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[42%] border-0">Activity</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[10%] border-0">Paid on</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[12%] border-0">End time</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[12%] border-0">Earnings</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[12%] border-0">Duration (min)</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[12%] border-0">Quality (QA)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {/* TODO: Navigate to row details */}}>
                      <td className="py-2.5 px-3 sm:px-6">
                        <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{row.project}</div>
                        <div className="text-gray-500 text-[11px] sm:text-[13px] truncate">{row.question}</div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-6">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-medium ${
                          row.paidOnType === 'pending'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}>
                          {row.paidOn}
                          {row.paidOnType === 'pending' && (
                            <svg className="animate-spin ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-6">
                        <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{row.endTime}</div>
                        <div className="text-gray-500 text-[11px] sm:text-[13px]">{row.endDate}</div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-6">
                        {row.earnings === "Pending" ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-medium bg-gray-100 text-gray-500">
                            Pending
                            <svg className="animate-spin ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        ) : (
                          <>
                            <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{row.earnings}</div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-medium bg-gray-200 text-gray-600 mt-1">
                              {row.hourlyRate}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-6 text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{row.duration}</td>
                      <td className="py-2.5 px-3 sm:px-6">
                        {row.qualityDisplay === "Pending" ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-medium bg-gray-100 text-gray-500">
                            Pending
                            <svg className="animate-spin ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        ) : (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                            <div className="bg-green-500 h-1.5 sm:h-2 rounded-full" style={{width: `${row.quality}%`}}></div>
                          </div>
                        )}
                      </td>
                    </tr>
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