'use client'
import { useState } from 'react'

type DocumentRequestsBannerProps = {
  requestCount: number
  message?: string
  variant?: 'warning' | 'default'
  dismissable?: boolean
}

export default function DocumentRequestsBanner({ 
  requestCount, 
  message,
  variant = 'default',
  dismissable = true
}: DocumentRequestsBannerProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  if (!isVisible) return null
  if (!message && requestCount === 0) return null

  const bgColor = variant === 'warning' ? 'bg-[#FEFBED]' : 'bg-[#FEFBED]'
  const borderColor = variant === 'warning' ? 'border-[#E9A23B]' : 'border-[#E9A23B]'
  const icon = variant === 'warning' ? (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="14" 
      height="14" 
      viewBox="0 0 24 24"
      className="text-[#222222]"
    >
      <path 
        fill="currentColor" 
        d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.984375 5.9863281 A 1.0001 1.0001 0 0 0 11 7 L 11 13 A 1.0001 1.0001 0 1 0 13 13 L 13 7 A 1.0001 1.0001 0 0 0 11.984375 5.9863281 z M 12 16 A 1 1 0 0 0 12 18 A 1 1 0 0 0 12 16 z"
      />
    </svg>
  ) : (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="14" 
      height="14" 
      viewBox="0 0 24 24"
      className="text-[#222222]"
    >
      <path 
        fill="currentColor" 
        d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.984375 5.9863281 A 1.0001 1.0001 0 0 0 11 7 L 11 13 A 1.0001 1.0001 0 1 0 13 13 L 13 7 A 1.0001 1.0001 0 0 0 11.984375 5.9863281 z M 12 16 A 1 1 0 0 0 12 18 A 1 1 0 0 0 12 16 z"
      />
    </svg>
  )

  return (
    <div 
      className={`transform transition-all duration-300 ease-out mb-3
        ${isClosing ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}
    >
      <div className={`${bgColor} border ${borderColor} rounded-lg px-3 h-[36px] flex items-center relative`}>
        {dismissable && (
          <button 
            className="absolute top-1/2 -translate-y-1/2 right-2.5 p-1 rounded-lg hover:bg-[#FFE4CA] transition-colors"
            onClick={handleDismiss}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24"
              className="text-[#222222]"
            >
              <path 
                fill="currentColor"
                d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"
              />
            </svg>
          </button>
        )}
        <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#222222] flex items-center gap-1.5">
          {icon}
          {message || `You have ${requestCount} document ${requestCount === 1 ? 'request' : 'requests'} needing your attention`}
        </p>
      </div>
    </div>
  )
} 