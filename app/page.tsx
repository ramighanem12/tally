'use client'
import CopilotNavigation from "./components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TallyLogo } from "./components/TallyLogo"
import { useDocumentRequests } from '@/contexts/DocumentRequestsContext'
import { supabase } from '@/lib/supabase'

// Keep just the Task type we need for plan items
type Task = {
  id: string;
  date: string;
  task: string;
  type: string;
  status: string;
  responsible: string;
}

// Add this type near the top with other types
type DocumentRequest = {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'overdue' | 'completed';
  created_at: string;
  due_date: string | null;
};

// Update the integrations array by removing Gusto
const integrations = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync transactions, invoices, and bills automatically',
    icon: '/quickbooks.svg',
    status: 'connected',
    lastSync: '2024-02-20T15:30:00Z',
    hasError: false
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Import accounting data and financial reports',
    icon: '/xero-svgrepo-com.svg',
    status: 'connected',
    lastSync: '2024-02-20T15:30:00Z',
    hasError: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Sync payment processing and transaction data',
    icon: '/stripe-v2-svgrepo-com.svg',
    status: 'connected',
    lastSync: '2024-02-20T15:30:00Z',
    hasError: false
  },
  {
    id: 'rippling',
    name: 'Rippling',
    description: 'Sync payroll data and employee tax forms',
    icon: '/ripplingcircle.svg',
    status: 'connected',
    lastSync: '2024-02-20T15:30:00Z',
    hasError: false
  }
] as const;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Remitting':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Processing registration':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Exposed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Approaching exposure':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Not exposed':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const getRelativeDueDate = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Reset hours to compare just the dates
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);

  const diffTime = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const absDiff = Math.abs(diffTime);
  
  if (diffTime < 0) return `Overdue by ${absDiff} ${absDiff === 1 ? 'day' : 'days'}`;
  if (diffTime === 0) return 'Due today';
  if (diffTime === 1) return 'Due tomorrow';
  if (diffTime <= 7) return `Due in ${diffTime} ${diffTime === 1 ? 'day' : 'days'}`;
  return 'Due next week';
};

const salesData = [
  { month: 'Jan', sales: 98420 },
  { month: 'Feb', sales: 115340 },
  { month: 'Mar', sales: 89678 },
  { month: 'Apr', sales: 92234 },
  { month: 'May', sales: 132789 },
  { month: 'Jun', sales: 128234 },
  { month: 'Jul', sales: 108567 },
  { month: 'Aug', sales: 142345 },
  { month: 'Sep', sales: 124293 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        <p className="text-sm font-medium text-gray-900">{label} 2024</p>
        <p className="text-sm font-medium text-gray-900">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// Helper function to get ALL upcoming filings count
const getUpcomingFilingsCount = () => {
  // From plan/page.tsx - March and April tasks that aren't completed
  return 6; // Total of non-completed tasks from March and April
};

// Helper function to get visible upcoming filings (limit 3)
const getUpcomingFilings = () => {
  return [
    {
      id: 'mar-15-2025',
      date: 'Mar 15, 2025',
      task: 'Q1 Estimated Tax Payment',
      type: 'Estimated payments',
      status: 'On track',
      responsible: 'Tally'
    },
    {
      id: 'mar-31-2025',
      date: 'Mar 31, 2025',
      task: 'Q1 Sales Tax Returns',
      type: 'Sales tax',
      status: 'Action needed',
      responsible: 'Tally'
    },
    {
      id: 'mar-31-2025-2',
      date: 'Mar 31, 2025',
      task: 'Form 941 (Q1)',
      type: 'Corporate tax',
      status: 'On track',
      responsible: 'Tally'
    }
  ];
};

export default function AppPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [requestedDocuments, setRequestedDocuments] = useState<DocumentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  useEffect(() => {
    // Simulate loading delay for both metrics and tables
    setTimeout(() => {
      setIsLoadingMetrics(false);
      setIsLoadingTables(false);
    }, 1500);
  }, []);

  // Loading placeholder for table rows
  const LoadingRow = ({ cols = 3 }: { cols?: number }) => (
    <div className={`grid grid-cols-${cols} gap-4 h-[42px] items-center`}>
      {Array(cols).fill(0).map((_, i) => (
        <div key={i} className="h-5 bg-[#F0F1EF] rounded-lg animate-pulse" />
      ))}
    </div>
  );

  // Add the helper function to check if a document is late
  const isDocumentLate = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Add useEffect to fetch document requests
  useEffect(() => {
    async function fetchDocumentRequests() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('document_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Update status for overdue items and sort by due_date
        const updatedData = (data as DocumentRequest[])
          .map(request => ({
            ...request,
            status: isDocumentLate(request.due_date) ? 'overdue' : request.status
          }))
          .sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          });

        setRequestedDocuments(updatedData);
      } catch (error) {
        console.error('Error fetching document requests:', error);
      } finally {
        setIsLoadingRequests(false);
      }
    }

    fetchDocumentRequests();
  }, [user]);

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="home" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="px-6 pr-[24px] py-5 border-b border-[#E4E5E1] flex-none">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                Home
              </h1>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              {/* Expert Consultation Card - Commented out for now */}
              {/* {showAdvisorBanner && (
                <div 
                  className={`transform transition-all duration-300 ease-out
                    ${isAdvisorBannerClosing ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}
                >
                  <div className="bg-[#F0F0F0] rounded-xl p-6 relative mb-4">
                    <button 
                      className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#E4E5E1] transition-colors"
                      onClick={dismissAdvisorBanner}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24"
                        className="text-[#1A1A1A]"
                      >
                        <path 
                          fill="currentColor"
                          d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"
                      />
                    </svg>
                  </button>

                  <div className="flex justify-between items-center">
                    <div className="w-full flex flex-col justify-center">
                      <h2 className="text-[20px] leading-[32px] font-semibold font-['Inter'] text-[#1A1A1A]">
                        Set up your advisor onboarding call
                      </h2>
                      <p className="mt-2 text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A]">
                        Schedule your first meeting with your dedicated tax advisor to review your business needs, discuss your tax strategy, and create a personalized tax plan.
                      </p>
                      <button 
                        className="mt-4 bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center w-fit"
                        onClick={() => router.push('/advisor')}
                      >
                        Schedule onboarding
                      </button>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Metrics Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Estimated Tax Savings Card */}
                <div 
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-5 cursor-pointer transition-colors"
                  onClick={() => router.push('/insights')}
                >
                  <div className="text-[14px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] mb-1">
                    Estimated tax savings
                  </div>
                  <div className="text-[24px] leading-[32px] font-medium text-gray-900 h-[32px]">
                    {isLoadingMetrics ? (
                      <div className="h-[32px] w-28 bg-[#F0F1EF] rounded-lg animate-pulse" />
                    ) : (
                      "$85,000"
                    )}
                  </div>
                </div>

                {/* Deductions Found Card */}
                <div 
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-5 cursor-pointer transition-colors"
                  onClick={() => router.push('/insights')}
                >
                  <div className="text-[14px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] mb-1">
                    Deductions found
                  </div>
                  <div className="text-[24px] leading-[32px] font-medium text-gray-900 h-[32px]">
                    {isLoadingMetrics ? (
                      <div className="h-[32px] w-12 bg-[#F0F1EF] rounded-lg animate-pulse" />
                    ) : (
                      "5"
                    )}
                  </div>
                </div>

                {/* Connections Card */}
                <div 
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-5 cursor-pointer transition-colors"
                  onClick={() => router.push('/settings/connections')}
                >
                  <div className="text-[14px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] mb-1">
                    Active connections
                  </div>
                  <div className="flex items-center gap-2 h-[32px]">
                    <div className="text-[24px] leading-[32px] font-medium text-gray-900">
                      {isLoadingMetrics ? (
                        <div className="h-[32px] w-12 bg-[#F0F1EF] rounded-lg animate-pulse" />
                      ) : (
                        integrations.length.toString()
                      )}
                    </div>
                    <div className="flex -space-x-2">
                      {!isLoadingMetrics && integrations.map((integration, index) => (
                        <div 
                          key={integration.id}
                          className="relative w-6 h-6 rounded-full bg-white border border-white"
                        >
                          <Image
                            src={integration.icon}
                            alt={integration.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tally Pulse Section - Updated to Business Pulse */}
              <div className="mt-8">
                <div className="flex items-center gap-1 mb-4">
                  <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    Business pulse
                  </h2>
                </div>

                {/* Side by Side Cards - First Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Upcoming Filings Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                        Upcoming filings
                        {isLoadingTables ? (
                          <div className="w-[18px] h-[18px] bg-[#F0F1EF] rounded-full animate-pulse" />
                        ) : (
                          <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#F0F1EF] rounded-[4px] text-[11px] font-semibold font-['Inter'] text-[#1A1A1A]">
                            6
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Filings Table */}
                    <div className="w-full">
                      <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E4E5E1]">
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Filing
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Due Date
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Status
                        </div>
                      </div>

                      <div className="divide-y divide-[#E4E5E1]">
                        {isLoadingTables ? (
                          <>
                            <LoadingRow cols={3} />
                            <LoadingRow cols={3} />
                            <LoadingRow cols={3} />
                          </>
                        ) : (
                          getUpcomingFilings().map(task => (
                            <div 
                              key={task.id}
                              className="grid grid-cols-3 gap-4 h-[42px] items-center relative group cursor-pointer"
                              onClick={() => router.push('/plan')}
                            >
                              <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F7F7F6]/50 transition-colors" />
                              
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                  <path 
                                    fillRule="evenodd" 
                                    clipRule="evenodd" 
                                    d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z"
                                    fill="#646462"
                                  />
                                </svg>
                              </div>

                              <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                <span className="block transition-transform group-hover:translate-x-2">
                                  {task.task}
                                </span>
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                {task.date}
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                {task.status}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Outstanding Tasks Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                        Outstanding requests
                        {isLoadingTables || isLoadingRequests ? (
                          <div className="w-[18px] h-[18px] bg-[#F0F1EF] rounded-full animate-pulse" />
                        ) : (
                          <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#F0F1EF] rounded-[4px] text-[11px] font-semibold font-['Inter'] text-[#1A1A1A]">
                            {requestedDocuments.filter(doc => doc.status === 'pending' || doc.status === 'overdue').length.toString()}
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Outstanding Requests Table */}
                    <div className="w-full">
                      <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E4E5E1]">
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Document Name
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Date Requested
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Due Date
                        </div>
                      </div>

                      <div className="divide-y divide-[#E4E5E1]">
                        {isLoadingTables || isLoadingRequests ? (
                          <>
                            <LoadingRow cols={3} />
                            <LoadingRow cols={3} />
                            <LoadingRow cols={3} />
                          </>
                        ) : (
                          <>
                            {requestedDocuments
                              .filter(doc => doc.status === 'pending' || doc.status === 'overdue')
                              .slice(0, 3)  // Only show first 3 items
                              .map(doc => (
                                <div 
                                  key={doc.id}
                                  className="grid grid-cols-3 gap-4 h-[42px] items-center relative group cursor-pointer"
                                  onClick={() => router.push('/documents')}
                                >
                                  <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F7F7F6]/50 transition-colors" />
                                  
                                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                    <span className="block transition-transform group-hover:translate-x-2">
                                      {doc.name}
                                    </span>
                                  </div>
                                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                    {new Date(doc.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                    {doc.due_date ? new Date(doc.due_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    }) : 'No due date'}
                                  </div>
                                </div>
                              ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

