'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import ReviewModal from './ReviewModal'
import DocumentPreviewModal from './DocumentPreviewModal'
import { Workflow, WorkflowInput } from '@/data/workflows'

// Define types for our messages
type MessageType = 'text' | 'prompt' | 'deliverable' | 'loading'

interface BaseMessage {
  id: string
  type: MessageType
  content: string
}

interface PromptMessage extends BaseMessage {
  type: 'prompt'
  status: 'pending' | 'reviewed'
  onReview: () => void
}

interface DeliverableMessage extends BaseMessage {
  type: 'deliverable'
  onDownload: (format?: 'slide_deck' | 'document' | 'binder' | 'combined') => void
}

type Message = BaseMessage | PromptMessage | DeliverableMessage

// Reusable card wrapper for agent messages
const AgentCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg border border-[#E4E5E1] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4 mb-4">
    {children}
  </div>
)

// Keep TextMessage as a separate component outside the main component
const TextMessage = ({ 
  content, 
  isTyping = false, 
  id, 
  onTypingProgress 
}: BaseMessage & { 
  isTyping?: boolean;
  onTypingProgress?: (id: string, progress: number) => void;
}) => {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!isTyping) {
      setDisplayText(content)
      return
    }

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayText(content.slice(0, currentIndex + 1))
        onTypingProgress?.(id, currentIndex + 1)
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [content, isTyping, id, onTypingProgress])

  return (
    <div className="font-oracle text-[15px] leading-[22px] whitespace-pre-wrap mb-4" data-message-id={id}>
      {displayText}
      {isTyping && displayText.length < content.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  )
}

// Add LoadingTable component near the top with other component definitions
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
        <div className="flex items-center justify-center">
          <div className="h-[20px] w-[16px] bg-[#F7F7F6] rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)

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

interface WorkflowRunPanelProps {
  workflow: Workflow | null;
  runStatus: 'initializing' | 'running' | 'completed';
}

export default function WorkflowRunPanel({ workflow, runStatus }: WorkflowRunPanelProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [typingProgress, setTypingProgress] = useState(0)
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false)

  const handleTypingProgress = useCallback((messageId: string, progress: number) => {
    if (messageId === typingMessageId) {
      setTypingProgress(progress)
    }
  }, [typingMessageId])

  // Single effect to manage the workflow
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        const firstMessageId = '1'
        setTypingMessageId(firstMessageId)
        setTypingProgress(0)
        handleNewMessage({
          id: firstMessageId,
          type: 'text',
          content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
        })
      }, 2000)
      return () => clearTimeout(timer)
    }

    // Check if current typing message is complete
    const currentMessage = messages.find(m => m.id === typingMessageId)
    if (currentMessage && typingProgress >= currentMessage.content.length) {
      setTypingMessageId(null)
      if (currentMessage.id === '1') {
        // Add loading message first
        handleNewMessage({
          id: '2',
          type: 'loading',
          content: ''
        })
        
        setTimeout(() => {
          // Replace loading message with real message
          setMessages(prev => prev.map(msg => 
            msg.id === '2' ? {
              id: '2',
              type: 'prompt',
              content: 'I need your input on a few items before we continue.',
              status: 'pending',
              onReview: () => handleReview('2')
            } : msg
          ))
        }, 1000)
      } else if (currentMessage.id === '3') {
        // Add loading message first
        handleNewMessage({
          id: '4',
          type: 'loading',
          content: ''
        })

        setTimeout(() => {
          // Replace loading message with real message
          setMessages(prev => prev.map(msg => 
            msg.id === '4' ? {
              id: '4',
              type: 'deliverable',
              content: "I've prepared your final deliverable.",
              onDownload: () => console.log('Downloading...')
            } : msg
          ))
        }, 1000)
      }
    }
  }, [isLoading, messages, typingMessageId, typingProgress])

  // Handle what happens after review
  const handleReview = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId && msg.type === 'prompt'
        ? { ...msg, status: 'reviewed' }
        : msg
    ))

    // Start typing the next section
    const nextMessageId = '3'
    setTypingMessageId(nextMessageId)
    setTypingProgress(0) // Reset typing progress
    handleNewMessage({
      id: nextMessageId,
      type: 'text',
      content: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`
    })
  }

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  // Update the LoadingCard component
  const LoadingCard = () => (
    <AgentCard>
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-[#F7F7F6] animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-[22px] bg-[#F7F7F6] rounded animate-pulse w-2/3" />
          <div className="h-[22px] bg-[#F7F7F6] rounded animate-pulse w-1/2" />
        </div>
      </div>
    </AgentCard>
  )

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Move AgentPrompt inside and make it a nested component
  const AgentPrompt = ({ content, status, onReview }: PromptMessage) => {
    const [isReviewing, setIsReviewing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState<{ name: string; url?: string } | null>(null)
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

    useEffect(() => {
      if (isExpanded) {
        setIsLoading(true)
        const timer = setTimeout(() => {
          setIsLoading(false)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }, [isExpanded])

    const handleReview = () => {
      setIsReviewing(true)
      setTimeout(() => {
        setIsReviewing(false)
        onReview()
      }, 1000)
    }

    return (
      <>
        <AgentCard>
          <div className="flex flex-col">
            {/* Message header */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E4E5E1] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center flex-shrink-0">
                <Image src="/modus3.svg" alt="Modus Logo" width={15} height={15} className="h-[14.25px] w-auto text-[#1A1A1A]" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="font-oracle text-[15px] leading-[22px] text-[#1A1A1A] flex-1">
                    {content}
                  </p>
                  {status === 'pending' && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF4E5] text-[#B76E00] rounded-full flex-shrink-0 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-[shimmer_1.5s_ease-in-out_infinite] before:-translate-x-full">
                      <svg width="12" height="12" viewBox="0 0 24 24" className="relative">
                        <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 12.46875 4.9863281 A 1.0001 1.0001 0 0 0 11.503906 5.9160156 L 11.003906 11.916016 A 1.0001 1.0001 0 0 0 11.417969 12.814453 L 14.917969 15.314453 A 1.0010463 1.0010463 0 0 0 16.082031 13.685547 L 13.042969 11.517578 L 13.496094 6.0839844 A 1.0001 1.0001 0 0 0 12.46875 4.9863281 z" />
                      </svg>
                      <span className="text-[13px] leading-[18px] font-medium font-oracle relative">
                        Action required
                      </span>
                    </div>
                  )}
                  {status === 'reviewed' && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <path 
                          fill="currentColor" 
                          d="M20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" 
                        />
                      </svg>
                      <span className="text-[13px] leading-[18px] font-medium font-oracle">
                        Reviewed
                      </span>
                    </div>
                  )}
                </div>
                {status === 'pending' && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full
                      text-[14px] leading-[20px] font-medium hover:bg-[#333333]
                      transition-colors"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>

            {/* Expandable review section */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[500px] mt-6' : 'max-h-0'
            }`}>
              <div className="border border-[#E4E5E1] rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[160px_2fr_120px_160px_40px] gap-4 py-1.5 border-b border-[#E4E5E1] px-4 bg-white/80">
                  <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Date</div>
                  <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Description</div>
                  <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Amount</div>
                  <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Category</div>
                  <div></div>
                </div>

                {/* Table content */}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDocument({
                                name: transaction.description,
                                // url will be added later when we have real documents
                              })
                              setIsPreviewModalOpen(true)
                            }}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24"
                              className="fill-current"
                            >
                              <path d="M 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 11 22 A 1.0001 1.0001 0 1 0 11 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 11 A 1.0001 1.0001 0 1 0 20 11 L 20 8 A 1.0001 1.0001 0 0 0 19.707031 7.2929688 L 14.707031 2.2929688 A 1.0001 1.0001 0 0 0 14 2 L 6.5 2 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z M 19 14 C 16.239 14 14 16.239 14 19 C 14 21.761 16.239 24 19 24 C 21.761 24 24 21.761 24 19 C 24 16.239 21.761 14 19 14 z M 20.884766 17.109375 C 21.076141 17.09425 21.272188 17.151156 21.429688 17.285156 C 21.744688 17.553156 21.784625 18.02875 21.515625 18.34375 L 18.982422 21.316406 C 18.834422 21.490406 18.623156 21.579078 18.410156 21.580078 C 18.246156 21.580078 18.081359 21.526969 17.943359 21.417969 L 16.589844 20.341797 C 16.264844 20.083797 16.209797 19.612109 16.466797 19.287109 C 16.724797 18.964109 17.197484 18.908969 17.521484 19.167969 L 18.308594 19.792969 L 20.371094 17.369141 C 20.506094 17.211641 20.693391 17.1245 20.884766 17.109375 z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review button */}
                <div className="flex justify-end p-4 border-t border-[#E4E5E1]">
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
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24">
                          <path 
                            fill="currentColor" 
                            d="M20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" 
                          />
                        </svg>
                        Complete review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AgentCard>

        {/* Document Preview Modal */}
        {selectedDocument && (
          <DocumentPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => {
              setIsPreviewModalOpen(false)
              setSelectedDocument(null)
            }}
            documentName={selectedDocument.name}
            documentUrl={selectedDocument.url}
          />
        )}
      </>
    )
  }

  const AgentDeliverable = ({ content, onDownload }: DeliverableMessage) => {
    const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
    const downloadDropdownRef = useRef<HTMLDivElement>(null);

    const handleDownload = async (format: 'slide_deck' | 'document' | 'binder' | 'combined') => {
      setIsDownloadDropdownOpen(false);
      
      // Show preparing toast
      toast.promise(
        // Promise to download file
        new Promise(async (resolve) => {
          // Simulate preparation delay
          await new Promise(r => setTimeout(r, 1000));
          
          try {
            // Create link to download file
            const link = document.createElement('a');
            link.href = '/sample.pdf';
            link.download = `${format.replace('_', ' ')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            resolve(true);
          } catch (error) {
            console.error('Download failed:', error);
            throw new Error('Failed to download file');
          }
        }),
        {
          loading: 'Preparing download...',
          success: 'Download started',
          error: 'Download failed'
        }
      );
    };

    // Add useEffect for click outside handling
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
          setIsDownloadDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <AgentCard>
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E4E5E1] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center flex-shrink-0">
            <Image src="/modus3.svg" alt="Modus Logo" width={15} height={15} className="h-[14.25px] w-auto text-[#1A1A1A]" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="font-oracle text-[15px] leading-[22px] text-[#1A1A1A] flex-1">
                {content}
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E6EDFF] text-[#0040A1] rounded-full flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                </svg>
                <span className="text-[13px] leading-[18px] font-medium font-oracle">
                  Workflow completed
                </span>
              </div>
            </div>
            <div className="relative w-fit" ref={downloadDropdownRef}>
              <button
                onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                className="bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full
                  text-[14px] leading-[20px] font-medium hover:bg-[#333333]
                  transition-colors flex items-center gap-1"
              >
                <span>Download</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  className={`w-4 h-4 transition-transform ${isDownloadDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <path 
                    d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              {isDownloadDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[187px] z-50">
                  <div className="space-y-[2px]">
                    <button
                      onClick={() => handleDownload('slide_deck')}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                    >
                      Slide deck
                    </button>
                    <button
                      onClick={() => handleDownload('document')}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                    >
                      Document
                    </button>
                    <button
                      onClick={() => handleDownload('binder')}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                    >
                      Binder
                    </button>
                    <button
                      onClick={() => handleDownload('combined')}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                    >
                      Combined package
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AgentCard>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Content area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Workflow description card */}
        <div className="mb-4">
          <div className="bg-[#F7F7F6] rounded-[8px] px-4 py-4">
            <div className="text-[16px] leading-[22px] font-oracle font-medium text-[#1A1A1A] mb-1">
              Description
            </div>
            <div className="text-[16px] leading-[22px] font-oracle text-[#1A1A1A] mb-3">
              {isLoading ? (
                <div className="h-[22px] w-2/3 bg-[#EBEAE8] rounded animate-pulse" />
              ) : (
                workflow?.description
              )}
            </div>
            
            {/* Supported documents section */}
            {workflow?.inputs?.some((input: WorkflowInput) => input.type === 'document_upload' && input.documentTypes) && (
              <div>
                <button
                  onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
                  className="w-full flex items-center gap-0.5 group"
                >
                  <span className="text-[13px] leading-[18px] text-[#646462]">
                    Supported documents
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 fill-current text-[#646462] transition-transform ${disclaimerExpanded ? 'rotate-180' : ''}`}
                  >
                    <path d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"/>
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-200 ${disclaimerExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ul className="list-disc pl-4 space-y-1 pt-2">
                    {workflow.inputs
                      .filter((input: WorkflowInput) => input.type === 'document_upload' && input.documentTypes)
                      .flatMap((input: WorkflowInput) => input.documentTypes || [])
                      .map((type: string, i: number) => (
                        <li key={i} className="text-[13px] leading-[18px] font-oracle text-[#646462]">
                          {type}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Existing messages content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        ) : (
          <div>
            {messages.map(message => {
              if (message.type === 'loading') {
                return <LoadingCard key={message.id} />
              }
              
              if (message.type === 'text') {
                return (
                  <TextMessage 
                    key={message.id} 
                    {...message} 
                    isTyping={message.id === typingMessageId}
                    onTypingProgress={handleTypingProgress}
                  />
                )
              }
              if (message.type === 'prompt') {
                const promptMessage = message as PromptMessage
                return <AgentPrompt key={message.id} {...promptMessage} />
              }
              if (message.type === 'deliverable') {
                const deliverableMessage = message as DeliverableMessage
                return <AgentDeliverable key={message.id} {...deliverableMessage} />
              }
              return null
            })}
          </div>
        )}
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReview={() => handleReview('2')}
        content={messages.find(m => m.type === 'prompt')?.content || ''}
      />
    </div>
  )
} 