'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useRef, useEffect } from 'react'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Layer, PieChart, Pie, Cell } from 'recharts'
import EventModal from "../components/EventModal"
import type { Event } from '../components/EventModal'
import DisclaimerModal from '../components/DisclaimerModal'
import { Strategy, strategies, strategyDescriptions, strategySteps, strategyResources } from '@/data/strategies'
import QuarterlyTaxes from '../components/QuarterlyTaxes'
import PlanSettings from '../components/PlanSettings'
import { toast } from 'sonner'
import { generatePdfReport } from '@/app/utils/generatePdfReport'
import StrategiesTab from '@/app/components/StrategiesTab'

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
        <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
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
        <span className="text-[14px] leading-[20px] font-medium font-oracle">
          {label}
        </span>
        {activeTab === id && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A] rounded-t-full" />
        )}
      </button>
    ))}
  </div>
);

// First, let's fix the type error by adding a proper type for the tooltip payload
type CustomTooltipPayload = {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
    type: string;
  };
  index: number;
};

// First, add this new type near the top with other types
type DonutSegment = {
  name: string;
  value: number;
  type: string;
  startAngle?: number;
  endAngle?: number;
};

// Add this custom label component near the top of the file
const CenterLabel = ({ viewBox, activeBar, totalSavings, data }: any) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-oracle font-medium"
        style={{ fontSize: '20px', fill: '#1A1A1A' }}
      >
        ${activeBar ? 
          data.find((item: any) => item.name === activeBar)?.value.toLocaleString() :
          totalSavings.toLocaleString()
        }
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-oracle"
        style={{ fontSize: '14px', fill: '#646462' }}
      >
        {activeBar || 'Total savings'}
      </text>
    </g>
  );
};

// Update the MetricsCards component
const MetricsCards = ({ includeDeductions }: { includeDeductions: boolean }) => {
  // Calculate completed events count
  const completedCount = strategies.filter(s => s.status === 'filed').length;
  // Calculate total tax savings (always including both strategies and deductions)
  const taxSavings = strategies.reduce((total, strategy) => {
    const amount = Number(strategy.amount.replace(/[$,]/g, ''));
    return total + amount;
  }, 0);
  // Calculate progress percentage
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  // Calculate outstanding tasks
  const outstandingTasks = totalCount - completedCount;

  return (
    <div className="grid grid-cols-4 gap-4 mb-3">
      {/* Estimated Tax Savings Card - without button */}
      <div className="bg-white rounded-[14px] px-4 py-5 relative">
        <div className="text-[14px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-1">
          Estimated tax savings
        </div>
        <div className="text-[24px] leading-[32px] font-medium text-[#1A1A1A]">
          ${taxSavings.toLocaleString()}
        </div>
      </div>

      {/* Deductions Found Card - keep button */}
      <div className="bg-white rounded-[14px] px-4 py-5 relative">
        <button className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#F7F7F6] hover:bg-[#EFEFED] transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24"
            className="text-[#1A1A1A]"
          >
            <path 
              fill="currentColor"
              d="M 13.990234 3.9902344 A 1.0001 1.0001 0 0 0 13.292969 5.7070312 L 18.585938 11 L 3 11 A 1.0001 1.0001 0 1 0 3 13 L 18.585938 13 L 13.292969 18.292969 A 1.0001 1.0001 0 1 0 14.707031 19.707031 L 21.707031 12.707031 A 1.0001 1.0001 0 0 0 21.707031 11.292969 L 14.707031 4.2929688 A 1.0001 1.0001 0 0 0 13.990234 3.9902344 z"
            />
          </svg>
        </button>
        <div className="text-[14px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-1">
          Deductions found
        </div>
        <div className="text-[24px] leading-[32px] font-medium text-[#1A1A1A]">
          {deductionsCount}
        </div>
      </div>

      {/* Action Plan Progress Card */}
      <div className="bg-white rounded-[14px] px-4 py-5 relative">
        <button className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#F7F7F6] hover:bg-[#EFEFED] transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24"
            className="text-[#1A1A1A]"
          >
            <path 
              fill="currentColor"
              d="M 13.990234 3.9902344 A 1.0001 1.0001 0 0 0 13.292969 5.7070312 L 18.585938 11 L 3 11 A 1.0001 1.0001 0 1 0 3 13 L 18.585938 13 L 13.292969 18.292969 A 1.0001 1.0001 0 1 0 14.707031 19.707031 L 21.707031 12.707031 A 1.0001 1.0001 0 0 0 21.707031 11.292969 L 14.707031 4.2929688 A 1.0001 1.0001 0 0 0 13.990234 3.9902344 z"
            />
          </svg>
        </button>
        <div className="text-[14px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-1">
          Action plan progress
        </div>
        <div className="text-[24px] leading-[32px] font-medium text-[#1A1A1A]">
          {progressPercentage}%
        </div>
      </div>

      {/* Outstanding Action Items Card */}
      <div className="bg-white rounded-[14px] px-4 py-5 relative">
        <button className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#F7F7F6] hover:bg-[#EFEFED] transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24"
            className="text-[#1A1A1A]"
          >
            <path 
              fill="currentColor"
              d="M 13.990234 3.9902344 A 1.0001 1.0001 0 0 0 13.292969 5.7070312 L 18.585938 11 L 3 11 A 1.0001 1.0001 0 1 0 3 13 L 18.585938 13 L 13.292969 18.292969 A 1.0001 1.0001 0 1 0 14.707031 19.707031 L 21.707031 12.707031 A 1.0001 1.0001 0 0 0 21.707031 11.292969 L 14.707031 4.2929688 A 1.0001 1.0001 0 0 0 13.990234 3.9902344 z"
            />
          </svg>
        </button>
        <div className="text-[14px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-1">
          Outstanding action items
        </div>
        <div className="text-[24px] leading-[32px] font-medium text-[#1A1A1A]">
          {outstandingTasks}
        </div>
      </div>
    </div>
  );
};

// Add this helper function to convert strategy to event
const strategyToEvent = (strategy: Strategy): Event => ({
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
});

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
    { id: 'roadmap', label: 'Roadmap' }
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
  const filteredStrategies = strategies
    .filter(strategy => {
      // Only include items of type 'Strategy'
      const isStrategy = strategy.type === 'Strategy';
      
      const matchesSearch = searchText ? (
        strategy.name.toLowerCase().includes(searchText.toLowerCase()) ||
        strategy.type.toLowerCase().includes(searchText.toLowerCase())
      ) : true;
      
      const matchesTypeFilter = typeFilter.length === 0 || typeFilter.includes(strategy.type);
      const matchesPeriodFilter = periodFilter.length === 0 || periodFilter.includes(strategy.period);
      const matchesDateFilter = (
        (!dateRangeFilter.from || new Date(strategy.dueDate) >= new Date(dateRangeFilter.from)) &&
        (!dateRangeFilter.to || new Date(strategy.dueDate) <= new Date(dateRangeFilter.to))
      );
      const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(strategy.status);

      return isStrategy && matchesSearch && matchesTypeFilter && matchesPeriodFilter && matchesDateFilter && matchesStatusFilter;
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

  // Update the prepareDonutData function to preserve segment angles
  const prepareDonutData = (strategies: Strategy[], includeDeductions: boolean): DonutSegment[] => {
    const data = strategies
      .filter(strategy => includeDeductions || strategy.type === 'Strategy')
      .map(strategy => ({
        name: strategy.name,
        value: Number(strategy.amount.replace(/[$,]/g, '')),
        type: strategy.type,
        startAngle: 0,
        endAngle: 0
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate angles
    let currentAngle = 0;
    return data.map(item => {
      const angle = (item.value / total) * 360;
      const segment = {
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + angle
      };
      currentAngle += angle;
      return segment;
    });
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="plan" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6] overflow-auto">
        {/* Plan header card */}
        <div className="mb-3 rounded-[14px] overflow-hidden">
          {/* Top half - fully opaque */}
          <div className={`bg-white pl-4 pr-6 py-4 ${activeTab === 'plan' ? 'border-b border-[#E4E5E1]' : ''}`}>
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                Plan
              </h1>

              {/* Main tabs */}
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
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom half - semi-transparent at 75% */}
          {activeTab === 'plan' && (
            <div className="bg-white/75 pl-4 pr-6 py-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                  {planTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePlanTab(tab.id)}
                      className={`px-2.5 py-1 rounded-md text-[13px] leading-[18px] font-medium font-oracle transition-colors ${
                        activePlanTab === tab.id
                          ? 'bg-[#EFEFED] text-[#1A1A1A]'
                          : 'text-[#646462] hover:bg-[#EFEFED] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Download button - updated style */}
                <button 
                  onClick={() => {
                    toast.success('Downloading report...', {
                      position: 'bottom-right',
                      duration: 4000,
                    });
                    setTimeout(() => {
                      generatePdfReport(filteredStrategies);
                    }, 1500);
                  }}
                  className="h-[28px] px-3 flex items-center gap-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[13px] leading-[18px] font-medium font-oracle transition-colors"
                >
                  Download report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add MetricsCards component here with includeDeductions prop */}
        {activeTab === 'plan' && activePlanTab === 'overview' && (
          <MetricsCards includeDeductions={includeDeductions} />
        )}

        {/* Main content area */}
        {activeTab === 'plan' ? (
          <>
            {activePlanTab === 'overview' ? (
              <>
                {/* Estimated tax savings card - only shown in overview */}
                <div className="mb-3 rounded-[14px] bg-white">
                  <div className="px-6 py-5">
                    {/* Estimated tax savings content */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
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
                              <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                                Total estimated savings from all tax strategies
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Include deductions toggle moved to top right */}
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] leading-[18px] font-oracle text-[#1A1A1A] font-[500]">
                          Include deductions
                        </span>
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
                      </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="flex gap-6">
                      {/* Donut Chart - moved to left */}
                      <div className="h-[275px] w-[275px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareDonutData(strategies, includeDeductions)}
                              cx="50%"
                              cy="50%"
                              innerRadius={82}
                              outerRadius={110}
                              paddingAngle={2}
                              dataKey="value"
                              onMouseEnter={(data, index) => setActiveBar(data.name)}
                              onMouseLeave={() => {
                                if (!isModalOpen) {
                                  setActiveBar(null);
                                }
                              }}
                              animationBegin={0}
                              animationDuration={500}
                              animationEasing="ease-out"
                            >
                              {prepareDonutData(strategies, includeDeductions).map((entry, index, array) => {
                                // Get separate indices for strategies and deductions
                                const strategyIndex = array
                                  .filter(item => item.type === 'Strategy')
                                  .findIndex(item => item.name === entry.name);
                                const deductionIndex = array
                                  .filter(item => item.type === 'Deduction')
                                  .findIndex(item => item.name === entry.name);

                                return (
                                  <Cell
                                    key={`cell-${entry.name}`}
                                    fill={entry.type === 'Strategy' ? 
                                      ['#E1EFFF', '#93C5FD', '#3B82F6', '#2563EB', '#1D4ED8'][strategyIndex] :
                                      ['#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E'][deductionIndex]
                                    }
                                    style={{ 
                                      opacity: activeBar ? (activeBar === entry.name ? 1 : 0.15) : 1,
                                      transition: 'opacity 200ms ease-in-out, fill 500ms ease-out'
                                    }}
                                  />
                                );
                              })}
                            </Pie>

                            {/* Center text using absolute positioning */}
                            <foreignObject x="0" y="0" width="100%" height="100%" style={{ pointerEvents: 'none' }}>
                              <div className="h-full w-full flex flex-col items-center justify-center" style={{ pointerEvents: 'none' }}>
                                <p className="text-[20px] font-oracle font-medium text-[#1A1A1A] text-center">
                                  ${activeBar ? 
                                    prepareDonutData(strategies, includeDeductions)
                                      .find(item => item.name === activeBar)?.value
                                      .toLocaleString() :
                                    totalSavings.toLocaleString()
                                  }
                                </p>
                                <p className="text-[14px] font-oracle text-[#646462] text-center mt-1">
                                  {activeBar || 'Total savings'}
                                </p>
                              </div>
                            </foreignObject>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend on the right */}
                      <div className="grid grid-cols-3 gap-x-1 gap-y-2 self-start pt-4 flex-1 pl-8">
                        {prepareDonutData(strategies, includeDeductions).map((item, index, array) => {
                          const strategyIndex = array
                            .filter(i => i.type === 'Strategy')
                            .findIndex(i => i.name === item.name);
                          const deductionIndex = array
                            .filter(i => i.type === 'Deduction')
                            .findIndex(i => i.name === item.name);

                          // Calculate percentage
                          const total = array.reduce((sum, curr) => sum + curr.value, 0);
                          const percentage = ((item.value / total) * 100).toFixed(0);

                          return (
                            <div 
                              key={item.name} 
                              className={`flex flex-col gap-1 p-2 rounded-lg hover:bg-[#EDF1F1] transition-colors cursor-pointer ${
                                activeBar === item.name ? 'bg-[#EDF1F1]' : ''
                              }`}
                              onMouseEnter={() => setActiveBar(item.name)}
                              onMouseLeave={() => {
                                if (!isModalOpen) {
                                  setActiveBar(null);
                                }
                              }}
                              onClick={() => {
                                handleEventClick(strategies.find(s => s.name === item.name) as Strategy);
                                setActiveBar(item.name);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ 
                                    backgroundColor: item.type === 'Strategy' ? 
                                      ['#E1EFFF', '#93C5FD', '#3B82F6', '#2563EB', '#1D4ED8'][strategyIndex] :
                                      ['#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E'][deductionIndex],
                                    opacity: activeBar ? (activeBar === item.name ? 1 : 0.15) : 1,
                                    transition: 'opacity 200ms ease-in-out'
                                  }}
                                />
                                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                  {item.name}
                                </span>
                              </div>
                              <div className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] pl-5 font-[500]">
                                ${item.value.toLocaleString()} ({percentage}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update disclaimer text styling to match QuarterlyTaxes */}
                <div className="mt-3">
                  <p className="text-[12px] leading-[18px] font-oracle font-[450] text-[#858585]">
                    All tax planning, strategies, advice and recommendations in this plan are based on the taxpayer's available tax return data,
                    information disclosed to us, and current tax law. Tax laws can and do change frequently. Federal, state, local, payroll, property and
                    other taxes often overlap and involve complexities that rarely yield a single best strategy. Effective tax planning is a lifelong process. It
                    requires regular updates to review the taxpayer's goals, life changes, investments, businesses, changes in income, pre-tax
                    opportunities, retirement planning, state and local taxation, and more.{' '}
                    <button onClick={() => setIsDisclaimerModalOpen(true)} className="text-[#1A1A1A] underline inline">
                      View complete disclaimer
                    </button>.
                  </p>
                </div>
              </>
            ) : activePlanTab === 'strategies' ? (
              <>
                <StrategiesTab 
                  onEventClick={(event: Event) => {
                    setSelectedEvent(event);
                    setIsModalOpen(true);
                  }}
                  setActiveBar={setActiveBar}
                />
                {/* Disclaimer text - moved outside the white card */}
                <div className="mt-3">
                  <p className="text-[12px] leading-[18px] font-oracle font-[450] text-[#858585]">
                    All tax planning, strategies, advice and recommendations in this plan are based on the taxpayer's available tax return data,
                    information disclosed to us, and current tax law. Tax laws can and do change frequently. Federal, state, local, payroll, property and
                    other taxes often overlap and involve complexities that rarely yield a single best strategy. Effective tax planning is a lifelong process. It
                    requires regular updates to review the taxpayer's goals, life changes, investments, businesses, changes in income, pre-tax
                    opportunities, retirement planning, state and local taxation, and more.{' '}
                    <button onClick={() => setIsDisclaimerModalOpen(true)} className="text-[#1A1A1A] underline inline">
                      View complete disclaimer
                    </button>.
                  </p>
                </div>
              </>
            ) : activePlanTab === 'deductions' ? (
              <div className="border border-[#E4E5E1] rounded-[10px] px-3 py-4">
                <p>Deductions content goes here</p>
              </div>
            ) : activePlanTab === 'quarterly' ? (
              <QuarterlyTaxes />
            ) : (
              <PlanSettings />
            )}
          </>
        ) : (
          <Roadmap />
        )}
      </div>
      <EventModal 
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveBar(null);
        }}
      />
      <DisclaimerModal 
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
      />
    </div>
  )
} 