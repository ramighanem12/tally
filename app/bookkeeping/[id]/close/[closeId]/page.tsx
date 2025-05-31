'use client'
import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import SOPWorkflowCard from '../../components/SOPWorkflowCard'
import ChatInputArea from '../../components/ChatInputArea'
import ChatMessage from '../../components/ChatMessage'
import ActionPlanCard from '../../components/ActionPlanCard'
import FilesPanel from '../../components/FilesPanel'
import { useFileUpload } from '../../hooks/useFileUpload'
import FileUploadOverlay from '../../components/FileUploadOverlay'
import CopilotNavigation from '../../../../components/CopilotNavigation'
import BookkeepingLayout from '../../components/BookkeepingLayout'

type Message = {
  text: string
  isUser: boolean
}

type TimelineItem = {
  type: 'message' | 'sop' | 'action-plan'  
  content: Message | boolean 
  timestamp: number
}

interface ClosePeriodDetails {
  id: string
  period_format: 'monthly' | 'quarterly' | 'yearly'
  period_month?: number
  period_quarter?: number
  period_year: number
  status: 'incomplete' | 'complete'
}

// Add formatPeriod function
function formatPeriod(period: ClosePeriodDetails): string {
  switch (period.period_format) {
    case 'monthly':
      return format(new Date(period.period_year, period.period_month! - 1), 'MMMM yyyy')
    case 'quarterly':
      return `Q${period.period_quarter} ${period.period_year}`
    case 'yearly':
      return period.period_year.toString()
  }
}

const LoadingContent = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#41629E] border-t-transparent" />
  </div>
)

// Create a wrapper component for the content
function CloseDetailContent() {
  const params = useParams()
  const router = useRouter()
  const engagementId = params.id as string
  const closeId = params.closeId as string
  const [closePeriod, setClosePeriod] = useState<ClosePeriodDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isWorkflowDropdownOpen, setIsWorkflowDropdownOpen] = useState(false)
  const [isDebugDropdownOpen, setIsDebugDropdownOpen] = useState(false)
  const [isFilesPanelOpen, setIsFilesPanelOpen] = useState(false)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Add the useFileUpload hook
  const { uploadState, handlers } = useFileUpload()

  // Add effect to refresh on URL change
  useEffect(() => {
    console.log('URL changed, refreshing...')
    router.refresh()
  }, [closeId, router])

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [closeId])

  // Load data when closeId changes
  useEffect(() => {
    console.log('Loading data for closeId:', closeId)
    const loadData = async () => {
      setLoading(true)
      setIsInitialLoading(true)
      setTimeline([])
      try {
        console.log('Fetching period data...')
        const { data, error } = await supabase
          .from('bookkeeping_engagement_close_periods')
          .select('*')
          .eq('id', closeId)
          .single()

        if (error) throw error
        console.log('Received period data:', data)
        setClosePeriod(data)
      } catch (error) {
        console.error('Error loading close period:', error)
        toast.error('Failed to load close period details')
        setClosePeriod(null)
      } finally {
        setLoading(false)
        setIsInitialLoading(false)
      }
    }

    loadData()
  }, [closeId])

  // Add a debug effect to monitor closePeriod changes
  useEffect(() => {
    console.log('closePeriod changed:', closePeriod)
  }, [closePeriod])

  // Update message handler to add to timeline
  const handleSendMessage = (message: string) => {
    setTimeline(prev => [...prev, {
      type: 'message',
      content: { text: message, isUser: true },
      timestamp: Date.now()
    }])
    
    // Simulate AI response with multiple sentences
    setTimeout(() => {
      setTimeline(prev => [...prev, {
        type: 'message',
        content: { 
          text: "I understand you're looking for help with the financial analysis. Let me break this down for you. First, I'll review the current statements and identify any inconsistencies. Then we can proceed with organizing the data in a structured format.",
          isUser: false 
        },
        timestamp: Date.now()
      }])
    }, 1000)
  }

  // Update SOP handler
  const handleSOPClick = () => {
    setTimeline(prev => [...prev, {
      type: 'sop',
      content: true,
      timestamp: Date.now()
    }])
    setIsWorkflowDropdownOpen(false)
  }

  // Update the click handler for the action plan button
  const handleActionPlanClick = () => {
    setTimeline(prev => [...prev, {
      type: 'action-plan',
      content: true,
      timestamp: Date.now()
    }])
    setIsDebugDropdownOpen(false)
  }

  const handleRequestAdjustments = useCallback(() => {
    setTimeline(prev => [...prev, {
      type: 'message',
      content: {
        text: "I understand you'd like to make adjustments to the proposed plan. Please let me know what specific changes you'd like to make and I'll revise the plan accordingly.",
        isUser: false
      },
      timestamp: Date.now()
    }]);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header skeleton */}
          <div className="px-4 py-3 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-[22px] w-32 bg-[#F3F6F6] rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[85px] h-8 bg-[#F3F6F6] rounded-lg animate-pulse" />
                <div className="w-[85px] h-8 bg-[#F3F6F6] rounded-lg animate-pulse" />
                <div className="w-[130px] h-8 bg-[#F3F6F6] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content area skeleton */}
          <div className="flex-1 relative flex flex-col h-full">
            <div className="absolute inset-0 overflow-y-auto">
              <div className="px-4 pt-4 pb-[160px]">
                {/* Empty state for chat */}
                <div className="flex flex-col gap-4">
                  <div className="w-2/3 h-[60px] bg-[#F3F6F6] rounded-lg animate-pulse" />
                  <div className="w-1/2 h-[40px] bg-[#F3F6F6] rounded-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* Input area skeleton */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <div className="h-[20px] bg-gradient-to-t from-white via-white to-transparent" />
              <div className="bg-white px-4 pb-2">
                {/* Button container skeleton */}
                <div className="flex justify-between mb-2">
                  <div className="flex gap-2">
                    <div className="w-[90px] h-8 bg-[#F3F6F6] rounded-lg animate-pulse" />
                    <div className="w-[120px] h-8 bg-[#F3F6F6] rounded-lg animate-pulse" />
                  </div>
                  <div className="w-[70px] h-8 bg-[#F3F6F6] rounded-lg animate-pulse" />
                </div>
                {/* Textarea skeleton */}
                <div className="w-full h-[76px] bg-[#F3F6F6] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Right Header */}
        <div className="px-4 py-3 border-b border-[#E4E5E1] flex-none">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A]">
                {closePeriod && formatPeriod(closePeriod)}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFilesPanelOpen(true)}
                className="px-3 h-8 bg-[#F3F6F6] hover:bg-[#EBEEED] text-[#1A1A1A] rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-1.5 border border-[#E4E5E1]"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  x="0px" 
                  y="0px" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24"
                  className="text-[#1A1A1A]"
                >
                  <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" />
                </svg>
                Files
              </button>
              
              {/* Debug dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDebugDropdownOpen(!isDebugDropdownOpen)}
                  className="debug-dropdown-trigger px-3 h-8 bg-[#F3F6F6] hover:bg-[#EBEEED] text-[#1A1A1A] rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#E4E5E1]"
                >
                  Debug
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-200 ${isDebugDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div 
                  className={`debug-dropdown-menu absolute right-0 mt-1 w-[250px] bg-white rounded-lg border border-[#E4E5E1] p-1 z-10
                    transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-top-right
                    ${isDebugDropdownOpen 
                      ? 'opacity-100 scale-100 shadow-lg' 
                      : 'opacity-0 scale-95 shadow-none pointer-events-none'
                    }`}
                >
                  <button 
                    onClick={handleActionPlanClick}
                    className="w-full px-2.5 py-1.5 text-left text-[14px] leading-[20px] font-oracle text-[#1A1A1A] hover:bg-[#F3F6F6] rounded-md transition-colors"
                  >
                    Trigger action plan
                  </button>
                </div>
              </div>

              {/* Workflow dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsWorkflowDropdownOpen(!isWorkflowDropdownOpen)}
                  className="workflow-dropdown-trigger px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A]"
                >
                  Run workflow
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-200 ${isWorkflowDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div 
                  className={`workflow-dropdown-menu absolute right-0 mt-1 w-[250px] bg-white rounded-lg border border-[#E4E5E1] p-1 z-10
                    transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-top-right
                    ${isWorkflowDropdownOpen 
                      ? 'opacity-100 scale-100 shadow-lg' 
                      : 'opacity-0 scale-95 shadow-none pointer-events-none'
                    }`}
                >
                  <button 
                    onClick={handleSOPClick}
                    className="w-full px-2.5 py-1.5 text-left text-[14px] leading-[20px] font-oracle text-[#1A1A1A] hover:bg-[#F3F6F6] rounded-md transition-colors"
                  >
                    SOP Custom - Count on Finance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 relative flex flex-col h-full">
          {/* Timeline content - scrollable */}
          <div className="absolute inset-0 overflow-y-auto">
            <div className="px-4 pt-4 pb-[160px]">
              <div className="flex flex-col">
                {timeline.map((item, i) => (
                  <div key={i} className="pointer-events-auto">
                    {item.type === 'message' && (
                      <ChatMessage 
                        message={(item.content as Message).text}
                        isUser={(item.content as Message).isUser}
                      />
                    )}
                    {item.type === 'sop' && (
                      <div className={`transform transition-all duration-500 ease-out mb-4 ${
                        item.content 
                          ? 'translate-y-0 opacity-100' 
                          : '-translate-y-8 opacity-0'
                      }`}>
                        <SOPWorkflowCard visible={true} />
                      </div>
                    )}
                    {item.type === 'action-plan' && (
                      <div className={`transform transition-all duration-500 ease-out mb-4 ${
                        item.content 
                          ? 'translate-y-0 opacity-100' 
                          : '-translate-y-8 opacity-0'
                      }`}>
                        <ActionPlanCard 
                          visible={true} 
                          onRequestAdjustments={handleRequestAdjustments}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating input area with gradient background */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="h-[20px] bg-gradient-to-t from-white via-white to-transparent" />
            <div className="bg-white">
              <ChatInputArea 
                onSendMessage={handleSendMessage}
                onDragEnter={handlers.handleDragEnter}
                onDragLeave={handlers.handleDragLeave}
                onDragOver={handlers.handleDragOver}
                onDrop={handlers.handleDrop}
              />
            </div>
          </div>
        </div>
      </div>

      <FilesPanel 
        isOpen={isFilesPanelOpen} 
        onClose={() => setIsFilesPanelOpen(false)} 
      />

      <FileUploadOverlay uploadState={uploadState} />
    </div>
  )
}

// Main page component that wraps content with layout
export default function CloseDetailPage() {
  const params = useParams()
  const engagementId = params.id as string
  const closeId = params.closeId as string
  
  console.log('CloseDetailPage rendered with closeId:', closeId) // Debug log

  return (
    <BookkeepingLayout 
      engagementId={engagementId}
    >
      <CloseDetailContent key={closeId} />
    </BookkeepingLayout>
  )
} 