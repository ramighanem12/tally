'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import CopilotNavigation from "../../components/CopilotNavigation"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import SourcesCard from '@/app/components/SourcesCard'
import DeliverablesCard from '@/app/components/DeliverablesCard'
import { toast } from 'sonner'
// import StepsCard from '@/app/components/StepsCard'  // Commented out temporarily
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeClassNames from 'rehype-class-names'
import { motion, AnimatePresence } from 'framer-motion'
import LinkPreview from '@/app/components/LinkPreview'
import type { Components } from 'react-markdown'
import type { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from 'react'
import { saveAs } from 'file-saver'

interface Message {
  content: string
  sources: string[]
  timestamp: string
  isQuery?: boolean
}

// Helper function to convert table to CSV
const tableToCSV = (table: HTMLTableElement): string => {
  const rows = Array.from(table.querySelectorAll('tr'))
  return rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'))
    return cells.map(cell => `"${cell.textContent?.replace(/"/g, '""') || ''}"`).join(',')
  }).join('\n')
}

const MarkdownTable: Components['table'] = ({ children, ...props }) => (
  <div className="mt-2 mb-2 !my-2">
    <div className="overflow-x-auto">
      <table className="min-w-full" {...props}>
        {children}
      </table>
    </div>
    <button
      onClick={(e) => {
        const table = e.currentTarget.parentElement?.querySelector('table')
        if (table) {
          const csv = tableToCSV(table)
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
          saveAs(blob, 'table-export.csv')
        }
      }}
      className="mt-2 px-2.5 py-1 text-[14px] bg-[#EBEAE8] text-[#1A1A1A] font-medium rounded-[4px] hover:bg-[#E4E5E1] transition-colors"
    >
      Export table
    </button>
  </div>
);

const TableHeader: Components['th'] = ({ children, ...props }) => (
  <th 
    className="pr-4 pb-2 pt-0 text-left border-b border-[#E4E5E1] font-oracle font-medium text-[14px] leading-[20px] text-[#1A1A1A]"
    {...props}
  >
    {children}
  </th>
);

const TableCell: Components['td'] = ({ children, ...props }) => (
  <td 
    className="pr-4 py-3 border-b border-[#E4E5E1] font-oracle text-[14px] leading-[20px] text-[#1A1A1A]"
    {...props}
  >
    {children}
  </td>
);

const TableRow: Components['tr'] = ({ children, ...props }) => {
  return (
    <tr {...props}>
      {children}
    </tr>
  );
};

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [chatCreatedAt, setChatCreatedAt] = useState<string>('')
  const [response, setResponse] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [isQueryLoading, setIsQueryLoading] = useState(true)

  useEffect(() => {
    async function initializeChat() {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch existing chat
        const { data: chat, error } = await supabase
          .from('assistant_chats')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (chat) {
          const initialMessage = {
            content: chat.query,
            sources: chat.sources || [],
            timestamp: chat.created_at,
            isQuery: true
          }
          setMessages([initialMessage])
          setIsQueryLoading(false)
          
          const formattedDate = format(new Date(chat.created_at), 'MMM d, yyyy')
          setChatCreatedAt(formattedDate)

          // Simplified logic - only one path for getting response
          if (chat.status === 'active') {
            setIsProcessing(true)
            try {
              const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: chat.query, chatId: chat.id }),
              });

              const data = await res.json();
              if (data.error) throw new Error(data.error);
              setResponse(data.response);
            } catch (error) {
              console.error('Error fetching response:', error);
              toast.error('Failed to get AI response');
            }
            setIsProcessing(false)
          } else {
            // Chat is completed, just show the stored response
            setResponse(chat.response || '');
          }
        }
      } catch (error) {
        console.error('Error fetching chat:', error)
        toast.error('Failed to load chat')
        setIsQueryLoading(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [params.id])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get the query from the first message
  const queryMessage = messages.find(m => m.isQuery)

  const handleDeleteChat = async () => {
    // Show native confirm dialog
    const confirmed = window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')
    
    if (confirmed) {
      try {
        const { error } = await supabase
          .from('assistant_chats')
          .delete()
          .eq('id', params.id)

        if (error) throw error

        // Redirect back to assistant page after successful deletion
        router.push('/assistant')
        toast.success('Chat deleted successfully')
      } catch (error) {
        console.error('Error deleting chat:', error)
        toast.error('Failed to delete chat')
      }
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="assistant" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6]">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col">
          {/* Header - fixed padding to match workflow page */}
          <div className="pl-4 pr-6 py-5 border-b border-[#E4E5E1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                  <div className="flex items-center">
                    <Link 
                      href="/assistant" 
                      className="text-[#646462] hover:text-[#1A1A1A]"
                    >
                      Assistant
                    </Link>
                    <span className="mx-2 text-[#646462]">/</span>
                    <span>Chat</span>
                  </div>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] font-oracle font-[500] text-[13px] leading-[20px] bg-[#EBEAE8] text-[#1A1A1A]">
                  Created {chatCreatedAt}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {}} // Add share functionality later
                  className="px-4 h-[28px] bg-white border border-[#E4E5E1] text-[#1A1A1A] rounded-[6px] text-[14px] font-medium hover:bg-[#F7F7F6] flex items-center gap-1.5 transition-colors"
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#1A1A1A]"
                  >
                    <path 
                      d="M18.5 20L18.5 14M18.5 14L21 16.5M18.5 14L16 16.5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M12 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V11" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  Share
                </button>
                <button 
                  onClick={() => {}} // Add export functionality later
                  className="px-4 h-[28px] bg-black text-white rounded-[6px] text-[14px] font-medium hover:bg-[#1A1A1A] flex items-center transition-colors"
                >
                  Export
                </button>
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1.5 hover:bg-[#F7F7F6] rounded-md transition-colors"
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
                        d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                      />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                      <div className="space-y-[2px]">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                        >
                          Archive chat
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleDeleteChat();
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                        >
                          Delete chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content area with right section */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left section - 75% */}
            <div className="flex-1 overflow-y-auto min-w-0">
              {/* Query card */}
              <div className="px-4 pt-4">
                <div className="bg-[#F7F7F6] rounded-[8px] pl-4 pr-6 py-4">
                  <div className="text-[16px] leading-[22px] font-oracle font-medium text-[#1A1A1A] mb-1">
                    Query
                  </div>
                  <div className="text-[16px] leading-[22px] font-oracle text-[#1A1A1A] mb-3">
                    {isQueryLoading ? (
                      <div className="h-[22px] w-2/3 bg-[#EBEAE8] rounded animate-pulse" />
                    ) : (
                      queryMessage?.content
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigator.clipboard.writeText(queryMessage?.content || '')}
                      className="p-1.5 hover:bg-[#EBEAE8] rounded-md transition-colors"
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#646462]"
                      >
                        <path 
                          d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <path 
                          d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {}} // Add edit functionality later
                      className="p-1.5 hover:bg-[#EBEAE8] rounded-md transition-colors"
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#646462]"
                      >
                        <path 
                          d="M12 3.99997H6C4.89543 3.99997 4 4.8954 4 5.99997V18C4 19.1045 4.89543 20 6 20H18C19.1046 20 20 19.1045 20 18V12M18.4142 8.41417L19.5 7.32842C20.281 6.54737 20.281 5.28104 19.5 4.5C18.7189 3.71895 17.4526 3.71895 16.6715 4.50001L15.5858 5.58575M18.4142 8.41417L12.3779 14.4505C12.0987 14.7297 11.7431 14.9201 11.356 14.9975L8.41422 15.5858L9.00257 12.6441C9.08001 12.2569 9.27032 11.9013 9.54951 11.6221L15.5858 5.58575M18.4142 8.41417L15.5858 5.58575" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Response card */}
              <div className="px-4 pt-4 pb-6">
                <div className="bg-white pl-4">
                  <div className="text-[16px] leading-[22px] font-oracle text-[#1A1A1A]">
                    <AnimatePresence mode="wait">
                      {(isProcessing || !response) ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
                          <span>Thinking...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="response"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: "easeOut"
                          }}
                          className="prose max-w-none"
                        >
                          <div className="font-oracle text-[16px] leading-[22px]">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: MarkdownTable,
                                th: TableHeader,
                                td: TableCell,
                                tr: TableRow,
                                a: ({ href, children }) => (
                                  <LinkPreview href={href || '#'}>
                                    {children}
                                  </LinkPreview>
                                )
                              }}
                              rehypePlugins={[[rehypeClassNames, {
                                'div': 'prose max-w-none',
                                'p': 'mb-4 font-oracle text-[16px] leading-[22px]',
                                'ul': 'list-disc space-y-1 mb-4 ml-0',
                                'ol': 'list-decimal space-y-1 mb-4 ml-0',
                                'li': 'ml-5 pl-1',
                                'h1': 'text-2xl font-[500] mb-4',
                                'h2': 'text-xl font-[500] mb-3',
                                'h3': 'text-lg font-[500] mb-2',
                                'strong': 'font-[500]',
                                'em': 'italic',
                                'code': 'bg-gray-100 rounded px-1.5 py-0.5 text-[15px]',
                                'pre': 'bg-gray-100 rounded-lg p-4 mb-4 overflow-x-auto',
                                'pre code': 'bg-transparent p-0 text-[14px]',
                                'table': 'my-2',
                              }]]}
                            >
                              {response}
                            </ReactMarkdown>
                          </div>
                          
                          <div className="flex gap-1 mt-3">
                            <button 
                              onClick={() => {
                                toast.success('Thanks for your feedback!', {
                                  position: 'bottom-right',
                                  duration: 3000,
                                })
                              }}
                              className="p-1.5 hover:bg-[#F7F7F6] rounded-md transition-colors"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24"
                                className="text-[#646462]"
                                fill="none"
                              >
                                <path 
                                  d="M3 10C3 9.44772 3.44772 9 4 9H7V21H4C3.44772 21 3 20.5523 3 20V10Z" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                <path 
                                  d="M7 11V19L8.9923 20.3282C9.64937 20.7662 10.4214 21 11.2111 21H16.4586C17.9251 21 19.1767 19.9398 19.4178 18.4932L20.6119 11.3288C20.815 10.1097 19.875 9 18.6391 9H14" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                <path 
                                  d="M14 9L14.6872 5.56415C14.8659 4.67057 14.3512 3.78375 13.4867 3.49558V3.49558C12.6336 3.21122 11.7013 3.59741 11.2992 4.4017L8 11H7" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button 
                              onClick={() => {}} // Add thumbs down functionality later
                              className="p-1.5 hover:bg-[#F7F7F6] rounded-md transition-colors"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24"
                                className="text-[#646462]"
                                fill="none"
                              >
                                <path 
                                  d="M21 14C21 14.5523 20.5523 15 20 15H17V3H20C20.5523 3 21 3.44772 21 4V14Z" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                <path 
                                  d="M17 13V5L15.0077 3.6718C14.3506 3.23375 13.5786 3 12.7889 3H7.54138C6.07486 3 4.82329 4.06024 4.5822 5.5068L3.38813 12.6712C3.18496 13.8903 4.12504 15 5.36092 15H10" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                <path 
                                  d="M10 15L9.31283 18.4358C9.13411 19.3294 9.64876 20.2163 10.5133 20.5044V20.5044C11.3664 20.7888 12.2987 20.4026 12.7008 19.5983L16 13H17" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button 
                              onClick={() => {}} // Add download functionality later
                              className="p-1.5 hover:bg-[#F7F7F6] rounded-md transition-colors"
                            >
                              <svg 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-[#646462]"
                              >
                                <path 
                                  d="M12 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V11" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                <path 
                                  d="M18.5 14V20M18.5 20L16 17.5M18.5 20L21 17.5" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>

                            <div className="flex-1" />

                            <button 
                              onClick={async () => {
                                setIsProcessing(true);
                                try {
                                  const res = await fetch('/api/assistant', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      query: queryMessage?.content,
                                      chatId: params.id,
                                      regenerate: true
                                    }),
                                  });

                                  const data = await res.json();
                                  if (data.error) throw new Error(data.error);
                                  
                                  setResponse(data.response);
                                } catch (error) {
                                  console.error('Error regenerating response:', error);
                                  toast.error('Failed to regenerate response');
                                }
                                setIsProcessing(false);
                              }}
                              className="p-1.5 hover:bg-[#F7F7F6] rounded-md transition-colors text-[#646462]"
                            >
                              <svg 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-current"
                              >
                                <path 
                                  d="M4 12C4 7.58172 7.58172 4 12 4C15.3829 4 18.2855 6.10851 19.4566 9.09814M20 12C20 16.4183 16.4183 20 12 20C8.61708 20 5.71447 17.8915 4.54336 14.9019" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                />
                                <path 
                                  d="M20 4V9H15M4 20V15H9" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section - 25% */}
            <div className="w-[25%] min-w-[300px]">
              <SourcesCard 
                response={response}
                isLoading={isProcessing} 
              />
              <DeliverablesCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 