'use client'
import { useState } from 'react'
import { useBusinessDetails } from '@/contexts/BusinessDetailsContext'

const PlanSettings = () => {
  // State for form fields
  const [estimatedRevenue, setEstimatedRevenue] = useState('')
  const [estimatedExpenses, setEstimatedExpenses] = useState('')
  const [numberOfEmployees, setNumberOfEmployees] = useState('')
  
  // Get business details with loading state
  const { businessDetails, isLoading } = useBusinessDetails()
  
  // Add debug logging
  console.log('Business Details:', businessDetails)
  console.log('Loading:', isLoading)

  // Add tooltip states
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Add tooltip handlers
  const handleTooltipEnter = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top
    })
    setActiveTooltip(index)
  }

  const handleTooltipLeave = () => {
    setActiveTooltip(null)
  }

  // Update input classes to use oracle font
  const inputClasses = "w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Business settings card */}
      <div className="bg-white rounded-[14px] overflow-hidden">
        {/* Subheader */}
        <div className="px-6 py-4">
          <h2 className="text-[15px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
            Business settings
          </h2>
        </div>
        <div className="border-b border-[#E4E5E1]" />
        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
            Content goes here
          </p>
        </div>
      </div>

      {/* Assumptions card */}
      <div className="bg-white rounded-[14px] overflow-hidden">
        {/* Subheader */}
        <div className="px-6 py-4">
          <h2 className="text-[15px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
            Assumptions
          </h2>
        </div>
        <div className="border-b border-[#E4E5E1]" />
        {/* Form fields */}
        <div className="px-6 py-4 space-y-6">
          {/* Estimated Revenue and Expenses Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Estimated Revenue */}
            <div>
              <label 
                htmlFor="estimatedRevenue"
                className="flex items-center gap-1 mb-1"
              >
                <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                  Estimated revenue
                </span>
                <div 
                  className="relative"
                  onMouseEnter={(e) => handleTooltipEnter(e, 1)}
                  onMouseLeave={handleTooltipLeave}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24"
                    className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                  >
                    <path 
                      fill="currentColor"
                      d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                    />
                  </svg>
                  
                  {activeTooltip === 1 && (
                    <div 
                      className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                      style={{
                        top: tooltipPosition.y - 8,
                        left: tooltipPosition.x,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                        The business's estimated annual revenue for tax planning purposes
                      </p>
                    </div>
                  )}
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646462]">$</span>
                <input
                  id="estimatedRevenue"
                  type="text"
                  value={estimatedRevenue}
                  readOnly
                  className={`${inputClasses} pl-7 bg-[#F7F7F6] cursor-not-allowed`}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Estimated Expenses */}
            <div>
              <label 
                htmlFor="estimatedExpenses"
                className="flex items-center gap-1 mb-1"
              >
                <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                  Estimated expenses
                </span>
                <div 
                  className="relative"
                  onMouseEnter={(e) => handleTooltipEnter(e, 2)}
                  onMouseLeave={handleTooltipLeave}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24"
                    className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                  >
                    <path 
                      fill="currentColor"
                      d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                    />
                  </svg>
                  
                  {activeTooltip === 2 && (
                    <div 
                      className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                      style={{
                        top: tooltipPosition.y - 8,
                        left: tooltipPosition.x,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                        The business's estimated annual expenses
                      </p>
                    </div>
                  )}
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#646462]">$</span>
                <input
                  id="estimatedExpenses"
                  type="text"
                  value={estimatedExpenses}
                  readOnly
                  className={`${inputClasses} pl-7 bg-[#F7F7F6] cursor-not-allowed`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Entity Type */}
          <div>
            <label 
              htmlFor="entityType"
              className="flex items-center gap-1 mb-1"
            >
              <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                Entity type
              </span>
              <div 
                className="relative"
                onMouseEnter={(e) => handleTooltipEnter(e, 3)}
                onMouseLeave={handleTooltipLeave}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24"
                  className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                >
                  <path 
                    fill="currentColor"
                    d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                  />
                </svg>
                
                {activeTooltip === 3 && (
                  <div 
                    className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                    style={{
                      top: tooltipPosition.y - 8,
                      left: tooltipPosition.x,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                      Your business's legal structure. To change this, update your business details in settings.
                    </p>
                  </div>
                )}
              </div>
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-help"
                onMouseEnter={(e) => handleTooltipEnter(e, 4)}
                onMouseLeave={handleTooltipLeave}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24"
                  className="text-[#646462]"
                >
                  <path 
                    fill="currentColor"
                    d="M 12 1 C 8.701247 1 6 3.701247 6 7 L 6 8 L 5.5 8 C 4.1336715 8 3 9.1336715 3 10.5 L 3 18.5 C 3 19.866329 4.1336715 21 5.5 21 L 18.5 21 C 19.866329 21 21 19.866329 21 18.5 L 21 10.5 C 21 9.1336715 19.866329 8 18.5 8 L 18 8 L 18 7 C 18 3.701247 15.298753 1 12 1 z M 12 3.5 C 13.947247 3.5 15.5 5.052753 15.5 7 L 15.5 8 L 8.5 8 L 8.5 7 C 8.5 5.052753 10.052753 3.5 12 3.5 z M 5.5 10.5 L 18.5 10.5 L 18.5 18.5 L 5.5 18.5 L 5.5 10.5 z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={businessDetails?.entity_type || 'Not set'}
                readOnly
                className={`${inputClasses} pl-8 bg-[#F7F7F6] cursor-not-allowed`}
              />
              {activeTooltip === 4 && (
                <div 
                  className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                  style={{
                    top: tooltipPosition.y - 8,
                    left: tooltipPosition.x,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                    This field is inferred from your business details in Settings
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Filing State */}
          <div>
            <label 
              htmlFor="filingState"
              className="flex items-center gap-1 mb-1"
            >
              <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                Filing state
              </span>
              <div 
                className="relative"
                onMouseEnter={(e) => handleTooltipEnter(e, 6)}
                onMouseLeave={handleTooltipLeave}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24"
                  className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                >
                  <path 
                    fill="currentColor"
                    d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                  />
                </svg>
                
                {activeTooltip === 6 && (
                  <div 
                    className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                    style={{
                      top: tooltipPosition.y - 8,
                      left: tooltipPosition.x,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                      The business's state for tax filing purposes
                    </p>
                  </div>
                )}
              </div>
            </label>
            <div className="relative">
              <select
                value="California"
                disabled
                className={`${inputClasses} appearance-none bg-[#F7F7F6] cursor-not-allowed pr-10`}
              >
                <option value="California">California</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#646462]">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Number of Employees */}
          <div>
            <label 
              htmlFor="numberOfEmployees"
              className="flex items-center gap-1 mb-1"
            >
              <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                Number of employees
              </span>
              <div 
                className="relative"
                onMouseEnter={(e) => handleTooltipEnter(e, 5)}
                onMouseLeave={handleTooltipLeave}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24"
                  className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                >
                  <path 
                    fill="currentColor"
                    d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                  />
                </svg>
                
                {activeTooltip === 5 && (
                  <div 
                    className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                    style={{
                      top: tooltipPosition.y - 8,
                      left: tooltipPosition.x,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                      The business's total number of W2 employees and 1099 contractors
                    </p>
                  </div>
                )}
              </div>
            </label>
            <div className="relative">
              <input
                id="numberOfEmployees"
                type="text"
                value={numberOfEmployees}
                readOnly
                className={`${inputClasses} bg-[#F7F7F6] cursor-not-allowed`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Fiscal Period */}
          <div>
            <label 
              htmlFor="fiscalPeriod"
              className="flex items-center gap-1 mb-1"
            >
              <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                Fiscal period
              </span>
              <div 
                className="relative"
                onMouseEnter={(e) => handleTooltipEnter(e, 8)}
                onMouseLeave={handleTooltipLeave}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24"
                  className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                >
                  <path 
                    fill="currentColor"
                    d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                  />
                </svg>
                
                {activeTooltip === 8 && (
                  <div 
                    className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                    style={{
                      top: tooltipPosition.y - 8,
                      left: tooltipPosition.x,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                      The business's fiscal year period for tax purposes
                    </p>
                  </div>
                )}
              </div>
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-help"
                onMouseEnter={(e) => handleTooltipEnter(e, 9)}
                onMouseLeave={handleTooltipLeave}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24"
                  className="text-[#646462]"
                >
                  <path 
                    fill="currentColor"
                    d="M 12 1 C 8.701247 1 6 3.701247 6 7 L 6 8 L 5.5 8 C 4.1336715 8 3 9.1336715 3 10.5 L 3 18.5 C 3 19.866329 4.1336715 21 5.5 21 L 18.5 21 C 19.866329 21 21 19.866329 21 18.5 L 21 10.5 C 21 9.1336715 19.866329 8 18.5 8 L 18 8 L 18 7 C 18 3.701247 15.298753 1 12 1 z M 12 3.5 C 13.947247 3.5 15.5 5.052753 15.5 7 L 15.5 8 L 8.5 8 L 8.5 7 C 8.5 5.052753 10.052753 3.5 12 3.5 z M 5.5 10.5 L 18.5 10.5 L 18.5 18.5 L 5.5 18.5 L 5.5 10.5 z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={businessDetails?.fiscal_period || 'Not set'}
                readOnly
                className={`${inputClasses} pl-8 bg-[#F7F7F6] cursor-not-allowed`}
              />
              {activeTooltip === 9 && (
                <div 
                  className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                  style={{
                    top: tooltipPosition.y - 8,
                    left: tooltipPosition.x,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                    This field is inferred from your business details in Settings
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanSettings 