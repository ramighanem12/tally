'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useRef, useEffect } from 'react'
import TypeFilter from "../components/TypeFilter"
import DateFilter from "../components/DateFilter"
import StatusFilter from "../components/StatusFilter"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Insights from '../components/Insights'
import EventModal from "../components/EventModal"
import type { Event } from '../components/EventModal'
import DisclaimerModal from '../components/DisclaimerModal'
import Image from 'next/image'
import { Strategy, strategies, strategyDescriptions, strategySteps, strategyResources } from '@/data/strategies'
import QuarterlyTaxes from '../components/QuarterlyTaxes'
import PeriodFilter from '../components/PeriodFilter'
import PlanSettings from '../components/PlanSettings'
import CheckIns from '../components/CheckIns'
import UpcomingMeeting from '../components/UpcomingMeeting'
import { toast } from 'sonner'
import { generatePdfReport } from '@/app/utils/generatePdfReport'
import Roadmap from '../components/Roadmap'

// Add helper function
const formatStatus = (status: string) => {
  switch(status) {
    case 'filed': return 'Completed';
    case 'on_track': return 'On track';
    case 'action_needed': return 'Action needed';
    default: return status;
  }
};

// Add date formatter helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Calculate counts based on type
const strategiesCount = strategies.filter(s => s.type === 'Strategy').length;  // Should be 4
const deductionsCount = strategies.filter(s => s.type === 'Deduction').length;  // Should be 2
const totalCount = strategies.length;  // Should be 5

// First, let's extract the header content into its own component
const PlanHeader = () => {
  return (
    <div className="px-6 pr-[28px] py-2 border-b border-[#E4E5E1] flex-none bg-white rounded-t-[14px]">
      <div className="flex justify-between items-center h-6">
        <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
          Plan
        </h1>
      </div>
    </div>
  );
};

// Update TabSwitcher to be simpler without icons
const TabSwitcher = ({ 
  tabs, 
  activeTab, 
  onChange 
}: { 
  tabs: Array<{id: string; label: string}>; 
  activeTab: string;
  onChange: (id: string) => void;
}) => (
  <div className="flex gap-6 relative border-b border-[#E4E5E1]">
    {tabs.map(({ id, label }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
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
);

export default function PlanPage() {
  // Add state for active tab
  const [activeTab, setActiveTab] = useState('plan')
  // Add state for plan sub-tab
  const [activePlanTab, setActivePlanTab] = useState('overview')
  const [showGradient, setShowGradient] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('Plan 2024')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [activeEventTab, setActiveEventTab] = useState('all')
  // Add state for search
  const [searchText, setSearchText] = useState('');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  // Add new state for type filter
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  // Add new state for date filters
  const [dateRangeFilter, setDateRangeFilter] = useState<{from: string; to: string}>({ from: '', to: '' });
  // Add new state for status filter
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  // Add new state for chart
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Add the includeDeductions state here with other states
  const [includeDeductions, setIncludeDeductions] = useState(true)
  // Add new state for loading
  const [isAmountLoading, setIsAmountLoading] = useState(false);
  // Add state for modal
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false)
  // Add state for menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Add new state for period filter
  const [periodFilter, setPeriodFilter] = useState<string[]>([]);

  // Get unique periods
  const uniquePeriods = Array.from(new Set(strategies.map(s => s.period)));

  // Move calculateTotalSavings inside the component
  const calculateTotalSavings = () => {
    return strategies
      .filter(strategy => includeDeductions || strategy.type === 'Strategy')
      .reduce((total, strategy) => {
        const amount = Number(strategy.amount.replace(/[$,]/g, ''));
        return total + amount;
      }, 0);
  };

  // Calculate total savings based on selected strategies
  const totalSavings = calculateTotalSavings();

  // Get unique types
  const uniqueTypes = Array.from(new Set(strategies.map(s => s.type)));
  // Get unique statuses
  const uniqueStatuses = Array.from(new Set(strategies.map(s => s.status)));

  // Define main tabs
  const tabs = [
    { id: 'plan', label: 'Plan' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'reviews', label: 'Check-ins' },
    { id: 'insights', label: 'Insights' }
  ]

  // Define plan sub-tabs
  const planTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'strategies', label: 'Strategies' },
    { id: 'deductions', label: 'Deductions' },
    { id: 'quarterly', label: 'Quarterly taxes' },
    { id: 'settings', label: 'Plan settings' }
  ]

  // Add click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Update the filtered strategies logic
  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = searchText ? (
      strategy.name.toLowerCase().includes(searchText.toLowerCase()) ||
      strategy.type.toLowerCase().includes(searchText.toLowerCase())
    ) : true;

    const matchesTypeFilter = typeFilter.length === 0 || typeFilter.includes(strategy.type);
    
    const matchesPeriodFilter = periodFilter.length === 0 || periodFilter.includes(strategy.period);

    const matchesTab = activeEventTab === 'all' || 
      (activeEventTab === 'strategies' && strategy.type === 'Strategy') ||
      (activeEventTab === 'deductions' && strategy.type === 'Deduction');

    const dueDate = new Date(strategy.dueDate);
    
    const matchesDateFilter = (
      (!dateRangeFilter.from || dueDate >= new Date(dateRangeFilter.from)) &&
      (!dateRangeFilter.to || dueDate <= new Date(dateRangeFilter.to))
    );

    const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(strategy.status);

    return matchesSearch && matchesTypeFilter && matchesPeriodFilter && matchesTab && matchesDateFilter && matchesStatusFilter;
  });

  // Add this effect to trigger the animation
  useEffect(() => {
    setIsChartVisible(true);
  }, []);

  const handleEventClick = (strategy: Strategy) => {
    const event: Event = {
      id: strategy.id,
      name: strategy.name,
      type: strategy.type,
      status: strategy.status,
      period: strategy.period,
      dueDate: strategy.dueDate,
      description: strategyDescriptions[strategy.name],
      steps: strategySteps[strategy.name],
      resources: strategyResources[strategy.name],
      notes: '',
      details: {
        estimated_savings: strategy.amount
      }
    };
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Update the planBreakdownData to include all strategies
  const planBreakdownData = [
    {
      name: "Tax Events",
      ...strategies
        .filter(strategy => includeDeductions || strategy.type === 'Strategy')
        .reduce((acc, strategy) => ({
          ...acc,
          [strategy.name]: Number(strategy.amount.replace(/[$,]/g, ''))
        }), {})
    }
  ];

  // Modify the toggle handler to use 500ms instead of 1000ms
  const handleDeductionsToggle = () => {
    setIsAmountLoading(true);
    setIncludeDeductions(!includeDeductions);
    setTimeout(() => {
      setIsAmountLoading(false);
    }, 500);
  };

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

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="plan" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header row with Plan title, dropdown, and tabs */}
          <div className="flex items-center justify-between px-2 py-2 mb-[9px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                  Plan
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
                          Edit plan
                        </button>
                        <button 
                          onClick={() => {
                            // Handle click
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Commented out dropdown */}
              {/* ... existing dropdown code ... */}
            </div>
            
            {/* Tab switcher */}
            <TabSwitcher 
              tabs={[
                { id: 'plan', label: 'Plan' },
                { id: 'roadmap', label: 'Roadmap' },
                { id: 'reviews', label: 'Check-ins' },
                { id: 'insights', label: 'Insights' }
              ]} 
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Show UpcomingMeeting above main card when on reviews tab */}
          {activeTab === 'reviews' && (
            <div className="mb-[9px]">
              <div className="rounded-[14px] overflow-hidden">
                <UpcomingMeeting />
              </div>
            </div>
          )}

          {/* Main content card */}
          <main className="flex-1 rounded-[14px] bg-white/60 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-4">
                {activeTab === 'plan' ? (
                  <div>
                    {/* Separate Plan sub-tabs */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex gap-1.5">
                        {planTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActivePlanTab(tab.id)}
                            className={`px-2.5 py-1 rounded-md text-[13px] leading-[18px] font-medium font-['Inter'] transition-colors ${
                              activePlanTab === tab.id
                                ? 'bg-[#EFEFED] text-[#1A1A1A]'
                                : 'text-[#646462] hover:bg-[#EFEFED] hover:text-[#1A1A1A]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Download report button */}
                      <button
                        onClick={() => {
                          // Show toast immediately
                          toast.success('Downloading report...', {
                            position: 'bottom-right',
                            duration: 4000,
                          });
                          
                          // Delay download by 1.5 seconds
                          setTimeout(() => {
                            generatePdfReport(filteredStrategies);
                          }, 1500);
                        }}
                        className="h-[28px] px-2.5 flex items-center gap-1 rounded-md bg-white border border-[#E4E4E4] text-[13px] leading-[18px] font-medium font-['Inter'] text-[#1A1A1A] hover:bg-[#F7F7F6] transition-colors"
                      >
                        Download report
                      </button>
                    </div>

                    {/* Plan sub-tab content */}
                    {activePlanTab === 'overview' ? (
                      <div>
                        {/* Metrics card */}
                        <div className="border border-[#E4E5E1] rounded-[10px] mb-3 bg-white">
                          <div className="px-3 py-3">
                            <div className="relative flex gap-0">
                              {/* Floating toggle card */}
                              <div className="absolute right-0 top-0 z-10 bg-white shadow-sm border border-[#E4E5E1] rounded-lg px-2 h-[32px] flex items-center gap-2">
                                <button
                                  onClick={handleDeductionsToggle}
                                  className={`relative inline-flex h-[16px] w-[24px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                    includeDeductions ? 'bg-[#1A1A1A]' : 'bg-[#E4E5E1]'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      includeDeductions ? 'translate-x-[8px]' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className="text-[13px] leading-[18px] font-['Inter'] text-[#1A1A1A] font-[500]">
                                  Include deductions
                                </span>
                              </div>

                              {/* Left side - Metric text (without card) */}
                              <div className="w-[240px] relative pt-2 pl-2">
                                <div className="flex items-center gap-1 mb-2">
                                  <h3 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                                    Estimated tax savings
                                  </h3>
                                  <div 
                                    className="relative"
                                    onMouseEnter={(e) => handleTooltipEnter(e, -1)}
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
                                    
                                    {activeTooltip === -1 && (
                                      <div 
                                        className="absolute z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px]"
                                        style={{
                                          top: -8,
                                          left: '50%',
                                          transform: 'translate(-50%, -100%)',
                                          pointerEvents: 'none'
                                        }}
                                      >
                                        <p className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] whitespace-normal">
                                          Total estimated savings from all tax strategies
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="h-[26px]">
                                  {isAmountLoading ? (
                                    <div className="animate-pulse bg-gradient-to-r from-[#F7F7F6] via-[#EFEFED] to-[#F7F7F6] rounded h-[26px] w-[120px]" />
                                  ) : (
                                    <p className="text-[24px] leading-[26px] font-['Inter'] font-[525] text-[#171717]">
                                      ${totalSavings.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right side - Chart */}
                              <div className="flex-1 h-[120px]">
                                <ResponsiveContainer width="100%" height={120}>
                                  <BarChart
                                    layout="vertical"
                                    data={planBreakdownData}
                                    margin={{
                                      top: 0,
                                      right: 30,
                                      left: 0,
                                      bottom: 0,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E5E1" />
                                    <XAxis 
                                      type="number"
                                      axisLine={false}
                                      tickLine={false}
                                      tick={{ 
                                        fill: '#646462',
                                        fontSize: 12,
                                        fontFamily: 'Inter'
                                      }}
                                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    />
                                    <YAxis 
                                      type="category"
                                      dataKey="name" 
                                      axisLine={false}
                                      tickLine={false}
                                      tick={false}
                                      width={20}
                                    />
                                    <Tooltip
                                      cursor={false}
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length > 0) {
                                          const activePayload = payload.find(p => p.dataKey === activeBar);
                                          if (activePayload) {
                                            const name = activePayload.dataKey as string;
                                            const value = activePayload.value as number;
                                            const type = strategies.find(s => s.name === name)?.type === "Deduction" ? "TAX DEDUCTION" : "TAX STRATEGY";
                                            
                                            const color = activePayload.color;
                                            
                                            return (
                                              <div className="bg-[#1A1A1A] rounded-lg shadow-sm px-3 py-2">
                                                <div className="flex flex-col gap-[1px]">
                                                  <span className="text-[11px] font-[600] text-white/60 tracking-wide">{type}</span>
                                                  <div className="flex items-center gap-1">
                                                    <div 
                                                      className="w-2 h-2 rounded-full flex-shrink-0" 
                                                      style={{ backgroundColor: color }}
                                                    />
                                                    <span className="text-[13px] font-medium text-white">{name}</span>
                                                    <span className="text-white/40">•</span>
                                                    <span className="text-[13px] text-white font-medium">${value.toLocaleString()}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                        }
                                        return null;
                                      }}
                                    />
                                    {[
                                      // Show strategies first, sorted by amount
                                      ...strategies
                                        .filter(strategy => strategy.type === 'Strategy')
                                        .sort((a, b) => Number(b.amount.replace(/[$,]/g, '')) - Number(a.amount.replace(/[$,]/g, ''))),
                                      // Then show deductions if includeDeductions is true
                                      ...(includeDeductions ? 
                                        strategies
                                          .filter(strategy => strategy.type === 'Deduction')
                                          .sort((a, b) => Number(b.amount.replace(/[$,]/g, '')) - Number(a.amount.replace(/[$,]/g, '')))
                                        : []
                                      )
                                    ]
                                    .map((strategy, index, array) => {
                                      const isStrategy = strategy.type === 'Strategy';
                                      const strategyIndex = isStrategy ? 
                                        array.filter(s => s.type === 'Strategy').findIndex(s => s.id === strategy.id) :
                                        array.filter(s => s.type === 'Deduction').findIndex(s => s.id === strategy.id);
                                      
                                      return (
                                        <Bar 
                                          key={strategy.id}
                                          dataKey={strategy.name}
                                          stackId="a" 
                                          fill={isStrategy ? 
                                            // Light to dark blue for strategies
                                            ['#E1EFFF', '#93C5FD', '#3B82F6', '#2563EB', '#1D4ED8'][strategyIndex] :
                                            // Light to dark green for deductions
                                            ['#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E'][strategyIndex]
                                          }
                                          radius={index === array.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                                          onMouseOver={() => setActiveBar(strategy.name)}
                                          onMouseOut={() => setActiveBar(null)}
                                          style={{ 
                                            opacity: activeBar ? (activeBar === strategy.name ? 1 : 0.2) : 1,
                                            transform: isChartVisible ? 'translateX(0)' : 'translateX(-100%)',
                                            transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                                            transitionDelay: `${index * 50}ms`
                                          }}
                                        />
                                      );
                                    })}
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border border-[#E4E5E1] rounded-[10px] px-3 py-2 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-1.5">
                              {[
                                { id: 'all', label: 'All events', count: totalCount },
                                { id: 'strategies', label: 'Strategies', count: strategiesCount },
                                { id: 'deductions', label: 'Deductions', count: deductionsCount }
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => setActiveEventTab(tab.id)}
                                  className={`px-2.5 py-1 rounded-md text-[13px] leading-[18px] font-medium font-['Inter'] transition-colors ${
                                    activeEventTab === tab.id
                                      ? 'bg-[#F7F7F6] text-[#1A1A1A]'
                                      : 'text-[#646462] hover:bg-[#F7F7F6] hover:text-[#1A1A1A]'
                                  }`}
                                >
                                  {tab.label} <span className={activeEventTab === tab.id ? 'text-[#646462]' : ''}>{tab.count}</span>
                                </button>
                              ))}
                            </div>
                            <div className="w-[320px] flex gap-2">
                              <div className="relative flex-1">
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
                              
                              {/* Expand button - Commented out
                              <button className="w-[32px] h-[32px] flex items-center justify-center bg-[#F7F7F6] rounded-lg hover:bg-[#EFEFED] transition-colors">
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
                              </button>
                              */}
                            </div>
                          </div>
                          <div className="w-full">
                            {/* Table header */}
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-3 -mx-3 bg-[#F7F7F6]/50">
                              <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] flex items-center gap-1">
                                Event name
                                <div 
                                  className="relative"
                                  onMouseEnter={(e) => handleTooltipEnter(e, -3)}
                                  onMouseLeave={handleTooltipLeave}
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24"
                                    className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                                  >
                                    <path 
                                      fill="currentColor"
                                      d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                                    />
                                  </svg>
                                  
                                  {activeTooltip === -3 && (
                                    <div 
                                      className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                                      style={{
                                        top: tooltipPosition.y - 8,
                                        left: tooltipPosition.x,
                                        transform: 'translate(-50%, -100%)'
                                      }}
                                    >
                                      <p className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] whitespace-normal">
                                        Name of the tax saving strategy or deduction
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462]">
                                <TypeFilter
                                  typeFilter={typeFilter}
                                  setTypeFilter={setTypeFilter}
                                  uniqueTypes={uniqueTypes}
                                />
                              </div>
                              <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462]">
                                <PeriodFilter
                                  periodFilter={periodFilter}
                                  setPeriodFilter={setPeriodFilter}
                                  uniquePeriods={uniquePeriods}
                                />
                              </div>
                              <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462]">
                                <DateFilter
                                  dateRangeFilter={dateRangeFilter}
                                  setDateRangeFilter={setDateRangeFilter}
                                  label="Due date"
                                />
                              </div>
                              <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462]">
                                <StatusFilter
                                  statusFilter={statusFilter}
                                  setStatusFilter={setStatusFilter}
                                  uniqueStatuses={uniqueStatuses}
                                />
                              </div>
                              <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] flex items-center gap-1">
                                Est. amount
                                <div 
                                  className="relative"
                                  onMouseEnter={(e) => handleTooltipEnter(e, -2)}
                                  onMouseLeave={handleTooltipLeave}
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24"
                                    className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
                                  >
                                    <path 
                                      fill="currentColor"
                                      d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                                    />
                                  </svg>
                                  
                                  {activeTooltip === -2 && (
                                    <div 
                                      className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                                      style={{
                                        top: tooltipPosition.y - 8,
                                        left: tooltipPosition.x,
                                        transform: 'translate(-50%, -100%)'
                                      }}
                                    >
                                      <p className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] whitespace-normal">
                                        Estimated tax savings from this strategy
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Table rows */}
                            <div className="divide-y divide-[#E4E5E1]">
                              {filteredStrategies.length === 0 ? (
                                <div className="py-4 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                                  {searchText ? 
                                    'No events match your search' : 
                                    'You haven\'t added any events'
                                  }
                                </div>
                              ) : (
                                filteredStrategies.map(strategy => (
                                  <div 
                                    key={strategy.id}
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 h-[42px] items-center relative group cursor-pointer"
                                    onMouseEnter={() => setHoveredRowId(strategy.id)}
                                    onMouseLeave={() => setHoveredRowId(null)}
                                    onClick={() => handleEventClick(strategy)}
                                  >
                                    {/* Hover background */}
                                    <div className="absolute inset-x-[-8px] h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F7F7F6] transition-colors" />

                                    {/* Strategy name */}
                                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                      {strategy.name}
                                    </div>

                                    {/* Type */}
                                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                      <span className="inline-block px-2 py-0.5 rounded-[6px] bg-[#EFEFED] text-[#1A1A1A] font-['Inter'] font-[450] text-[13px] leading-[18px]">
                                        {strategy.type}
                                      </span>
                                    </div>

                                    {/* Period */}
                                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                      {strategy.period}
                                    </div>

                                    {/* Due date */}
                                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                      {formatDate(strategy.dueDate)}
                                    </div>

                                    {/* Status */}
                                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                      <span className={`inline-block px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] ${
                                        strategy.status === 'filed' 
                                          ? 'bg-[#B6F2E3] text-[#181818]'
                                          : strategy.status === 'on_track'
                                            ? 'bg-[#E1EFFF] text-[#181818]'
                                          : strategy.status === 'action_needed'
                                            ? 'bg-[#F2B8B6] text-[#181818]'
                                          : ''
                                      }`}>
                                        {formatStatus(strategy.status)}
                                      </span>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                      {strategy.amount}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* After the table card, before the Insights section */}
                        <div className="mt-3">
                          <p className="text-[12px] leading-[18px] font-['Inter'] font-[450] text-[#858585]">
                            All tax planning, strategies, advice and recommendations in this plan are based on the taxpayer's available tax return data, information disclosed to us, and current tax law. Tax laws can and do change frequently. Federal, state, local, payroll, property and other taxes often overlap and involve complexities that rarely yield a single best strategy. Effective tax planning is a lifelong process. It requires regular updates to review the taxpayer's goals, life changes, investments, businesses, changes in income, pre-tax opportunities, retirement planning, state and local taxation, and more. <button onClick={() => setIsDisclaimerModalOpen(true)} className="text-[#1A1A1A] underline inline">View complete disclaimer</button>.
                          </p>
                        </div>
                      </div>
                    ) : activePlanTab === 'strategies' ? (
                      <div>
                        <div className="border border-[#E4E5E1] rounded-[10px] px-3 py-4">
                          <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                            Strategies content goes here
                          </p>
                        </div>
                      </div>
                    ) : activePlanTab === 'deductions' ? (
                      <div>
                        <div className="border border-[#E4E5E1] rounded-[10px] px-3 py-4">
                          <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                            Deductions content goes here
                          </p>
                        </div>
                      </div>
                    ) : activePlanTab === 'quarterly' ? (
                      <QuarterlyTaxes />
                    ) : activePlanTab === 'settings' ? (
                      <PlanSettings />
                    ) : (
                      <div>
                        <div className="border border-[#E4E5E1] rounded-[10px] px-3 py-4">
                          <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                            Plan settings content goes here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'roadmap' ? (
                  <Roadmap />
                ) : activeTab === 'reviews' ? (
                  <CheckIns />
                ) : (
                  <Insights />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      <EventModal 
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <DisclaimerModal 
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
      />
    </div>
  )
} 