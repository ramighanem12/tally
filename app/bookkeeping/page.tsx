'use client'
import { useState, useRef, useEffect } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import CreateBookkeepingModal from "../components/CreateBookkeepingModal"
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { formatDistance, format, isYesterday, isToday, isBefore, subDays } from 'date-fns'

// Update the interface to match Supabase response
interface BookkeepingEngagement {
  id: string
  service_level: string
  status: string
  latest_close_period: string | null
  created_at: string
  updated_at: string
  client: {
    id: string
    name: string
  }
}

function CustomCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-4 h-4 rounded-[4px] cursor-pointer border flex items-center justify-center transition-all ${
        checked 
          ? 'bg-[#41629E] border-[#41629E]' 
          : 'bg-white border-[#D1D5DB] hover:border-[#41629E]'
      }`}
    >
      {checked && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          className="w-3 h-3 fill-white"
        >
          <path d="M9.55 18.2L3.65 12.3a.996.996 0 0 1 0-1.41l.07-.07a.996.996 0 0 1 1.41 0l4.42 4.42L19.17 5.62a.996.996 0 0 1 1.41 0l.07.07a.996.996 0 0 1 0 1.41L9.55 18.2z"/>
        </svg>
      )}
    </div>
  );
}

// Add this function to format the date
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()

  if (isToday(date)) {
    const distance = formatDistance(date, now, { addSuffix: false })
    if (distance === 'less than a minute') return 'Just now'
    return distance + ' ago'
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  if (isBefore(date, subDays(now, 1))) {
    return format(date, 'MMM d')  // This will output like "May 8"
  }

  return formatDistance(date, now, { addSuffix: true })
}

// Add this function to get empty state content based on tab
const getEmptyStateContent = (tab: 'all' | 'needs-action' | 'active' | 'closed') => {
  const commonIcon = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="27" 
      height="27" 
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M 4.25 4 C 3.013 4 2 5.012 2 6.25 L 2 18.75 C 2 19.987 3.013 21 4.25 21 L 13 21 C 13.552 21 14 20.552 14 20 C 14 19.447 13.552 19 13 19 L 4.25 19 C 4.112 19 4 18.888 4 18.75 L 4 6.25 C 4 6.112 4.112 6 4.25 6 L 7.3789062 6 C 7.5119063 6 7.6384219 6.0534844 7.7324219 6.1464844 L 8.8535156 7.2675781 C 9.3215156 7.7365781 9.9580937 8 10.621094 8 L 19.75 8 C 19.888 8 20 8.112 20 8.25 L 20 10 C 20 10.552 20.448 11 21 11 C 21.552 11 22 10.552 22 10 L 22 8.25 C 22 7.012 20.987 6 19.75 6 L 10.621094 6 C 10.488094 6 10.360578 5.9465156 10.267578 5.8535156 L 9.1464844 4.7324219 C 8.6784844 4.2634219 8.0419063 4 7.3789062 4 L 4.25 4 z M 20 13 C 17.794 13 16 14.794 16 17 C 16 17.955 16.350156 18.821766 16.910156 19.509766 L 14.339844 22.230469 C 14.309844 22.260469 14.279766 22.300078 14.259766 22.330078 C 13.929766 22.780078 14.030703 23.400469 14.470703 23.730469 C 14.920703 24.060469 15.549141 23.959766 15.869141 23.509766 L 18.091797 20.492188 C 18.661797 20.805188 19.305 21 20 21 C 22.206 21 24 19.206 24 17 C 24 14.794 22.206 13 20 13 z M 20 15 C 21.103 15 22 15.897 22 17 C 22 18.103 21.103 19 20 19 C 18.897 19 18 18.103 18 17 C 18 15.897 18.897 15 20 15 z" />
    </svg>
  );

  switch (tab) {
    case 'needs-action':
      return {
        icon: commonIcon,
        title: 'No items need attention',
        description: 'All bookkeeping items are up to date'
      }
    case 'active':
      return {
        icon: commonIcon,
        title: 'No active engagements',
        description: 'Create a new engagement to get started'
      }
    case 'closed':
      return {
        icon: commonIcon,
        title: 'No closed engagements',
        description: 'Completed engagements will appear here'
      }
    default:
      return {
        icon: commonIcon,
        title: 'No engagements yet',
        description: 'Create your first engagement to get started'
      }
  }
}

// Add this component for empty states
function EmptyState({ tab }: { tab: 'all' | 'needs-action' | 'active' | 'closed' }) {
  const content = getEmptyStateContent(tab)
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-8 h-8 mb-4 text-[#646462]">
        {content.icon}
      </div>
      <h3 className="text-[16px] leading-[24px] font-medium text-[#1A1A1A] mb-1">
        {content.title}
      </h3>
      <p className="text-[14px] leading-[20px] text-[#646462]">
        {content.description}
      </p>
    </div>
  )
}

export default function BookkeepingPage() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'needs-action' | 'active' | 'closed'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rows, setRows] = useState<BookkeepingEngagement[]>([]);

  // Add refs for tabs
  const allTabRef = useRef<HTMLButtonElement>(null);
  const needsActionTabRef = useRef<HTMLButtonElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const closedTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const router = useRouter();

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Update the fetch function to ensure minimum 1 second loading
  const fetchBookkeepingEngagements = async () => {
    const startTime = Date.now()
    
    try {
      const { data, error } = await supabase
        .from('bookkeeping_engagements')
        .select(`
          id,
          service_level,
          status,
          latest_close_period,
          created_at,
          updated_at,
          client:clients!inner (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .returns<BookkeepingEngagement[]>()

      if (error) throw error

      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 1000 - elapsedTime)

      // Ensure minimum 1 second loading time
      await new Promise(resolve => setTimeout(resolve, remainingTime))

      setRows(data || [])
    } catch (error) {
      console.error('Error fetching bookkeeping engagements:', error)
      toast.error('Failed to load bookkeeping engagements')
    } finally {
      setIsLoading(false)
    }
  }

  // Add useEffect to fetch data
  useEffect(() => {
    fetchBookkeepingEngagements()
  }, [])

  // Handle master checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(rows.map(row => row.id)));
      setIsAllSelected(true);
    } else {
      setSelectedRows(new Set());
      setIsAllSelected(false);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    setIsAllSelected(newSelected.size === rows.length);
  };

  // Get service level color
  const getServiceLevelColor = (serviceLevel: string) => {
    const colors = {
      'Weekly': '#FF6B6B',      // Red
      'Bi-weekly': '#4ECDC4',   // Teal
      'Monthly': '#45B7D1',     // Blue
      'Quarterly': '#96CEB4',   // Green
      'Semi-annual': '#FFEEAD', // Yellow
      'Annual': '#D4A5A5'       // Pink
    };
    return colors[serviceLevel as keyof typeof colors] || '#9CA3AF';
  };

  // Update indicator position when tab changes
  useEffect(() => {
    const currentTabRef = 
      activeTab === 'all' ? allTabRef : 
      activeTab === 'needs-action' ? needsActionTabRef : 
      activeTab === 'active' ? activeTabRef :
      closedTabRef;
    
    if (currentTabRef.current) {
      setIndicatorStyle({
        left: currentTabRef.current.offsetLeft,
        width: currentTabRef.current.offsetWidth
      });
    }
  }, [activeTab]);

  // Add handler for row clicks
  const handleRowClick = (id: string) => {
    router.push(`/bookkeeping/${id}`)  // Changed from /engagements/${id}
  }

  // Add TableRowSkeleton component
  function TableRowSkeleton() {
    return (
      <tr className="border-b border-[#E4E5E1]">
        <td className="pl-4 py-3 w-[48px]">
          <div className="w-4 h-4 rounded-[4px] bg-[#F3F6F6] animate-pulse" />
        </td>
        <td className="py-3">
          <div className="h-[20px] w-32 bg-[#F3F6F6] rounded animate-pulse" />
        </td>
        <td className="py-3">
          <div className="h-[28px] w-[100px] bg-[#F3F6F6] rounded-md animate-pulse" />
        </td>
        <td className="py-3">
          <div className="h-[20px] w-24 bg-[#F3F6F6] rounded animate-pulse" />
        </td>
        <td className="py-3">
          <div className="h-[20px] w-20 bg-[#F3F6F6] rounded animate-pulse" />
        </td>
        <td className="pr-6 py-3">
          <div className="h-[20px] w-24 bg-[#F3F6F6] rounded animate-pulse" />
        </td>
      </tr>
    )
  }

  // Add archive function
  const handleArchive = async () => {
    try {
      const { error } = await supabase
        .from('bookkeeping_engagements')
        .delete()
        .in('id', Array.from(selectedRows))

      if (error) throw error

      // Remove archived rows from local state
      setRows(rows.filter(row => !selectedRows.has(row.id)))
      setSelectedRows(new Set())
      setIsAllSelected(false)

      toast.success(`${selectedRows.size} engagement${selectedRows.size !== 1 ? 's' : ''} archived`)
    } catch (error) {
      console.error('Error archiving engagements:', error)
      toast.error('Failed to archive engagements')
    }
  }

  // Modify the table body section to show empty states
  const filteredRows = rows.filter(row => 
    activeTab === 'all' || 
    (activeTab === 'needs-action' && row.status === 'Needs action') ||
    (activeTab === 'active' && row.status === 'Active') ||
    (activeTab === 'closed' && row.status === 'Closed')
  )

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="bookkeeping" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg relative">
          {/* Fixed Header */}
          <div className="pl-4 pr-4 py-3 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-[24px] w-auto">
                  <svg 
                    viewBox="0 0 500 500" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-auto"
                  >
                    <rect width="500" height="500" rx="100" fill="#00458F"/>
                    <path d="M386.9 326.9C387.75 337.95 388.883 345.883 390.3 350.7C391.717 355.517 394.55 359.2 398.8 361.75C403.333 364.3 410.417 365.717 420.05 366V384.275C398.8 382.858 379.533 382.15 362.25 382.15C344.683 382.15 325.275 382.858 304.025 384.275V366C316.775 365.433 325.417 363.025 329.95 358.775C334.767 354.242 337.175 346.45 337.175 335.4L336.75 326.9L328.25 185.8L250.9 385.975H235.175L149.75 182.825L141.25 321.8C140.683 336.533 142.808 347.442 147.625 354.525C152.725 361.608 161.65 365.433 174.4 366V384.275C157.4 382.858 141.958 382.15 128.075 382.15C114.192 382.15 98.75 382.858 81.75 384.275V366C94.2167 365.433 102.575 361.892 106.825 355.375C111.075 348.858 113.767 337.667 114.9 321.8L124.675 170.5C125.242 158.033 122.267 149.25 115.75 144.15C109.517 138.767 101.583 136.075 91.95 136.075V117.375C107.817 118.225 121.7 118.65 133.6 118.65C145.5 118.65 157.967 118.225 171 117.375L255.575 304.8L328.25 117.375C346.383 117.942 359.983 118.225 369.05 118.225C378.4 118.225 391.858 117.942 409.425 117.375V136.075C398.658 136.075 390.3 138.625 384.35 143.725C378.4 148.542 375.85 157.325 376.7 170.075L386.9 326.9Z" fill="white"/>
                  </svg>
                </div>
                <h1 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A]">
                  Bookkeeping
                </h1>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                New engagement
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 border-b border-[#E4E5E1] relative">
            <div className="flex gap-6">
              <button
                ref={allTabRef}
                onClick={() => setActiveTab('all')}
                className={`py-3 text-[15px] leading-[20px] font-oracle ${
                  activeTab === 'all'
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
                }`}
              >
                All
              </button>
              <button
                ref={activeTabRef}
                onClick={() => setActiveTab('active')}
                className={`py-3 text-[15px] leading-[20px] font-oracle ${
                  activeTab === 'active'
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
                }`}
              >
                Active
              </button>
              <button
                ref={needsActionTabRef}
                onClick={() => setActiveTab('needs-action')}
                className={`py-3 text-[15px] leading-[20px] font-oracle ${
                  activeTab === 'needs-action'
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
                }`}
              >
                Needs action
              </button>
              <button
                ref={closedTabRef}
                onClick={() => setActiveTab('closed')}
                className={`py-3 text-[15px] leading-[20px] font-oracle ${
                  activeTab === 'closed'
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
                }`}
              >
                Closed
              </button>
            </div>
            {/* Animated indicator */}
            <div 
              className="absolute bottom-0 h-[2px] bg-[#1A1A1A] transition-all duration-200"
              style={{ 
                left: `${indicatorStyle.left}px`, 
                width: `${indicatorStyle.width}px` 
              }}
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[48px]" />
                <col className="w-[25%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[17.5%]" />
                <col className="w-[17.5%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#E4E5E1]">
                  <th className="pl-4 py-3">
                    <CustomCheckbox 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-3 text-left text-[12px] leading-[16px] font-medium font-oracle text-[#6B7280]">
                  </th>
                  <th className="py-3 text-left text-[12px] leading-[16px] font-medium font-oracle text-[#6B7280]">
                  </th>
                  <th className="py-3 text-left text-[12px] leading-[16px] font-medium font-oracle text-[#6B7280]">
                  </th>
                  <th className="py-3 text-left text-[12px] leading-[16px] font-medium font-oracle text-[#6B7280]">
                  </th>
                  <th className="pr-6 py-3 text-left text-[12px] leading-[16px] font-medium font-oracle text-[#6B7280]">
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Show 5 skeleton rows while loading
                  [...Array(5)].map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))
                ) : (
                  <>
                    {filteredRows.length > 0 ? (
                      filteredRows.map(row => (
                        <tr 
                          key={row.id} 
                          onClick={() => handleRowClick(row.id)}
                          className="hover:bg-[#F9FAFB] border-b border-[#E4E5E1] cursor-pointer group"
                        >
                          <td 
                            className="pl-4 py-3 w-[48px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomCheckbox 
                              checked={selectedRows.has(row.id)}
                              onChange={(checked) => handleSelectRow(row.id, checked)}
                            />
                          </td>
                          <td className="py-3 text-[14.5px] leading-[20px] font-oracle text-[#1A1A1A] group-hover:text-[#41629E]">
                            {row.client.name}
                          </td>
                          <td className="py-3">
                            <div className="inline-flex items-center px-2 py-0.5 rounded-md border border-[#E4E5E1] bg-white">
                              <div 
                                className="w-1.5 h-1.5 rounded-full mr-1.5"
                                style={{ backgroundColor: getServiceLevelColor(row.service_level) }}
                              />
                              <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                {row.service_level}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-[14.5px] leading-[20px] font-oracle text-[#1A1A1A]">
                            {row.latest_close_period || '—'}
                          </td>
                          <td className="py-3 text-[14.5px] leading-[20px] font-oracle text-[#1A1A1A]">
                            {row.status}
                          </td>
                          <td className="pr-6 py-3 text-[14.5px] leading-[20px] font-oracle text-[#1A1A1A]">
                            {formatRelativeDate(row.updated_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState tab={activeTab} />
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Selection toolbar */}
          {selectedRows.size > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] border border-[#E4E5E1] py-2.5 px-3 flex items-center gap-4 max-w-[90%] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="bg-[#F3F6F6] rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                    {selectedRows.size}
                  </span>
                </div>
                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                  bookkeeping engagement{selectedRows.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="w-[1px] h-5 bg-[#E4E5E1]" />
              <button 
                onClick={handleArchive}
                className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] hover:text-[#41629E] flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4H14M5.33333 4V3.2C5.33333 2.88174 5.45381 2.57652 5.66666 2.35147C5.87952 2.12643 6.16667 2 6.46667 2H9.53333C9.83333 2 10.1205 2.12643 10.3333 2.35147C10.5462 2.57652 10.6667 2.88174 10.6667 3.2V4M6.66667 7V11M9.33333 7V11M3.33333 4V12.8C3.33333 13.1183 3.45381 13.4235 3.66666 13.6485C3.87952 13.8736 4.16667 14 4.46667 14H11.5333C11.8333 14 12.1205 13.8736 12.3333 13.6485C12.5462 13.4235 12.6667 13.1183 12.6667 12.8V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Archive
              </button>
            </div>
          )}

          {/* Add modal at the end of the component */}
          <CreateBookkeepingModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateSuccess={fetchBookkeepingEngagements}
          />
        </main>
      </div>
    </div>
  )
} 