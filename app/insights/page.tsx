'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import * as Progress from '@radix-ui/react-progress'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Add types
type Task = {
  id: string;
  date: string;
  task: string;
  type: string;
  status: string;
  responsible: string;
}

type Month = {
  name: string;
  tasks: Task[];
}

// Update the TooltipPayload type
type TooltipPayload = {
  name: string;
  value: number;
  dataKey: string;
  payload: Record<string, number>;
}

// Add helper functions
const getAllTasks = (months: Month[]) => {
  return months.flatMap(month => month.tasks);
};

const getActionNeededTasks = (months: Month[]) => {
  return getAllTasks(months).filter(task => task.status === 'Action needed');
};

const getUpcomingTasks = (months: Month[]) => {
  return getAllTasks(months).filter(task => task.status !== 'Completed');
};

// Add this data near the top of the component
const savingsBreakdownData = [
  {
    name: "Tax Savings",
    "R&D Tax Credit": 35000,
    "Employee Retention Credit": 25000,
    "Home Office Deduction": 12000,
    "Vehicle Expenses": 8500,
    "Professional Development": 4500,
  }
];

export default function InsightsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [isChartVisible, setIsChartVisible] = useState(false);

  // Add useEffect to trigger animation after mount
  useEffect(() => {
    setIsChartVisible(true);
  }, []);

  // Add sample data
  const [months, setMonths] = useState<Month[]>([
    {
      name: 'January 2025',
      tasks: [
        {
          id: 'jan-15-2025',
          date: 'Jan 15, 2025',
          task: 'File Q4 Sales Tax Returns',
          type: 'Sales tax',
          status: 'Action needed',
          responsible: 'Tally'
        },
        {
          id: 'jan-31-2025',
          date: 'Jan 31, 2025',
          task: 'Submit W-2s and 1099s',
          type: 'Corporate tax',
          status: 'On track',
          responsible: 'Payroll'
        }
      ]
    },
    {
      name: 'February 2025',
      tasks: [
        {
          id: 'feb-15-2025',
          date: 'Feb 15, 2025',
          task: 'File Form 941 (Q4 2024)',
          type: 'Corporate tax',
          status: 'Action needed',
          responsible: 'Tally'
        },
        {
          id: 'feb-20-2025',
          date: 'Feb 20, 2025',
          task: 'Review Q1 Tax Strategy',
          type: 'Advisor meeting',
          status: 'On track',
          responsible: 'Tally'
        },
        {
          id: 'feb-28-2025',
          date: 'Feb 28, 2025',
          task: 'Prepare March Sales Tax Returns',
          type: 'Sales tax',
          status: 'Completed',
          responsible: 'Tally'
        }
      ]
    }
  ]);

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="insights" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="px-6 pr-[24px] py-5 border-b border-[#E4E5E1] flex-none">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                Insights
              </h1>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="border-b border-[#E4E5E1]">
            <div className="px-6 flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 text-[14px] leading-[20px] font-medium font-['Inter'] border-b-2 transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-[#1A1A1A] text-[#1A1A1A]' 
                    : 'border-transparent text-[#646462] hover:text-[#1A1A1A]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`py-3 text-[14px] leading-[20px] font-medium font-['Inter'] border-b-2 transition-colors ${
                  activeTab === 'opportunities' 
                    ? 'border-[#1A1A1A] text-[#1A1A1A]' 
                    : 'border-transparent text-[#646462] hover:text-[#1A1A1A]'
                }`}
              >
                Opportunities
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`py-3 text-[14px] leading-[20px] font-medium font-['Inter'] border-b-2 transition-colors ${
                  activeTab === 'compliance' 
                    ? 'border-[#1A1A1A] text-[#1A1A1A]' 
                    : 'border-transparent text-[#646462] hover:text-[#1A1A1A]'
                }`}
              >
                Compliance
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="px-6 pr-[24px] py-4">
                {/* Tax Insights Section */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                      Tax insights
                    </h2>
                  </div>

                  {/* Tax Savings Overview Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] mb-4">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1.5">
                        Estimated tax savings
                        <div className="relative group">
                          <span className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                              <path d="M16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z" />
                            </svg>
                            AI
                          </span>

                          {/* Popover */}
                          <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                            <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                              <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                                <p>This analysis is generated using AI to help identify tax optimization opportunities and potential risks.</p>
                                <p>While we strive for accuracy, please review all suggestions with your tax advisor. AI-generated insights may require professional validation.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </h3>
                    </div>

                    {/* Chart */}
                    <div className="h-[144px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={savingsBreakdownData}
                          margin={{
                            top: 0,
                            right: 30,
                            left: 0,
                            bottom: 10,
                          }}
                        >
                          {/* Remove gradient defs and replace with solid colors */}
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
                                  
                                  return (
                                    <div className="bg-white border border-[#E4E5E1] rounded-lg shadow-sm px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-medium text-[#1A1A1A]">{name}</span>
                                        <span className="text-[13px] text-[#646462]">·</span>
                                        <span className="text-[13px] text-[#1A1A1A]">${value.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  );
                                }
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="R&D Tax Credit" 
                            stackId="a" 
                            fill="#99B3E6" // Slightly darker blue (from #B2C9F9)
                            radius={[0, 0, 0, 0]}
                            onMouseOver={() => setActiveBar("R&D Tax Credit")}
                            onMouseOut={() => setActiveBar(null)}
                            style={{ 
                              opacity: activeBar ? (activeBar === "R&D Tax Credit" ? 1 : 0.2) : 1,
                              transform: isChartVisible ? 'translateX(0)' : 'translateX(-100%)',
                              transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                              transitionDelay: '0ms'
                            }}
                          />
                          <Bar 
                            dataKey="Employee Retention Credit" 
                            stackId="a" 
                            fill="#E699B3" // Slightly darker red (from #F9B2C9)
                            onMouseOver={() => setActiveBar("Employee Retention Credit")}
                            onMouseOut={() => setActiveBar(null)}
                            style={{ 
                              opacity: activeBar ? (activeBar === "Employee Retention Credit" ? 1 : 0.2) : 1,
                              transform: isChartVisible ? 'translateX(0)' : 'translateX(-100%)',
                              transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                              transitionDelay: '100ms'
                            }}
                          />
                          <Bar 
                            dataKey="Home Office Deduction" 
                            stackId="a" 
                            fill="#99CCCC" // Slightly darker green (from #B2D9DE)
                            onMouseOver={() => setActiveBar("Home Office Deduction")}
                            onMouseOut={() => setActiveBar(null)}
                            style={{ opacity: activeBar ? (activeBar === "Home Office Deduction" ? 1 : 0.5) : 1 }}
                          />
                          <Bar 
                            dataKey="Vehicle Expenses" 
                            stackId="a" 
                            fill="#E6B34D" // Slightly darker orange (from #F9C356)
                            onMouseOver={() => setActiveBar("Vehicle Expenses")}
                            onMouseOut={() => setActiveBar(null)}
                            style={{ opacity: activeBar ? (activeBar === "Vehicle Expenses" ? 1 : 0.5) : 1 }}
                          />
                          <Bar 
                            dataKey="Professional Development" 
                            stackId="a" 
                            fill="#B399E6" // Slightly darker purple (from #CFB2F9)
                            radius={[0, 4, 4, 0]}
                            onMouseOver={() => setActiveBar("Professional Development")}
                            onMouseOut={() => setActiveBar(null)}
                            style={{ opacity: activeBar ? (activeBar === "Professional Development" ? 1 : 0.5) : 1 }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Metrics below chart */}
                    <div className="grid grid-cols-3 gap-4 mt-2 mb-4">
                      {/* Est. Tax Savings */}
                      <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 cursor-pointer relative group transition-colors">
                        {/* Ellipsis Button - appears on hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A]">
                              <path fill="currentColor" d="M2 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                            </svg>
                          </button>
                        </div>
                        <div className="text-[14px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                          Est. tax savings
                        </div>
                        <div className="text-[20px] font-medium bg-gradient-to-r from-gray-900 to-gray-900/90 bg-clip-text text-transparent">
                          $85,000
                        </div>
                      </div>

                      {/* Deductions Found */}
                      <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 cursor-pointer relative group transition-colors">
                        {/* Ellipsis Button - appears on hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A]">
                              <path fill="currentColor" d="M2 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                            </svg>
                          </button>
                        </div>
                        <div className="text-[14px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                          Deductions found
                        </div>
                        <div className="text-[20px] font-medium bg-gradient-to-r from-gray-900 to-gray-900/90 bg-clip-text text-transparent">
                          5
                        </div>
                      </div>

                      {/* Available Credits */}
                      <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 cursor-pointer relative group transition-colors">
                        {/* Ellipsis Button - appears on hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A]">
                              <path fill="currentColor" d="M2 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                            </svg>
                          </button>
                        </div>
                        <div className="text-[14px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                          Available credits
                        </div>
                        <div className="text-[20px] font-medium bg-gradient-to-r from-gray-900 to-gray-900/90 bg-clip-text text-transparent">
                          2
                        </div>
                      </div>
                    </div>

                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#646462] flex items-center gap-1.5">
                      <div className="relative group">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24"
                          className="text-[#646462]"
                        >
                          <path 
                            fill="currentColor" 
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                          />
                        </svg>

                        {/* Tooltip popup */}
                        <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                          <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                            <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A]">
                              These insights are calculated based on your financial data, business operations, and industry benchmarks.
                            </div>
                          </div>
                        </div>
                      </div>
                      Based on your current business operations and financial data
                    </div>
                  </div>

                  {/* First Row of Cards */}
                  <div className="grid grid-cols-10 gap-4 mb-4">
                    {/* Tax Strategy Summary Card - 70% width (7 columns) */}
                    <div className="col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1.5">
                          Tax strategy summary
                          <div className="relative group">
                            <span className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help">
                              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                                <path d="M6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z"/>
                              </svg>
                              AI
                            </span>

                            {/* Popover */}
                            <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                              <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                                <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                                  <p>This analysis is generated using AI to help identify tax optimization opportunities and potential risks.</p>
                                  <p>While we strive for accuracy, please review all suggestions with your tax advisor. AI-generated insights may require professional validation.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </h2>
                      </div>

                      <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                        <p>Based on your current business operations and financial data, we've identified several key areas for tax optimization:</p>
                        
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Your effective tax rate of 21.5% is higher than the industry average of 19.2%</li>
                          <li>Potential for additional deductions in equipment depreciation and R&D activities</li>
                          <li>Opportunity to optimize state tax exposure through strategic revenue allocation</li>
                        </ul>

                        <p className="mt-4">Schedule a meeting with your tax advisor to discuss these opportunities in detail.</p>
                      </div>

                      {/* Bottom Button */}
                      <div className="mt-4">
                        <button 
                          className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors"
                        >
                          View full analysis
                        </button>
                      </div>
                    </div>

                    {/* Compliance Health Score Card - 30% width (3 columns) */}
                    <div className="col-span-3 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                          Compliance health score
                        </h2>
                      </div>

                      <div className="flex flex-col items-start">
                        <div className="flex flex-col">
                          <div className="h-[8px] w-[160px] bg-gradient-to-r from-[#3B4CDD] to-[#E8EFFF] rounded-full overflow-hidden mt-[5px]">
                            <div 
                              className="h-full bg-white transition-all duration-500 ml-auto"
                              style={{ width: `${100 - 100}%` }}
                            />
                          </div>
                          <span className="text-[32px] font-semibold text-[#1A1A1A] leading-[1] mt-3">100%</span>
                          <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] mt-2">
                            Your compliance health is excellent. All filings are up to date and accurate.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button 
                          className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors"
                        >
                          View compliance
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Second Row of Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Opportunities Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                          Potential credits
                          <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#FFE4D2] rounded-full text-[11px] font-bold font-['Inter'] text-[#1A1A1A]">
                            2
                          </span>
                          <div className="relative group">
                            <span className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help">
                              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                                <path d="M6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z"/>
                              </svg>
                              AI
                            </span>

                            {/* Popover */}
                            <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                              <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                                <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                                  <p>This analysis is generated using AI to help identify tax optimization opportunities and potential risks.</p>
                                  <p>While we strive for accuracy, please review all suggestions with your tax advisor. AI-generated insights may require professional validation.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </h2>
                      </div>

                      {/* Opportunities Table */}
                      <div className="w-full">
                        {/* Table Headers */}
                        <div className="grid grid-cols-2 gap-4 py-2 border-b border-[#E4E5E1]">
                          <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                            Opportunity
                          </div>
                          <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                            Potential Savings
                          </div>
                        </div>

                        <div className="divide-y divide-[#E4E5E1]">
                          {/* R&D Tax Credit Row */}
                          <div 
                            className="grid grid-cols-2 gap-4 h-[42px] items-center relative group cursor-pointer"
                          >
                            <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                            
                            {/* Chevron */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                              </svg>
                            </div>

                            <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                              <span className="block transition-transform group-hover:translate-x-2">
                                R&D Tax Credit
                              </span>
                            </div>
                            <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                              Est. $35,000
                            </div>
                          </div>

                          {/* Employee Retention Credit Row */}
                          <div 
                            className="grid grid-cols-2 gap-4 h-[42px] items-center relative group cursor-pointer"
                          >
                            <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                            
                            {/* Chevron */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                              </svg>
                            </div>

                            <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                              <span className="block transition-transform group-hover:translate-x-2">
                                Employee Retention Credit
                              </span>
                            </div>
                            <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                              Est. $25,000
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <div className="mt-4">
                        <button 
                          className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors"
                        >
                          View credits
                        </button>
                      </div>
                    </div>

                    {/* Deductions Finder Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                          Potential deductions
                          <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#FFE4D2] rounded-full text-[11px] font-bold font-['Inter'] text-[#1A1A1A]">
                            3
                          </span>
                          <div className="relative group">
                            <span className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help">
                              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                                <path d="M6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z"/>
                              </svg>
                              AI
                            </span>

                            {/* Popover */}
                            <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                              <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                                <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                                  <p>This analysis is generated using AI to help identify potential tax deductions based on your business activities.</p>
                                  <p>While we strive for accuracy, please review all suggestions with your tax advisor. AI-generated insights may require professional validation.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </h2>
                      </div>

                      {/* Table Headers */}
                      <div className="grid grid-cols-2 gap-4 py-2 border-b border-[#E4E5E1]">
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Name
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Potential Deduction
                        </div>
                      </div>

                      <div className="divide-y divide-[#E4E5E1]">
                        {/* Software Expenses Row */}
                        <div className="grid grid-cols-2 gap-4 h-[42px] items-center relative group cursor-pointer">
                          <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                          
                          {/* Chevron */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                            </svg>
                          </div>

                          <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            <span className="block transition-transform group-hover:translate-x-2">
                              Software Expenses
                            </span>
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            Est. $3,200
                          </div>
                        </div>

                        {/* Marketing Costs Row */}
                        <div className="grid grid-cols-2 gap-4 h-[42px] items-center relative group cursor-pointer">
                          <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                          
                          {/* Chevron */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                            </svg>
                          </div>

                          <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            <span className="block transition-transform group-hover:translate-x-2">
                              Marketing Costs
                            </span>
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            Est. $5,800
                          </div>
                        </div>

                        {/* Travel Expenses Row */}
                        <div className="grid grid-cols-2 gap-4 h-[42px] items-center relative group cursor-pointer">
                          <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                          
                          {/* Chevron */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                            </svg>
                          </div>

                          <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            <span className="block transition-transform group-hover:translate-x-2">
                              Travel Expenses
                            </span>
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                            Est. $2,400
                          </div>
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <div className="mt-4">
                        <button 
                          className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors"
                        >
                          View all deductions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="px-6 pr-[24px] py-4">
                {/* Tax Credits Section */}
                <div className="mb-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                        Tax credits
                        <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#FFE4D2] rounded-full text-[11px] font-bold font-['Inter'] text-[#1A1A1A]">
                          2
                        </span>
                        <div className="relative group">
                          <span className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                              <path d="M6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z"/>
                            </svg>
                            AI
                          </span>

                          {/* Popover */}
                          <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                            <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                              <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                                <p>This analysis is generated using AI to help identify tax optimization opportunities and potential risks.</p>
                                <p>While we strive for accuracy, please review all suggestions with your tax advisor. AI-generated insights may require professional validation.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </h2>
                    </div>

                    {/* Table Headers */}
                    <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E4E5E1]">
                      <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                        Credit
                      </div>
                      <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                        Status
                      </div>
                      <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                        Potential Savings
                      </div>
                    </div>

                    <div className="divide-y divide-[#E4E5E1]">
                      {/* R&D Tax Credit Row */}
                      <div className="grid grid-cols-3 gap-4 h-[42px] items-center relative group cursor-pointer">
                        <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                        
                        {/* Chevron */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                          </svg>
                        </div>

                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          <span className="block transition-transform group-hover:translate-x-2">
                            R&D Tax Credit
                          </span>
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Ready to claim
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Est. $35,000
                        </div>
                      </div>

                      {/* Employee Retention Credit Row */}
                      <div className="grid grid-cols-3 gap-4 h-[42px] items-center relative group cursor-pointer">
                        <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                        
                        {/* Chevron */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                          </svg>
                        </div>

                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          <span className="block transition-transform group-hover:translate-x-2">
                            Employee Retention Credit
                          </span>
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Documentation needed
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Est. $25,000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Deductions Section */}
                <div>
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                        Tax deductions
                        <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#FFE4D2] rounded-full text-[11px] font-bold font-['Inter'] text-[#1A1A1A]">
                          3
                        </span>
                        <div className="relative group">
                          <span className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                              <path d="M6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z"/>
                            </svg>
                            AI
                          </span>

                          {/* Popover */}
                          <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                            <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                              <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                                <p>This analysis is generated using AI to help identify tax optimization opportunities and potential risks.</p>
                                <p>While we strive for accuracy, please review all suggestions with your tax advisor. AI-generated insights may require professional validation.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </h2>
                    </div>

                    {/* Table Headers */}
                    <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E4E5E1]">
                      <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                        Deduction
                      </div>
                      <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                        Status
                      </div>
                      <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                        Potential Savings
                      </div>
                    </div>

                    <div className="divide-y divide-[#E4E5E1]">
                      {/* Software Expenses Row */}
                      <div className="grid grid-cols-3 gap-4 h-[42px] items-center relative group cursor-pointer">
                        <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                        
                        {/* Chevron */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                          </svg>
                        </div>

                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          <span className="block transition-transform group-hover:translate-x-2">
                            Software Expenses
                          </span>
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Ready to claim
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Est. $3,200
                        </div>
                      </div>

                      {/* Marketing Costs Row */}
                      <div className="grid grid-cols-3 gap-4 h-[42px] items-center relative group cursor-pointer">
                        <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                        
                        {/* Chevron */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                          </svg>
                        </div>

                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          <span className="block transition-transform group-hover:translate-x-2">
                            Marketing Costs
                          </span>
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Documentation needed
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Est. $5,800
                        </div>
                      </div>

                      {/* Travel Expenses Row */}
                      <div className="grid grid-cols-3 gap-4 h-[42px] items-center relative group cursor-pointer">
                        <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                        
                        {/* Chevron */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="#646462"/>
                          </svg>
                        </div>

                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          <span className="block transition-transform group-hover:translate-x-2">
                            Travel Expenses
                          </span>
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Ready to claim
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                          Est. $2,400
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="px-6 pr-[24px] py-4">
                <div className="bg-[#E6F4EB] border border-[#66CC99] rounded-xl px-4 py-3 mb-4">
                  <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] flex items-center gap-1.5">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24"
                      className="text-[#1A1A1A]"
                    >
                      <path 
                        fill="currentColor" 
                        d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 s 4.4889941 10 10 10 10 -4.4889982 10 -10 S 17.52 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"
                      />
                    </svg>
                    You're fully compliant with all tax requirements
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 