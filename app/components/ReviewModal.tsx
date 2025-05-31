'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onReview: () => void
  content: string
}

export default function ReviewModal({ isOpen, onClose, onReview, content }: ReviewModalProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())

  // Dummy transaction data
  const transactions = [
    { 
      id: '1', 
      date: '2024-03-15', 
      description: 'AMAZON.COM*M23RK0LL2',
      amount: 129.99
    },
    { 
      id: '2', 
      date: '2024-03-14', 
      description: 'UBER TRIP 23XY4',
      amount: 24.50
    },
    { 
      id: '3', 
      date: '2024-03-14', 
      description: 'STAPLES #1234',
      amount: 85.75
    },
    { 
      id: '4', 
      date: '2024-03-14', 
      description: 'MICROSOFT*AZURE',
      amount: 299.99
    },
    { 
      id: '5', 
      date: '2024-03-13', 
      description: 'DOORDASH*LUNCH MEETING',
      amount: 142.50
    },
    { 
      id: '6', 
      date: '2024-03-13', 
      description: 'DELTA AIR 0123456789',
      amount: 542.80
    }
  ]

  // Add effect to handle loading state
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Add loading state UI for the table
  const LoadingTable = () => (
    <div className="divide-y divide-[#E4E5E1] max-h-[368px] overflow-y-auto">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i}
          className="grid grid-cols-[160px_2fr_120px_160px_40px] gap-4 h-[42px] items-center px-4"
        >
          <div className="h-[20px] bg-[#F7F7F6] rounded animate-pulse" />
          <div className="h-[20px] bg-[#F7F7F6] rounded animate-pulse" />
          <div className="h-[20px] bg-[#F7F7F6] rounded animate-pulse" />
          <div className="h-[28px] bg-[#F7F7F6] rounded animate-pulse" />
          <div className="h-[20px] w-[16px] bg-[#F7F7F6] rounded animate-pulse" />
        </div>
      ))}
    </div>
  )

  if (!isOpen) return null

  const handleReview = () => {
    setIsReviewing(true)
    setTimeout(() => {
      setIsReviewing(false)
      onReview()
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[874px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Input required
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24"
              className="text-[#1A1A1A]"
            >
              <path 
                fill="currentColor"
                d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none mb-3">
          {content}
        </div>

        {/* Transactions Table Card */}
        <div className="border border-[#E4E5E1] rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[160px_2fr_120px_160px_40px] gap-4 py-1.5 border-b border-[#E4E5E1] px-4 bg-white/80">
            <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Date</div>
            <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Description</div>
            <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Amount</div>
            <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Category</div>
            <div></div>
          </div>

          {/* Conditional rendering based on loading state */}
          {isLoading ? (
            <LoadingTable />
          ) : (
            <div className="divide-y divide-[#E4E5E1] max-h-[368px] overflow-y-auto">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="grid grid-cols-[160px_2fr_120px_160px_40px] gap-4 h-[42px] items-center px-4 hover:bg-[#F7F7F6] transition-colors"
                >
                  <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] truncate">
                    {transaction.description}
                  </div>
                  <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                    ${transaction.amount.toFixed(2)}
                  </div>
                  <div className="text-[14px] leading-[20px] font-normal font-oracle relative">
                    <select 
                      className="w-full h-[28px] px-2 pr-8 rounded-md border border-[#E4E5E1] bg-white text-[14px] leading-[20px] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none appearance-none"
                      defaultValue=""
                    >
                      <option value="" disabled>Select category</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Travel">Travel</option>
                      <option value="Meals">Meals</option>
                      <option value="Software">Software</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <path 
                          d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      className="text-[#646462] hover:text-[#1A1A1A] transition-colors"
                      onClick={() => {/* TODO: Show source document */}}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24"
                        className="fill-current"
                      >
                        <path d="M13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleReview}
            disabled={isReviewing}
            className="bg-[#1A1A1A] text-white px-4 h-[32px] rounded-full font-oracle font-medium text-[14px] leading-[20px] hover:bg-[#333333] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isReviewing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reviewing...
              </>
            ) : (
              'Reviewed'
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 