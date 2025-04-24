'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import ExpandedCard from './ExpandedCard'

// Sample check-in dates (we can replace this with real data later)
const checkInDates = [
  { 
    id: '2025-04-21', 
    label: 'April 21, 2025',
    notes: [
      'Reviewed Q1 2025 tax strategy implementation progress',
      'Discussed upcoming changes to state filing requirements',
      'Action items: Schedule follow-up meeting with CPA about new deduction opportunities',
      'Noted potential savings from recent equipment purchases',
      'Updated timeline for Q2 2025 tax planning activities'
    ],
    outline: [
      'Quarterly tax planning review focused on Q1 2025 strategy implementation. Discussed recent changes to state filing requirements and their impact on current tax planning approach. Identified potential savings opportunities from recent equipment purchases. Team aligned on next steps and Q2 planning priorities.'
    ],
    actionItems: [
      { text: 'Schedule CPA meeting by May 1st', timestamp: '10:29' },
      { text: 'Document equipment purchases for tax purposes', timestamp: '10:31' },
      { text: 'Review updated state filing requirements', timestamp: '10:35' },
      { text: 'Prepare Q2 tax planning timeline', timestamp: '10:38' }
    ]
  },
  { 
    id: '2025-01-20', 
    label: 'January 20, 2025',
    notes: [
      'Annual tax planning review completed',
      'Set tax saving goals for 2025',
      'Reviewed new tax law changes affecting the business',
      'Discussed potential restructuring options',
      'Created action plan for implementing new strategies'
    ],
    outline: [
      'Annual tax planning review session. Comprehensive discussion of 2024 outcomes and setting strategic goals for 2025. Reviewed recent tax law changes and their implications for the business. Explored potential restructuring options to optimize tax position.'
    ],
    actionItems: [
      { text: 'Finalize 2025 tax saving targets', timestamp: '11:15' },
      { text: 'Research restructuring requirements', timestamp: '11:18' },
      { text: 'Update tax strategy documentation', timestamp: '11:22' },
      { text: 'Schedule Q1 follow-up meeting', timestamp: '11:25' }
    ]
  },
  { id: '2024-10-15', label: 'October 15, 2024' },
  { id: '2024-07-15', label: 'July 15, 2024' },
  { id: '2024-04-15', label: 'April 15, 2024' },
  { id: '2024-01-15', label: 'January 15, 2024' }
]

// Add dummy attendees data
const attendees = [
  'Sarah Chen (Host)',
  'Michael Rodriguez'
]

// Highlight matching text function
const Highlight = ({ text, search }: { text: string, search: string }) => {
  if (!search) return <>{text}</>
  
  const parts = text.split(new RegExp(`(${search})`, 'gi'))
  
  return (
    <span className="flex-1">
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <span key={i} className="bg-[#FFF4CC] leading-[20px]">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  )
}

const CheckIns = () => {
  const [selectedDate, setSelectedDate] = useState(checkInDates[0].id)
  const [searchText, setSearchText] = useState('')
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const [expandedContent, setExpandedContent] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  // Filter all content based on search text
  const filteredContent = searchText ? checkInDates.map(date => {
    const matchingNotes = (date.notes || [])
      .filter(note => note.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchingOutline = (date.outline || [])
      .filter(text => text.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchingActionItems = (date.actionItems || [])
      .filter(item => item.text.toLowerCase().includes(searchText.toLowerCase()))

    return {
      ...date,
      hasMatches: matchingNotes.length > 0 || matchingOutline.length > 0 || matchingActionItems.length > 0,
      notes: matchingNotes,
      outline: matchingOutline,
      actionItems: matchingActionItems
    }
  }).filter(date => date.hasMatches) : checkInDates

  // Get current date's content
  const currentDate = searchText 
    ? filteredContent.find(d => d.id === selectedDate) || filteredContent[0]
    : checkInDates.find(d => d.id === selectedDate)

  const handleTooltipEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.right + 8,
      y: rect.top + (rect.height / 2)
    })
    setActiveTooltip('attendees')
  }

  const handleTooltipLeave = () => {
    setActiveTooltip(null)
  }

  // Update the handleExpand function
  const handleExpand = (type: 'outline' | 'notes' | 'actionItems', event: React.MouseEvent) => {
    let title = '';
    let content: React.ReactNode = null;

    switch (type) {
      case 'outline':
        title = 'Outline';
        content = currentDate?.outline?.map((text, index) => (
          <p key={index} className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] mb-4">
            <Highlight text={text} search={searchText} />
          </p>
        ));
        break;
      case 'notes':
        title = 'Notes';
        content = (
          <ul className="space-y-3">
            {currentDate?.notes?.map((note, index) => (
              <li key={index} className="flex gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                <span className="text-[#1A1A1A]">•</span>
                <Highlight text={note} search={searchText} />
              </li>
            ))}
          </ul>
        );
        break;
      case 'actionItems':
        title = 'Action items';
        content = (
          <ul className="space-y-2">
            {currentDate?.actionItems?.map((item, index) => (
              <li key={index} className="flex gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                <span className="text-[#1A1A1A]">•</span>
                <span className="flex-1">
                  <span>{item.text} </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Timestamp clicked:', item.timestamp);
                    }}
                    className="inline-block border-b border-dotted border-[#1A1A1A] hover:text-[#646462] hover:border-[#646462] transition-colors"
                  >
                    ({item.timestamp})
                  </button>
                </span>
              </li>
            ))}
          </ul>
        );
        break;
    }

    setExpandedContent({ title, content });
  };

  return (
    <div className="space-y-3">
      {/* Main content grid */}
      <div className="grid grid-cols-[160px_1fr] gap-4">
        {/* Left side with search and dates */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search notes"
              className="w-full h-[32px] pl-8 pr-3 rounded-lg border border-[#E4E4E4] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] placeholder-[#9A9A99] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none transition-colors"
            />
            <Image 
              src="/Vector (4).svg"
              alt="Search"
              width={14}
              height={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
            />
          </div>

          {/* Date tabs - vertical list */}
          <div className="flex flex-col gap-1">
            {searchText && filteredContent.length === 0 ? (
              <div className="px-2 py-1.5 text-[13px] leading-[18px] text-[#646462] font-['Inter']">
                No results found
              </div>
            ) : (
              (searchText ? filteredContent : checkInDates).map((date) => (
                <button
                  key={date.id}
                  onClick={() => setSelectedDate(date.id)}
                  className={`px-2 py-1.5 rounded-md text-[13px] leading-[18px] font-medium font-['Inter'] text-left transition-colors ${
                    selectedDate === date.id
                      ? 'bg-[#EFEFED] text-[#1A1A1A]'
                      : 'text-[#646462] hover:bg-[#EFEFED] hover:text-[#1A1A1A]'
                  }`}
                >
                  {date.label}
                </button>
              ))
            )}
          </div>

          {/* Request meeting button */}
          <button
            onClick={() => {
              toast.success('Your advisor will reach out to schedule a meeting', {
                position: 'bottom-right',
                duration: 4000,
              });
            }}
            className="h-[28px] px-2.5 flex items-center gap-1 rounded-md bg-white border border-[#E4E4E4] text-[13px] leading-[18px] font-medium font-['Inter'] text-[#1A1A1A] hover:bg-[#F7F7F6] transition-colors"
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24"
              className="text-[#1A1A1A]"
            >
              <path 
                fill="currentColor" 
                d="M 11 3 L 11 11 L 3 11 L 3 13 L 11 13 L 11 21 L 13 21 L 13 13 L 21 13 L 21 11 L 13 11 L 13 3 L 11 3 z"
              />
            </svg>
            Request meeting
          </button>
        </div>

        {/* Right side content */}
        {!(searchText && filteredContent.length === 0) && (
          <div className="space-y-3">
            {/* Meeting details header */}
            <div className="flex items-center px-1">
              <Image 
                src="/zoom-svgrepo-com.svg"
                alt="Zoom"
                width={16}
                height={16}
                className="relative top-[1px] mr-2"
              />
              <span className="text-[15px] leading-[22px] font-medium font-['Inter'] text-[#1A1A1A]">
                {currentDate?.label}
              </span>
              <span className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#757573] ml-1">
                •
              </span>
              <span className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#757573] ml-1">
                3:00 PM • 55 mins • <span 
                  className="cursor-help inline-block"
                  onMouseEnter={handleTooltipEnter}
                  onMouseLeave={handleTooltipLeave}
                >{attendees.length} attendees</span>
              </span>

              {/* Attendees tooltip */}
              {activeTooltip === 'attendees' && (
                <div 
                  className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] transition-all duration-200"
                  style={{
                    top: tooltipPosition.y,
                    left: tooltipPosition.x,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <ul className="space-y-1">
                    {attendees.map((attendee, index) => (
                      <li 
                        key={index}
                        className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A]"
                      >
                        {attendee}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Outline card - full width at top */}
            {(!searchText || (currentDate?.outline?.length ?? 0) > 0) && (
              <div className="card border border-[#E4E5E1] rounded-[10px] hover:border-[#E9E9E7] transition-all duration-200 ease-in-out hover:shadow-[0px_2px_8px_rgba(0,0,0,0.08)] relative group bg-white">
                <div className="px-4 pb-0 pt-4">
                  <h2 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#646462]">
                    Outline
                  </h2>
                  {/* Expand button - appears on hover */}
                  <button
                    onClick={(e) => handleExpand('outline', e)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
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
                  </button>
                </div>
                <div className="px-4 pb-4 pt-3">
                  {currentDate?.outline?.map((text, index) => (
                    <p key={index} className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                      <Highlight text={text} search={searchText} />
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Notes and Action items cards side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Notes card */}
              {(!searchText || (currentDate?.notes?.length ?? 0) > 0) && (
                <div className="card border border-[#E4E5E1] rounded-[10px] hover:border-[#E9E9E7] transition-all duration-200 ease-in-out hover:shadow-[0px_2px_8px_rgba(0,0,0,0.08)] relative group bg-white">
                  <div className="px-4 pb-0 pt-4">
                    <h2 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#646462]">
                      Notes
                    </h2>
                    {/* Expand button */}
                    <button
                      onClick={(e) => handleExpand('notes', e)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
                    </button>
                  </div>
                  <div className="px-4 pb-4 pt-3">
                    <ul className="space-y-2">
                      {currentDate?.notes?.map((note, index) => (
                        <li key={index} className="flex gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                          <span className="text-[#1A1A1A]">•</span>
                          <Highlight text={note} search={searchText} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action items card */}
              {(!searchText || (currentDate?.actionItems?.length ?? 0) > 0) && (
                <div className="card border border-[#E4E5E1] rounded-[10px] hover:border-[#E9E9E7] transition-all duration-200 ease-in-out hover:shadow-[0px_2px_8px_rgba(0,0,0,0.08)] relative group bg-white">
                  <div className="px-4 pb-0 pt-4">
                    <h2 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#646462]">
                      Action items
                    </h2>
                    {/* Expand button */}
                    <button
                      onClick={(e) => handleExpand('actionItems', e)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
                    </button>
                  </div>
                  <div className="px-4 pb-4 pt-3">
                    <ul className="space-y-2">
                      {currentDate?.actionItems?.map((item, index) => (
                        <li key={index} className="flex gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                          <span className="text-[#1A1A1A]">•</span>
                          <span className="flex-1">
                            <span>{item.text} </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Timestamp clicked:', item.timestamp);
                              }}
                              className="inline-block border-b border-dotted border-[#1A1A1A] hover:text-[#646462] hover:border-[#646462] transition-colors"
                            >
                              ({item.timestamp})
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add this at the end */}
      {expandedContent && (
        <ExpandedCard
          isOpen={!!expandedContent}
          onClose={() => {
            setExpandedContent(null);
          }}
          title={expandedContent.title}
          content={expandedContent.content}
        />
      )}
    </div>
  )
}

export default CheckIns 