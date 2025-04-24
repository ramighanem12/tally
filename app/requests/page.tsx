'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CopilotNavigation from "../components/CopilotNavigation"

type Request = {
  id: string;
  ticket: string;
  title: string;
  requestedBy: string;
  requestedAt: string;
  type: string;
  audit: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
};

const SortIcon = ({ 
  className = "", 
  active = false, 
  direction 
}: { 
  className?: string;
  active?: boolean;
  direction?: 'asc' | 'desc';
}) => (
  <svg 
    className={`w-3.5 h-3.5 ${className} ${active ? 'text-gray-900' : ''} ${direction === 'desc' ? 'rotate-180' : ''} transition-transform`} 
    viewBox="0 0 16 16" 
    fill="none"
  >
    <path d="M4.5 4.5L4.5 11.5M4.5 11.5L2.5 9.5M4.5 11.5L6.5 9.5M11.5 11.5L11.5 4.5M11.5 4.5L9.5 6.5M11.5 4.5L13.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PriorityBarsIcon = ({ priority }: { priority: 'low' | 'medium' | 'high' }) => {
  const bars = {
    low: 1,
    medium: 2,
    high: 3
  }[priority];

  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M3 11V9" className={`${bars >= 1 ? 'text-gray-500' : 'text-gray-200'}`} />
        <path d="M7 11V7" className={`${bars >= 2 ? 'text-gray-500' : 'text-gray-200'}`} />
        <path d="M11 11V5" className={`${bars >= 3 ? 'text-gray-500' : 'text-gray-200'}`} />
      </g>
    </svg>
  );
};

const StatusIcon = ({ status }: { status: Request['status'] }) => {
  switch (status) {
    case 'completed':
      return (
        <svg className="w-5 h-5 text-[#3f5fdd] fill-current" viewBox="0 0 64 64">
          <path d="M32,10c12.15,0 22,9.85 22,22c0,12.15 -9.85,22 -22,22c-12.15,0 -22,-9.85 -22,-22c0,-12.15 9.85,-22 22,-22zM42.679,25.486c0.601,-0.927 0.336,-2.166 -0.591,-2.766c-0.93,-0.6 -2.167,-0.336 -2.767,0.591l-9.709,14.986l-5.11,-5.809c-0.729,-0.829 -1.994,-0.911 -2.823,-0.18c-0.829,0.729 -0.91,1.993 -0.181,2.823l6.855,7.791c0.382,0.433 0.93,0.679 1.502,0.679c0.049,0 0.098,-0.002 0.146,-0.005c0.625,-0.046 1.191,-0.382 1.532,-0.907z" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg className="w-5 h-5 text-[#E6B94D] fill-current" viewBox="0 0 64 64">
          <path d="M32,55c-12.683,0 -23,-10.318 -23,-23c0,-12.682 10.317,-23 23,-23c12.683,0 23,10.318 23,23c0,12.682 -10.317,23 -23,23zM32,14c-9.925,0 -18,8.075 -18,18c0,9.925 8.075,18 18,18c9.925,0 18,-8.075 18,-18c0,-9.925 -8.075,-18 -18,-18z" />
          <path d="M32,19 A12.6,12.6 0 0 1 32,45 L32,19 Z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-[#b1b1b3] fill-current" viewBox="0 0 64 64">
          <path d="M32,55c-12.683,0 -23,-10.318 -23,-23c0,-12.682 10.317,-23 23,-23c12.683,0 23,10.318 23,23c0,12.682 -10.317,23 -23,23zM32,14c-9.925,0 -18,8.075 -18,18c0,9.925 8.075,18 18,18c9.925,0 18,-8.075 18,-18c0,-9.925 -8.075,-18 -18,-18z" />
        </svg>
      );
  }
};

const CalendarIcon = () => (
  <svg 
    className="w-[14px] h-[14px] text-gray-500 shrink-0" 
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M 7.984375 1.9863281 A 1.0001 1.0001 0 0 0 7 3 L 4 3 A 1.0001 1.0001 0 0 0 3 4 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 20 21 A 1.0001 1.0001 0 0 0 21 20 L 21 4 A 1.0001 1.0001 0 0 0 20 3 L 17 3 A 1.0001 1.0001 0 0 0 15.984375 1.9863281 A 1.0001 1.0001 0 0 0 15 3 L 9 3 A 1.0001 1.0001 0 0 0 7.984375 1.9863281 z M 5 5 L 7 5 A 1.0001 1.0001 0 1 0 9 5 L 15 5 A 1.0001 1.0001 0 1 0 17 5 L 19 5 L 19 8 L 5 8 L 5 5 z M 5 10 L 19 10 L 19 19 L 5 19 L 5 10 z" />
  </svg>
);

export default function RequestsPage() {
  const router = useRouter();
  const [sortField, setSortField] = useState<'ticket' | 'title' | 'requestedAt'>('requestedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Dummy data for demonstration
  const requests: Request[] = [
    {
      id: '1',
      ticket: 'REQ-1',
      title: 'Connect to Slack',
      requestedBy: 'john@example.com',
      requestedAt: '2025-03-18T10:30:00',
      type: 'Review',
      audit: 'SOC 2 Type II',
      status: 'in_progress',
      priority: 'high'
    },
    {
      id: '2',
      ticket: 'REQ-2',
      title: 'Update user permissions',
      requestedBy: 'sarah@example.com',
      requestedAt: '2025-03-17T15:45:00',
      type: 'Analysis',
      audit: 'Uniform Guidance',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '3',
      ticket: 'REQ-3',
      title: 'Process tax documents',
      requestedBy: 'mike@example.com',
      requestedAt: '2025-03-16T09:20:00',
      type: 'Processing',
      audit: 'SOC 1 Type I',
      status: 'completed',
      priority: 'low'
    }
  ];

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectRequest = (id: string) => {
    setSelectedRequests(prev => 
      prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map(req => req.id));
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortField === 'requestedAt') {
      return sortDirection === 'asc'
        ? new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
        : new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    }

    const aValue = String(a[sortField]).toLowerCase();
    const bValue = String(b[sortField]).toLowerCase();

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="requests" />
      <div className="flex-1">
        <main className="h-full flex flex-col bg-white">
          <div className="px-6 py-4 mt-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <h1 className="text-[18px] font-semibold text-gray-900 flex items-center gap-2">
                  Requests
                  <span className="flex items-center justify-center h-[22px] min-w-[22px] px-1.5 text-[13px] font-medium text-gray-900 bg-gray-100 rounded-lg">
                    {requests.filter(req => ['pending', 'in_progress'].includes(req.status)).length}
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-[300px]">
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 px-3 pl-8 text-[13px] font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
                      <path d="M7.5 12.5C10.2614 12.5 12.5 10.2614 12.5 7.5C12.5 4.73858 10.2614 2.5 7.5 2.5C4.73858 2.5 2.5 4.73858 2.5 7.5C2.5 10.2614 4.73858 12.5 7.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M11.5 11.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="bg-white h-full flex flex-col border-t border-gray-200">
              <div className="flex-1 overflow-y-auto">
                <div className="min-w-[990px] w-full">
                  <table className="w-full table-fixed border-collapse relative">
                    <colgroup>
                      <col style={{ width: '28px' }} />
                      <col style={{ width: '380px' }} />
                      <col style={{ width: '146px' }} />
                      <col style={{ width: '100px' }} />
                    </colgroup>
                    <thead className="sticky top-0 bg-white z-10">
                      <tr>
                        <th className="sticky top-0 bg-white pl-6 pr-0 py-1.5 w-[28px] before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                          <div 
                            className={`flex-shrink-0 w-[14px] h-[14px] rounded flex items-center justify-center border ${
                              selectedRequests.length === requests.length
                                ? 'bg-purple-600 border-purple-600'
                                : 'border-gray-300'
                            }`}
                            onClick={handleSelectAll}
                          >
                            {selectedRequests.length === requests.length && (
                              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </th>
                        <th className="sticky top-0 bg-white pl-6 pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                          Task
                        </th>
                        <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                          Audit
                        </th>
                        <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        // Loading skeleton rows
                        [...Array(8)].map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="pl-6 pr-0 py-2 w-[28px]">
                              <div className="w-[14px] h-[14px] bg-gray-100 rounded" />
                            </td>
                            <td className="pl-6 pr-6 py-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 bg-gray-100 rounded" />
                                <div className="w-[53px] h-[18px] bg-gray-100 rounded" />
                                <div className="w-5 h-5 bg-gray-100 rounded-full" />
                                <div className="w-[200px] h-[18px] bg-gray-100 rounded ml-1.5" />
                              </div>
                            </td>
                            <td className="pl-[18px] pr-6 py-2">
                              <div className="w-[60px] h-[18px] bg-gray-100 rounded" />
                            </td>
                            <td className="pl-[18px] pr-6 py-2">
                              <div className="w-[80px] h-[18px] bg-gray-100 rounded" />
                            </td>
                          </tr>
                        ))
                      ) : filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="pl-6 pr-6 py-1.5 h-[400px]">
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className="w-10 h-10 mb-3 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                                  <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="text-[13px] font-medium text-gray-900">No requests found</p>
                              <p className="text-[13px] font-medium text-gray-500 mt-1">Try adjusting your search</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sortedRequests.map((request) => (
                          <tr 
                            key={request.id}
                            className={`cursor-pointer ${
                              selectedRequests.includes(request.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="pl-6 pr-0 py-2 w-[28px]">
                              <div 
                                className={`flex-shrink-0 w-[14px] h-[14px] rounded flex items-center justify-center border ${
                                  selectedRequests.includes(request.id)
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRequest(request.id);
                                }}
                              >
                                {selectedRequests.includes(request.id) && (
                                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="pl-6 pr-6 py-2">
                              <div className="flex items-center">
                                <PriorityBarsIcon priority={request.priority} />
                                <span className="ml-1.5 w-[53px] text-[13px] font-medium text-[#5b5b5d]">
                                  {request.ticket}
                                </span>
                                <StatusIcon status={request.status} />
                                <span className="ml-1.5 text-[13px] font-medium text-gray-900 truncate">
                                  {request.title}
                                </span>
                              </div>
                            </td>
                            <td className="pl-[18px] pr-6 py-2">
                              <span className="text-[13px] font-medium text-gray-900">
                                {request.audit}
                              </span>
                            </td>
                            <td className="pl-[18px] pr-6 py-2">
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon />
                                <span className="text-[13px] font-medium text-gray-900">
                                  {new Date(request.requestedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
