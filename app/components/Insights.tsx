'use client'
import { useState, useRef } from 'react'

interface InsightProps {
  title: string
  amount: string
  description: string
  tooltip?: string
}

export default function Insights() {
  const [showGradient, setShowGradient] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      const isEnd = container.scrollWidth - container.scrollLeft === container.clientWidth
      setShowGradient(!isEnd)
    }
  }

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

  const insights: InsightProps[] = [
    {
      title: "R&D Tax Credit",
      amount: "$22,500",
      description: "Potential credit based on your R&D activities in 2023",
      tooltip: "Based on your qualifying research activities and documentation"
    },
    {
      title: "Employee Retention",
      amount: "$15,750",
      description: "Available credit for maintaining workforce in Q1 2024",
      tooltip: "Calculated from your quarterly payroll and employee count"
    },
    {
      title: "Solar Investment",
      amount: "$8,400",
      description: "Estimated savings from clean energy initiatives",
      tooltip: "Based on proposed solar installation project"
    },
    {
      title: "Work Opportunity",
      amount: "$5,600",
      description: "Credit for hiring from target groups in 2023",
      tooltip: "Available for qualified veteran and SNAP recipient hires"
    },
    {
      title: "State Incentives",
      amount: "$12,300",
      description: "Local tax incentives for business expansion"
    }
  ]

  return (
    <div>
      {/* Commented out header and AI tag
      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] mb-4 flex items-center gap-1">
        Insights
        <div className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help relative group">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
            <path d="M16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z" />
          </svg>
          AI
          
          <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
            <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
              <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                <p>These insights were automatically generated from your financial data using AI.</p>
              </div>
            </div>
          </div>
        </div>
      </h2>
      */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto pb-3"
        >
          <div className="flex gap-3 min-w-min">
            {insights.map((insight, index) => (
              <button
                key={index}
                onClick={() => console.log(`Clicked insight ${index}`)}
                className="border border-[#E4E5E1] rounded-[10px] p-4 hover:border-[#E9E9E7] 
                  transition-all duration-200 ease-in-out
                  hover:shadow-[0px_2px_8px_rgba(0,0,0,0.08)]
                  text-left relative group
                  w-[260px] flex-none
                  bg-white"
              >
                {/* Expand button - appears on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 bg-[#F7F7F6] rounded-lg hover:bg-[#EFEFED] transition-colors">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24"
                      className="text-[#1A1A1A]"
                    >
                      <path 
                        fill="currentColor"
                        d="M 3.9902344 2.9902344 A 1.0001 1.0001 0 0 0 3 4.1308594 L 3 9.0703125 A 1.0001 1.0001 0 1 0 5 9.0703125 L 5 6.4140625 L 8.2929688 9.7070312 A 1.0001 1.0001 0 1 0 9.7070312 8.2929688 L 6.4140625 5 L 9.0703125 5 A 1.0001 1.0001 0 1 0 9.0703125 3 L 4.1269531 3 A 1.0001 1.0001 0 0 0 3.9902344 2.9902344 z M 19.980469 2.9902344 A 1.0001 1.0001 0 0 0 19.869141 3 L 14.929688 3 A 1.0001 1.0001 0 1 0 14.929688 5 L 17.585938 5 L 14.292969 8.2929688 A 1.0001 1.0001 0 1 0 15.707031 9.7070312 L 19 6.4140625 L 19 9.0703125 A 1.0001 1.0001 0 1 0 21 9.0703125 L 21 4.1269531 A 1.0001 1.0001 0 0 0 19.980469 2.9902344 z M 3.984375 13.914062 A 1.0001 1.0001 0 0 0 3 14.929688 L 3 19.873047 A 1.0001 1.0001 0 0 0 4.1308594 21 L 9.0703125 21 A 1.0001 1.0001 0 1 0 9.0703125 19 L 6.4140625 19 L 9.7070312 15.707031 A 1.0001 1.0001 0 1 0 8.2929688 14.292969 L 5 17.585938 L 5 14.929688 A 1.0001 1.0001 0 0 0 3.984375 13.914062 z M 19.984375 13.914062 A 1.0001 1.0001 0 0 0 19 14.929688 L 19 17.585938 L 15.707031 14.292969 A 1.0001 1.0001 0 1 0 14.292969 15.707031 L 17.585938 19 L 14.929688 19 A 1.0001 1.0001 0 1 0 14.929688 21 L 19.873047 21 A 1.0001 1.0001 0 0 0 21 19.869141 L 21 14.929688 A 1.0001 1.0001 0 0 0 19.984375 13.914062 z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-1">
                  <h3 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                    {insight.title}
                  </h3>
                  {insight.tooltip && (
                    <div 
                      className="relative"
                      onMouseEnter={(e) => handleTooltipEnter(e, index)}
                      onMouseLeave={handleTooltipLeave}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24"
                        className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                      >
                        <path 
                          fill="currentColor"
                          d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                        />
                      </svg>
                      
                      {activeTooltip === index && (
                        <div 
                          className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-3 w-[240px] transition-all duration-200"
                          style={{
                            top: tooltipPosition.y - 8,
                            left: tooltipPosition.x,
                            transform: 'translate(-50%, -100%)'
                          }}
                        >
                          <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] whitespace-normal">
                            {insight.tooltip}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-[18px] leading-[24px] font-medium font-['Inter'] text-[#1A1A1A] mb-2">
                  {insight.amount}
                </p>
                <p className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#646462]">
                  {insight.description}
                </p>
              </button>
            ))}
          </div>
        </div>
        {showGradient && (
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  )
} 