'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import FilingModal from "../components/FilingModal"
import FilingsFilters from "../components/FilingsFilters"
import FilingRowMenu from '../components/FilingRowMenu'
import Image from 'next/image'
import UpcomingFilingRowMenu from '../components/UpcomingFilingRowMenu'
import StatusFilter from "../components/StatusFilter"
import DateFilter from "../components/DateFilter"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { downloadSingleFile, downloadMultipleFiles } from '../utils/fileDownload'

// Add types
type Filing = {
  id: string;
  date: string;
  name: string;
  type: string;
  status: string;
  responsible: string;
  confirmation?: string;
  authority: string;
  url?: string;  // Add URL field for associated document
}

type Month = {
  name: string;
  filings: Filing[];
}

// Add new type for grouping
type TypeGroup = {
  name: string;
  color: string;
  filings: Filing[];
}

// Add this type at the top
type DateOption = 'all' | 'today' | 'yesterday' | 'past-week' | 'month-to-date' | 'past-4-weeks' | 'past-12-weeks' | 'year-to-date' | 'past-6-months' | 'past-12-months' | 'custom';

// Add these helper functions at the top of your component
const isSameDay = (date1: Date | null, date2: Date | null) => {
  if (!date1 || !date2) return false;
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
};

const isDateRangeEqual = (
  range1: { start: Date | null; end: Date | null },
  range2: { start: Date | null; end: Date | null }
) => {
  return isSameDay(range1.start, range2.start) && isSameDay(range1.end, range2.end);
};

// Helper function to format status for display
const formatStatus = (status: string) => {
  switch(status) {
    case 'filed': return 'Filed';
    case 'on_track': return 'On track';
    case 'action_needed': return 'Action needed';
    default: return status;
  }
};

// Format date consistently
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

export default function FilingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
  const [isResponsibleFilterOpen, setIsResponsibleFilterOpen] = useState(false);
  const [selectedResponsibleFilters, setSelectedResponsibleFilters] = useState<string[]>([]);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateOption, setSelectedDateOption] = useState<DateOption>('all');
  const [selectedUpcomingFilings, setSelectedUpcomingFilings] = useState<Set<string>>(new Set());
  const [selectedCompletedFilings, setSelectedCompletedFilings] = useState<Set<string>>(new Set());
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [authorityFilter, setAuthorityFilter] = useState<string[]>([]);
  const [isAuthorityFilterOpen, setIsAuthorityFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' });
  const [upcomingFilings, setUpcomingFilings] = useState<Filing[]>([]);
  const [completedFilings, setCompletedFilings] = useState<Filing[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Move these outside of the filtering logic
  const upcomingCount = upcomingFilings.length;
  const completedCount = completedFilings.length;

  // Update the tabs to use the counts
  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { id: 'completed', label: 'Completed', count: completedCount }
  ];

  // Fetch both types of filings at once
  const fetchFilings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch upcoming filings
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('filings')
        .select('*')
        .eq('archived', false)
        .neq('status', 'filed')
        .order('due_date', { ascending: true });

      if (upcomingError) throw upcomingError;
      setUpcomingFilings(upcomingData || []);

      // Fetch completed filings
      const { data: completedData, error: completedError } = await supabase
        .from('filings')
        .select('*')
        .eq('archived', false)
        .eq('status', 'filed')
        .order('date', { ascending: false });

      if (completedError) throw completedError;
      setCompletedFilings(completedData || []);

    } catch (error) {
      console.error('Error fetching filings:', error);
      toast.error('Failed to load filings');
    } finally {
      setIsLoading(false);
    }
  };

  // Add archive function
  const archiveFilings = async (filingIds: string[]) => {
    try {
      const { error } = await supabase
        .from('filings')
        .update({ archived: true })
        .in('id', filingIds);

      if (error) throw error;

      toast.success('Filing(s) archived successfully');
      fetchFilings(); // Refresh the list
    } catch (error) {
      console.error('Error archiving filings:', error);
      toast.error('Failed to archive filing(s)');
    }
  };

  useEffect(() => {
    fetchFilings();
  }, [user]);

  // Use the appropriate filings array based on active tab
  const currentFilings = activeTab === 'completed' ? completedFilings : upcomingFilings;

  // Update filtering logic with new tab name
  const activeTabFilings = currentFilings
    .filter(filing => {
      try {
        const filingDate = new Date(filing.date + ' 12:00:00');
        const isInDateRange = (!dateRange.start || filingDate >= new Date(dateRange.start)) &&
          (!dateRange.end || filingDate <= new Date(dateRange.end));

        // Filter based on lowercase status
        if (activeTab === 'upcoming') {
          return filing.status !== 'filed' && isInDateRange;
        } else { // completed
          return filing.status === 'filed' && isInDateRange;
        }
      } catch (e) {
        console.error('Error parsing date:', filing.date);
        return false;
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredFilings = activeTabFilings.filter(filing => {
    const filingDate = new Date(filing.date);
    const fromDate = dateRangeFilter.from ? new Date(dateRangeFilter.from) : null;
    const toDate = dateRangeFilter.to ? new Date(dateRangeFilter.to) : null;
    
    return (searchText ? (
      filing.name.toLowerCase().includes(searchText.toLowerCase()) ||
      filing.authority.toLowerCase().includes(searchText.toLowerCase())
    ) : true) &&
    (authorityFilter.length > 0 ? authorityFilter.includes(filing.authority) : true) &&
    (statusFilter.length > 0 ? statusFilter.includes(filing.status) : true) &&
    (!fromDate || filingDate >= fromDate) &&
    (!toDate || filingDate <= toDate);
  });

  // Get unique authorities for the dropdown
  const uniqueAuthorities = Array.from(new Set(activeTabFilings.map(f => f.authority)));
  const uniqueStatuses = Array.from(new Set(activeTabFilings.map(f => f.status)));

  // Add click-outside handlers for all popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.authority-filter')) {
        setIsAuthorityFilterOpen(false);
      }
      if (!target.closest('.status-filter')) {
        setIsStatusFilterOpen(false);
      }
      if (!target.closest('.date-filter')) {
        setIsDateFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // First, create the helper to get the current selection state
  const selectedFilings = activeTab === 'upcoming' ? selectedUpcomingFilings : selectedCompletedFilings;
  const setSelectedFilings = activeTab === 'upcoming' ? setSelectedUpcomingFilings : setSelectedCompletedFilings;

  // Then use it in allFilingsSelected
  const allFilingsSelected = filteredFilings.length > 0 && 
    filteredFilings.every(filing => selectedFilings.has(filing.id));

  // Add this useEffect with other useEffects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="h-screen flex overflow-hidden">
        <CopilotNavigation selectedTab="filings" />
        <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header row with Filings title and tabs */}
            <div className="flex items-center justify-between px-2 py-2 mb-[9px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    Filings
                  </h1>
                  <div 
                    ref={menuRef}
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F7F7F6] transition-colors"
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16"
                        className="text-[#646462]"
                      >
                        <path 
                          fill="currentColor"
                          d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM3 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                        />
                      </svg>
                    </button>

                    {isMenuOpen && (
                      <div className="absolute left-full top-0 ml-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                        <div className="space-y-[2px]">
                          <button 
                            onClick={() => {
                              // Handle click
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
                          >
                            Download all
                          </button>
                          <button 
                            onClick={() => {
                              // Handle click
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
                          >
                            Archive selected
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tab switcher */}
              <div className="flex gap-6 relative border-b border-[#E4E5E1]">
                {tabs.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`pb-2 relative ${
                      activeTab === id 
                        ? 'text-[#1A1A1A]' 
                        : 'text-[#646462] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span className="text-[14px] leading-[20px] font-medium font-['Inter']">
                      {label}
                    </span>
                    {activeTab === id && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main content card */}
            <main className="flex-1 rounded-[14px] bg-white/60 overflow-hidden flex flex-col">
              {/* Search Row */}
              <div className="px-6 pr-[24px] py-3">
                <div className="flex items-center justify-between">
                  {/* Search Bar */}
                  <div className="w-[320px]">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search..."
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
                  </div>

                  {/* Only show Download buttons in completed tab */}
                  {activeTab === 'completed' && selectedCompletedFilings.size > 0 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          try {
                            if (selectedCompletedFilings.size === 1) {
                              // Single file download
                              const filing = filteredFilings.find(f => selectedCompletedFilings.has(f.id))!;
                              if (filing.url) {
                                await downloadSingleFile(filing.url, `${filing.name}.pdf`);
                              } else {
                                toast.error('No document associated with this filing');
                              }
                            } else {
                              // Multiple files - create zip of available documents
                              const selectedDocs = filteredFilings.filter(doc => 
                                selectedCompletedFilings.has(doc.id) && doc.url
                              );
                              
                              if (selectedDocs.length === 0) {
                                toast.error('No documents available for selected filings');
                                return;
                              }

                              await downloadMultipleFiles(selectedDocs.map(doc => ({
                                url: doc.url!,
                                name: `${doc.name}.pdf`
                              })));
                            }
                          } catch (error) {
                            console.error('Error downloading files:', error);
                            toast.error('Failed to download file(s)');
                          }
                        }}
                        className="bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors flex items-center gap-2 border border-[#E4E5E1]"
                      >
                        <span>{selectedCompletedFilings.size > 1 ? 'Download all' : 'Download'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="px-6 pr-[24px]">
                {/* Table content */}
                <div className="w-full">
                  {/* Update header row styles with conditional columns */}
                  <div className={`grid ${
                    activeTab === 'completed'
                      ? 'grid-cols-[24px_2fr_1fr_1fr_1fr_32px]'
                      : 'grid-cols-[24px_2fr_1fr_1fr_1fr_32px]'
                  } gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-6 -mx-6 bg-white/80`}>
                    {/* Add checkbox header cell */}
                    <div className="w-4 flex items-center">
                      <div className="relative w-4 h-4">
                        <input
                          type="checkbox"
                          className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                          checked={allFilingsSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFilings(new Set(filteredFilings.map(filing => filing.id)));
                            } else {
                              setSelectedFilings(new Set());
                            }
                          }}
                        />
                        <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] transition-all" />
                        <svg 
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M2.5 6L5 8.5L9.5 4"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462]">
                      Filing
                    </div>
                    <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] relative">
                      <FilingsFilters
                        authorityFilter={authorityFilter}
                        setAuthorityFilter={setAuthorityFilter}
                        uniqueAuthorities={uniqueAuthorities}
                      />
                    </div>
                    <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] relative">
                      <StatusFilter
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        uniqueStatuses={uniqueStatuses}
                      />
                    </div>
                    <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] relative">
                      <DateFilter
                        dateRangeFilter={dateRangeFilter}
                        setDateRangeFilter={setDateRangeFilter}
                        label="Filing Date"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-[#E4E5E1]">
                    {filteredFilings.length === 0 ? (
                      // Simple left-aligned empty state like Documents page
                      <div className="py-4 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                        {searchText ? 
                          'No filings match your search' : 
                          `You don't have any ${activeTab === 'upcoming' ? 'upcoming' : 'completed'} filings`
                        }
                      </div>
                    ) : (
                      filteredFilings.map(filing => (
                          <div 
                            key={filing.id}
                          className={`grid ${
                            activeTab === 'completed'
                              ? 'grid-cols-[24px_2fr_1fr_1fr_1fr_32px]'
                              : 'grid-cols-[24px_2fr_1fr_1fr_1fr_32px]'
                          } gap-4 h-[42px] items-center relative group cursor-pointer`}
                            onClick={() => {
                              setSelectedFiling(filing);
                              setIsModalOpen(true);
                            }}
                          onMouseEnter={() => setHoveredRowId(filing.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                        >
                          {/* Checkbox cell */}
                          <div 
                            className="w-4 relative z-10 flex items-center opacity-0 group-hover:opacity-100 [&:has(input:checked)]:opacity-100 transition-opacity" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative w-4 h-4">
                              <input
                                type="checkbox"
                                className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                                checked={selectedFilings.has(filing.id)}
                                onChange={(e) => {
                                  setSelectedFilings(prev => {
                                    const next = new Set(prev);
                                    if (next.has(filing.id)) {
                                      next.delete(filing.id);
                                    } else {
                                      next.add(filing.id);
                                    }
                                    return next;
                                  });
                                }}
                              />
                              <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] transition-all" />
                              <svg 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path 
                                  d="M2.5 6L5 8.5L9.5 4"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Update hover background to match Documents */}
                          <div className="absolute inset-x-[-8px] h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-white/80 transition-colors" />
                          
                            <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            <span className="block">
                              {filing.name}
                            </span>
                            </div>
                            <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                              {filing.authority}
                            </div>
                            <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            <span className={`inline-block px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] ${
                              filing.status === 'filed' 
                                ? 'bg-[#B6F2E3] text-[#181818]'
                                : filing.status === 'on_track'
                                  ? 'bg-[#E1EFFF] text-[#181818]'
                                : filing.status === 'action_needed'
                                  ? 'bg-[#F2B8B6] text-[#181818]'
                                : ''
                            }`}>
                              {formatStatus(filing.status)}
                            </span>
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            {formatDate(filing.date)}
                          </div>

                          {/* Menu button that appears on hover */}
                          <div className="relative flex justify-end">
                            {activeTab === 'completed' ? (
                              <FilingRowMenu 
                                onDownload={async () => {
                                  try {
                                    if (filing.url) {
                                      await downloadSingleFile(filing.url, `${filing.name}.pdf`);
                                    }
                                  } catch (error) {
                                    console.error('Error downloading file:', error);
                                    toast.error('Failed to download file');
                                  }
                                }}
                                isRowHovered={hoveredRowId === filing.id}
                                hasDocument={!!filing.url}
                              />
                            ) : (
                              <UpcomingFilingRowMenu 
                                isRowHovered={hoveredRowId === filing.id}
                                onViewDetails={() => {
                                  setSelectedFiling(filing);
                                  setIsModalOpen(true);
                                }}
                                onResolveIssues={() => {
                                  console.log('Resolve issues for:', filing.id);
                                  // Add resolve issues functionality
                                }}
                                status={filing.status}
                              />
                            )}
                          </div>
                        </div>
                      ))
                      )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      
      <FilingModal
        filing={selectedFiling}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFiling(null);
        }}
      />
    </>
  )
} 