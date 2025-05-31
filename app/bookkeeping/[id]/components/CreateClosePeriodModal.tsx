'use client'
import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ClosePeriod } from '../../types'

interface CreateClosePeriodModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess: (newPeriod: ClosePeriod) => void
  engagementId: string
}

export default function CreateClosePeriodModal({ 
  isOpen, 
  onClose, 
  onCreateSuccess,
  engagementId 
}: CreateClosePeriodModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3))
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false)
  const formatDropdownRef = useRef<HTMLDivElement>(null)
  const yearDropdownRef = useRef<HTMLDivElement>(null)
  const monthDropdownRef = useRef<HTMLDivElement>(null)
  const quarterDropdownRef = useRef<HTMLDivElement>(null)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isQuarterDropdownOpen, setIsQuarterDropdownOpen] = useState(false)

  const periodFormats = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'yearly', label: 'Yearly' }
  ] as const

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const quarters = [
    { id: 1, label: 'Q1' },
    { id: 2, label: 'Q2' },
    { id: 3, label: 'Q3' },
    { id: 4, label: 'Q4' }
  ]

  // Handle click outside for format dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target as Node)) {
        setIsFormatDropdownOpen(false)
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false)
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false)
      }
      if (quarterDropdownRef.current && !quarterDropdownRef.current.contains(event.target as Node)) {
        setIsQuarterDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const resetForm = () => {
    setSelectedFormat('monthly')
    setSelectedYear(new Date().getFullYear())
    setSelectedMonth(new Date().getMonth() + 1)
    setSelectedQuarter(Math.floor((new Date().getMonth() + 3) / 3))
    setIsFormatDropdownOpen(false)
    setIsYearDropdownOpen(false)
    setIsMonthDropdownOpen(false)
    setIsQuarterDropdownOpen(false)
  }

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('bookkeeping_engagement_close_periods')
        .insert({
          engagement_id: engagementId,
          period_format: selectedFormat,
          period_year: selectedYear,
          ...(selectedFormat === 'monthly' && { period_month: selectedMonth }),
          ...(selectedFormat === 'quarterly' && { period_quarter: selectedQuarter }),
          status: 'incomplete'
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Close period created successfully')
      onCreateSuccess(data)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating close period:', error)
      toast.error('Failed to create close period')
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog 
        onClose={() => {
          resetForm()
          onClose()
        }} 
        className="relative z-50"
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px]" />
        </Transition.Child>

        {/* Modal */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-[22px] leading-[26px] font-medium font-oracle text-[#1A1A1A]">
                  New close period
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F6F6] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Period Format Dropdown */}
                <div>
                  <label className="block text-[14px] leading-[20px] font-oracle text-[#4B5563] mb-1.5">
                    Period format
                  </label>
                  <div className="relative" ref={formatDropdownRef}>
                    <button
                      onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                    >
                      <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                        {periodFormats.find(f => f.id === selectedFormat)?.label}
                      </span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform ${isFormatDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {isFormatDropdownOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1 z-50">
                        <div className="max-h-[200px] overflow-y-auto">
                          {periodFormats.map((format) => (
                            <button
                              key={format.id}
                              onClick={() => {
                                setSelectedFormat(format.id)
                                setIsFormatDropdownOpen(false)
                              }}
                              className={`w-full px-3 py-2 flex items-center rounded-lg hover:bg-[#F3F6F6] transition-colors ${
                                selectedFormat === format.id ? 'bg-[#F3F6F6]' : ''
                              }`}
                            >
                              <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                {format.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Year Selection */}
                <div>
                  <label className="block text-[14px] leading-[20px] font-oracle text-[#4B5563] mb-1.5">
                    Year
                  </label>
                  <div className="relative" ref={yearDropdownRef}>
                    <button
                      onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                    >
                      <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                        {selectedYear}
                      </span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {isYearDropdownOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1 z-50">
                        <div className="max-h-[200px] overflow-y-auto">
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                            <button
                              key={year}
                              onClick={() => {
                                setSelectedYear(year)
                                setIsYearDropdownOpen(false)
                              }}
                              className={`w-full px-3 py-2 flex items-center rounded-lg hover:bg-[#F3F6F6] transition-colors ${
                                selectedYear === year ? 'bg-[#F3F6F6]' : ''
                              }`}
                            >
                              <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                {year}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Month/Quarter Selection based on format */}
                {selectedFormat === 'monthly' && (
                  <div>
                    <label className="block text-[14px] leading-[20px] font-oracle text-[#4B5563] mb-1.5">
                      Month
                    </label>
                    <div className="relative" ref={monthDropdownRef}>
                      <button
                        onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                        className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                      >
                        <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                          {months[selectedMonth - 1]}
                        </span>
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className={`transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {isMonthDropdownOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1 z-50">
                          <div className="max-h-[200px] overflow-y-auto">
                            {months.map((month, index) => (
                              <button
                                key={month}
                                onClick={() => {
                                  setSelectedMonth(index + 1)
                                  setIsMonthDropdownOpen(false)
                                }}
                                className={`w-full px-3 py-2 flex items-center rounded-lg hover:bg-[#F3F6F6] transition-colors ${
                                  selectedMonth === index + 1 ? 'bg-[#F3F6F6]' : ''
                                }`}
                              >
                                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                  {month}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedFormat === 'quarterly' && (
                  <div>
                    <label className="block text-[14px] leading-[20px] font-oracle text-[#4B5563] mb-1.5">
                      Quarter
                    </label>
                    <div className="relative" ref={quarterDropdownRef}>
                      <button
                        onClick={() => setIsQuarterDropdownOpen(!isQuarterDropdownOpen)}
                        className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                      >
                        <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                          {quarters.find(q => q.id === selectedQuarter)?.label}
                        </span>
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className={`transition-transform ${isQuarterDropdownOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {isQuarterDropdownOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1 z-50">
                          <div className="max-h-[200px] overflow-y-auto">
                            {quarters.map(quarter => (
                              <button
                                key={quarter.id}
                                onClick={() => {
                                  setSelectedQuarter(quarter.id)
                                  setIsQuarterDropdownOpen(false)
                                }}
                                className={`w-full px-3 py-2 flex items-center rounded-lg hover:bg-[#F3F6F6] transition-colors ${
                                  selectedQuarter === quarter.id ? 'bg-[#F3F6F6]' : ''
                                }`}
                              >
                                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                  {quarter.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetForm()
                    onClose()
                  }}
                  className="px-3 h-8 rounded-lg text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] hover:bg-[#F3F6F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors border border-[#344D7A]"
                >
                  Create period
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
} 