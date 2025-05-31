'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import CreateEngagementModal from '../components/CreateEngagementModal'

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

interface EngagementRow {
  id: string
  client: string
  serviceTypes: Array<{
    id: string
    name: string
  }>
  serviceLevel: string // renamed from serviceType
  status: string
  files: string
  updated: string
}

export default function EngagementsPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Add state for checkbox selections
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Add this near the top with other state declarations
  const [activeTab, setActiveTab] = useState<'all' | 'needs-action' | 'active' | 'closed'>('all');

  // Add these at the top with other state declarations
  const allTabRef = useRef<HTMLButtonElement>(null);
  const needsActionTabRef = useRef<HTMLButtonElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const closedTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update the sample data to give all rows Bookkeeping
  const rows: EngagementRow[] = [
    { 
      id: '1', 
      client: 'Acme Corporation',
      serviceTypes: [
        { id: 'bookkeeping', name: 'Bookkeeping' },
        { id: 'tax-strategy', name: 'Tax strategy' }
      ],
      serviceLevel: 'Monthly',
      status: 'Closed', 
      files: '24 files', 
      updated: 'Just now' 
    },
    { 
      id: '2', 
      client: 'Globex Industries',
      serviceTypes: [
        { id: 'bookkeeping', name: 'Bookkeeping' },
        { id: 'tax-preparation', name: 'Tax preparation' }
      ],
      serviceLevel: 'Weekly',
      status: 'Needs action', 
      files: '12 files', 
      updated: '2h ago' 
    },
    { 
      id: '3', 
      client: 'Wayne Enterprises',
      serviceTypes: [
        { id: 'bookkeeping', name: 'Bookkeeping' }
      ],
      serviceLevel: 'Quarterly',
      status: 'Active', 
      files: '8 files', 
      updated: 'Today' 
    },
    { 
      id: '4', 
      client: 'Stark Industries',
      serviceTypes: [
        { id: 'bookkeeping', name: 'Bookkeeping' }
      ],
      serviceLevel: 'Bi-weekly',
      status: 'Needs action', 
      files: '31 files', 
      updated: 'Yesterday' 
    },
    { 
      id: '5', 
      client: 'Umbrella Corporation',
      serviceTypes: [
        { id: 'bookkeeping', name: 'Bookkeeping' }
      ],
      serviceLevel: 'Annual',
      status: 'Active', 
      files: '15 files', 
      updated: 'Last week' 
    },
    { 
      id: '6', 
      client: 'Cyberdyne Systems',
      serviceTypes: [
        { id: 'bookkeeping', name: 'Bookkeeping' }
      ],
      serviceLevel: 'Semi-annual',
      status: 'Closed', 
      files: '19 files', 
      updated: '2 weeks ago' 
    }
  ];

  // Add this function to get the dot color based on service type
  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      'Weekly': '#FF6B6B',      // Red
      'Bi-weekly': '#4ECDC4',   // Teal
      'Monthly': '#45B7D1',     // Blue
      'Quarterly': '#96CEB4',   // Green
      'Semi-annual': '#FFEEAD', // Yellow
      'Annual': '#D4A5A5'       // Pink
    };
    return colors[serviceType as keyof typeof colors] || '#9CA3AF';
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add this effect to update indicator position
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

  // Add this new function near other handlers
  const handleArchiveSelected = () => {
    console.log('Archiving:', Array.from(selectedRows));
    // TODO: Implement archive functionality
  };

  // Add this state near other state declarations
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="engagements" />
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
                  Engagements
                </h1>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add new engagement
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="px-4 pt-3 flex gap-6 border-b border-[#E4E5E1] relative">
            {/* Sliding indicator */}
            <div 
              className="absolute bottom-0 h-[2px] bg-[#1A1A1A] transition-all duration-150 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width
              }}
            />
            
            <button 
              ref={allTabRef}
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-[15px] leading-[20px] font-oracle ${
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
              className={`pb-3 text-[15px] leading-[20px] font-oracle ${
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
              className={`pb-3 text-[15px] leading-[20px] font-oracle ${
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
              className={`pb-3 text-[15px] leading-[20px] font-oracle ${
                activeTab === 'closed'
                  ? 'text-[#1A1A1A] font-medium'
                  : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
              }`}
            >
              Closed
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[48px]" />
                <col className="w-[25%]" />
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[12.5%]" />
                <col className="w-[12.5%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#E4E5E1]">
                  <th className="pl-4 py-3">
                    <CustomCheckbox 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left"></th>
                  <th className="text-left"></th>
                  <th className="text-left"></th>
                  <th className="text-left"></th>
                  <th className="pr-6 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter(row => 
                    activeTab === 'all' || 
                    (activeTab === 'needs-action' && row.status === 'Needs action') ||
                    (activeTab === 'active' && row.status === 'Active') ||
                    (activeTab === 'closed' && row.status === 'Closed')
                  )
                  .map(row => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-[#F9FAFB] border-b border-[#E4E5E1] group"
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
                        {row.client}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {row.serviceTypes.slice(0, 2).map(type => (
                            <div 
                              key={type.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F3F6F6] border border-[#E4E5E1]"
                            >
                              <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                {type.name}
                              </span>
                            </div>
                          ))}
                          {row.serviceTypes.length > 2 && (
                            <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F3F6F6] border border-[#E4E5E1]">
                              <span className="text-[14px] leading-[20px] font-oracle text-[#6B7280]">
                                +{row.serviceTypes.length - 2}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-md border border-[#E4E5E1] bg-white">
                          <div 
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: getServiceTypeColor(row.serviceLevel) }}
                          />
                          <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                            {row.serviceLevel}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-[14.5px] leading-[20px] font-oracle text-[#1A1A1A]">
                        {row.status}
                      </td>
                      <td className="pr-6 py-3 text-[14.5px] leading-[20px] font-oracle text-[#1A1A1A]">
                        {row.updated}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {selectedRows.size > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] border border-[#E4E5E1] py-2.5 px-3 flex items-center gap-4 max-w-[90%] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#F3F6F6] flex items-center justify-center">
                  <span className="text-[13px] leading-[18px] font-medium font-oracle text-[#1A1A1A]">
                    {selectedRows.size}
                  </span>
                </div>
                <span className="text-[14px] leading-[20px] font-oracle text-[#4B5563]">
                  {selectedRows.size === 1 ? 'engagement' : 'engagements'} selected
                </span>
              </div>
              <div className="h-4 w-[1px] bg-[#E4E5E1]" />
              <button
                onClick={handleArchiveSelected}
                className="flex items-center gap-1.5 text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] hover:text-[#41629E] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M14 5.33333V13.3333C14 13.687 13.8595 14.0261 13.6095 14.2761C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.687 2 13.3333V5.33333M5.33333 7.33333L8 10M8 10L10.6667 7.33333M8 10V2" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Archive
              </button>
            </div>
          )}

          <CreateEngagementModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </main>
      </div>
    </div>
  )
} 