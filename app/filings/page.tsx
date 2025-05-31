'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import FilingModal from "../components/FilingModal"
import FilingRowMenu from '../components/FilingRowMenu'
import Image from 'next/image'
import UpcomingFilingRowMenu from '../components/UpcomingFilingRowMenu'
import StatusFilter from "../components/StatusFilter"
import DateFilter from "../components/DateFilter"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { downloadSingleFile, downloadMultipleFiles } from '../utils/fileDownload'
import TypeFilter from "../components/TypeFilter"

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
  amount?: string; // Add this field
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
  const hasInitialFetch = useRef(false);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Move these outside of the filtering logic
  const upcomingCount = upcomingFilings.length;
  const completedCount = completedFilings.length;

  // Update the tabs definition to only show count for upcoming
  const tabs = [
    { 
      id: 'upcoming', 
      label: `Upcoming${upcomingCount > 0 ? ` (${upcomingCount})` : ''}`
    },
    { 
      id: 'completed', 
      label: 'Completed'
    }
  ];

  // Fetch both types of filings at once
  const fetchFilings = async () => {
    if (!user || hasInitialFetch.current) return;
    
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
      hasInitialFetch.current = true;
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

  // Get unique types from your filings
  const uniqueTypes = Array.from(new Set(currentFilings.map(filing => filing.type)));

  // Update your filtering logic to include type filter
  const filteredFilings = activeTabFilings.filter(filing => {
    const filingDate = new Date(filing.date);
    const fromDate = dateRangeFilter.from ? new Date(dateRangeFilter.from) : null;
    const toDate = dateRangeFilter.to ? new Date(dateRangeFilter.to) : null;
    
    const matchesSearch = (searchText ? (
      filing.name.toLowerCase().includes(searchText.toLowerCase()) ||
      filing.authority.toLowerCase().includes(searchText.toLowerCase())
    ) : true);
    const matchesTypeFilter = typeFilter.length === 0 || typeFilter.includes(filing.type);
    const matchesAuthorityFilter = authorityFilter.length === 0 || authorityFilter.includes(filing.authority);
    const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(filing.status);
    
    return matchesSearch && matchesTypeFilter && matchesAuthorityFilter && matchesStatusFilter &&
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
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="filings" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6] overflow-hidden">
        {/* Main content card - make it full height */}
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          {/* Header section */}
          <div className="pl-4 pr-6 py-4 border-b border-[#E4E5E1]">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                Filings
              </h1>

              {/* Tab switcher on the right */}
              <div className="flex gap-2">
                {tabs.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-2.5 py-1 rounded-md text-[14px] leading-[20px] font-medium font-oracle transition-colors ${
                      activeTab === id 
                        ? 'bg-[#F7F7F6] text-[#1A1A1A]'
                        : 'text-[#646462] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pr-4 pt-3">
              {/* Add space-y-3 to create consistent spacing */}
              <div className="space-y-3">
                {/* Search Row */}
                <div className="flex items-center justify-between">
                  {/* Search Bar */}
                  <div className="w-[320px]">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search..."
                        className="w-full h-[32px] pl-8 pr-3 rounded-lg border border-[#E4E4E4] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] placeholder-[#9A9A99] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none transition-colors"
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
                        className="bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3 h-[28px] rounded-full font-oracle font-[500] text-[14px] leading-[20px] transition-colors border border-[#E4E5E1]"
                      >
                        {selectedCompletedFilings.size > 1 ? 'Download all' : 'Download'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="w-full">
                  {/* Table header - fix padding/margin */}
                  <div className={`grid ${
                    activeTab === 'upcoming'
                      ? 'grid-cols-[2fr_1fr_1fr_1fr_1fr_32px]'
                      : 'grid-cols-[24px_2fr_1fr_1fr_1fr_1fr_32px]'
                  } gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80`}>
                    {/* Only show checkbox in completed tab */}
                    {activeTab === 'completed' && (
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
                    )}

                    {/* Filing name */}
                    <div className="text-[13px] leading-[18px] font-medium font-oracle text-[#646462]">
                      Filing
                    </div>

                    {/* Type */}
                    <div className="text-[13px] leading-[18px] font-medium font-oracle text-[#646462]">
                      <TypeFilter
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        uniqueTypes={uniqueTypes}
                      />
                    </div>

                    {/* Agency */}
                    <div className="text-[13px] leading-[18px] font-medium font-oracle text-[#646462] relative">
                      Agency
                    </div>

                    {/* Status */}
                    <div className="text-[13px] leading-[18px] font-medium font-oracle text-[#646462]">
                      <StatusFilter
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        uniqueStatuses={uniqueStatuses}
                      />
                    </div>

                    {/* Filing Date */}
                    <div className="text-[13px] leading-[18px] font-medium font-oracle text-[#646462] relative">
                      <DateFilter
                        dateRangeFilter={dateRangeFilter}
                        setDateRangeFilter={setDateRangeFilter}
                        label="Filing Date"
                      />
                    </div>

                    {/* Menu */}
                    <div />
                  </div>

                  <div className="divide-y divide-[#E4E5E1]">
                    {filteredFilings.length === 0 ? (
                      // New centered empty state
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-8 h-8 mb-4 text-[#646462]">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="32" 
                            height="32" 
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.984375 5.9863281 A 1.0001 1.0001 0 0 0 11 7 L 11 13 A 1.0001 1.0001 0 1 0 13 13 L 13 7 A 1.0001 1.0001 0 0 0 11.984375 5.9863281 z M 12 16 A 1 1 0 0 0 12 18 A 1 1 0 0 0 12 16 z" />
                          </svg>
                        </div>
                        <h3 className="text-[16px] leading-[24px] font-medium text-[#1A1A1A] mb-1">
                          {searchText ? 'No filings match your search' : 'No filings yet'}
                        </h3>
                        <p className="text-[14px] leading-[20px] text-[#646462]">
                          {searchText 
                            ? 'Try adjusting your search or filters'
                            : `You don't have any ${activeTab === 'upcoming' ? 'upcoming' : 'completed'} filings`
                          }
                        </p>
                      </div>
                    ) : (
                      filteredFilings.map(filing => (
                        <div 
                          key={filing.id}
                          className={`grid ${
                            activeTab === 'upcoming'
                              ? 'grid-cols-[2fr_1fr_1fr_1fr_1fr_32px]'
                              : 'grid-cols-[24px_2fr_1fr_1fr_1fr_1fr_32px]'
                          } gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4`}
                          onClick={() => {
                            setSelectedFiling(filing);
                            setIsModalOpen(true);
                          }}
                          onMouseEnter={() => setHoveredRowId(filing.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                        >
                          {/* Only show checkbox in completed tab */}
                          {activeTab === 'completed' && (
                            <div 
                              className="w-4 relative z-10 flex items-center opacity-0 group-hover:opacity-100 [&:has(input:checked)]:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <div className="relative w-4 h-4">
                                <input
                                  type="checkbox"
                                  className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                                  checked={selectedFilings.has(filing.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
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
                          )}

                          <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                            <span className="block">
                              {filing.name}
                            </span>
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                            {filing.type ? (
                              <span className="inline-block px-2 py-0.5 rounded-[6px] bg-[#F7F7F6] text-[#1A1A1A] font-oracle font-[450] text-[13px] leading-[18px]">
                                {filing.type}
                              </span>
                            ) : '—'}
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                            {filing.authority}
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] font-oracle font-[450] text-[13px] leading-[18px] ${
                              filing.status === 'filed' 
                                ? 'bg-[#B6F2E3] text-[#181818]'
                                : filing.status === 'on_track'
                                  ? 'bg-[#E1EFFF] text-[#181818]'
                                  : filing.status === 'action_needed'
                                    ? 'bg-[#F2B8B6] text-[#181818]'
                                    : ''
                            }`}>
                              {filing.status === 'filed' && (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24"
                                  className="fill-[#181818]"
                                >
                                  <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z" />
                                </svg>
                              )}
                              {filing.status === 'on_track' && (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24"
                                  className="fill-[#181818]"
                                >
                                  <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 12.46875 4.9863281 A 1.0001 1.0001 0 0 0 11.503906 5.9160156 L 11.003906 11.916016 A 1.0001 1.0001 0 0 0 11.417969 12.814453 L 14.917969 15.314453 A 1.0010463 1.0010463 0 0 0 16.082031 13.685547 L 13.042969 11.517578 L 13.496094 6.0839844 A 1.0001 1.0001 0 0 0 12.46875 4.9863281 z" />
                                </svg>
                              )}
                              {filing.status === 'action_needed' && (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24"
                                  className="fill-[#181818]"
                                >
                                  <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.984375 5.9863281 A 1.0001 1.0001 0 0 0 11 7 L 11 13 A 1.0001 1.0001 0 1 0 13 13 L 13 7 A 1.0001 1.0001 0 0 0 11.984375 5.9863281 z M 12 16 A 1 1 0 0 0 12 18 A 1 1 0 0 0 12 16 z" />
                                </svg>
                              )}
                              {formatStatus(filing.status)}
                            </span>
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
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
            </div>
          </div>
        </main>
      </div>
      
      <FilingModal
        filing={selectedFiling}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFiling(null);
        }}
      />
    </div>
  )
} 