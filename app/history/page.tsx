'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import RunRowMenu from '../components/RunRowMenu'
import { useRouter } from 'next/navigation'

// Interfaces
interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  created_at: string;
  run_by: string;
  client_id: string;
  workflow: {
    title: string;
    slug: string;
  };
  client: {
    name: string;
  } | null;
}

interface AssistantChat {
  id: string;
  created_at: string;
  title: string;
  status: string;
}

// Helper functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric', 
    year: 'numeric'
  });
}

// Loading table component
const LoadingTable = () => (
  <div className="divide-y divide-[#E4E5E1]">
    {[1, 2, 3, 4, 5].map((i) => (
      <div 
        key={i}
        className="grid grid-cols-[24px_2fr_1fr_1fr_1fr_32px] gap-4 h-[42px] items-center px-4 -mx-4"
      >
        <div className="w-4 h-4 bg-[#F7F7F6] rounded animate-pulse" />
        <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-48" />
        <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-24" />
        <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-32" />
        <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-36" />
        <div></div>
      </div>
    ))}
  </div>
);

export default function HistoryPage() {
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [assistantChats, setAssistantChats] = useState<AssistantChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Define tabs
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'assistant', label: 'Assistant' }
  ];

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch workflow runs
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_runs')
        .select(`
          *,
          workflow:workflows (
            title,
            slug
          ),
          client:clients (
            name
          )
        `)
        .eq('run_by', user.id)
        .order('created_at', { ascending: false });

      if (workflowError) throw workflowError;
      setWorkflowRuns(workflowData || []);

      // TODO: Fetch assistant chats when that table is ready
      // For now using empty array
      setAssistantChats([]);

    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter items based on search and active tab
  const filteredItems = () => {
    const search = searchTerm.toLowerCase();
    
    if (activeTab === 'workflows') {
      return workflowRuns.filter(run => 
        run.workflow.title.toLowerCase().includes(search) || 
        run.workflow.slug.toLowerCase().includes(search)
      );
    }
    
    if (activeTab === 'assistant') {
      return assistantChats.filter(chat =>
        chat.title.toLowerCase().includes(search)
      );
    }

    // All tab - combine both types
    const filteredRuns = workflowRuns.filter(run =>
      run.workflow.title.toLowerCase().includes(search)
    );
    const filteredChats = assistantChats.filter(chat =>
      chat.title.toLowerCase().includes(search)
    );

    return [...filteredRuns, ...filteredChats].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#E6F4ED] text-[#0F5132]';
      case 'failed':
        return 'bg-[#FFEFED] text-[#B42318]';
      case 'running':
        return 'bg-[#E6EDFF] text-[#0040A1]';
      default:
        return 'bg-[#F0F1EF] text-[#646462]';
    }
  };

  // Delete handlers
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflow_runs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (!confirm(`Are you sure you want to delete ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}?`)) {
        return;
      }

      const { error } = await supabase
        .from('workflow_runs')
        .delete()
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      await fetchData();
      setSelectedItems(new Set());
      toast.success(`${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} deleted`);
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="history" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6]">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="pl-4 pr-6 py-5 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center">
              <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                History
              </h1>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Tab switcher */}
            <div className="border-b border-[#E4E5E1] flex-none">
              <div className="px-4 flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedItems(new Set());
                    }}
                    className={`py-3 text-[14px] leading-[20px] font-medium font-oracle border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'border-[#1A1A1A] text-[#1A1A1A]' 
                        : 'border-transparent text-[#646462] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3">
                <div className="space-y-3">
                  {/* Search bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-[320px]">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
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

                    {selectedItems.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3 h-[28px] rounded-full font-oracle font-medium text-[14px] leading-[20px] transition-colors flex items-center gap-1 ml-auto border border-[#E4E4E4]"
                      >
                        {selectedItems.size > 1 ? 'Delete all' : 'Delete'}
                      </button>
                    )}
                  </div>

                  {/* Table */}
                  {isLoading ? (
                    <LoadingTable />
                  ) : (
                    <div className="w-full">
                      {/* Table header */}
                      <div className={`grid ${
                        activeTab === 'all' 
                          ? 'grid-cols-[24px_2fr_1fr_1fr_1fr_1fr_32px]' 
                          : 'grid-cols-[24px_2fr_1fr_1fr_1fr_32px]'
                      } gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80`}>
                        <div className="w-4 flex items-center">
                          <div className="relative w-4 h-4">
                            <input
                              type="checkbox"
                              className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                              checked={workflowRuns.length > 0 && selectedItems.size === workflowRuns.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(new Set(workflowRuns.map(run => run.id)));
                                } else {
                                  setSelectedItems(new Set());
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
                        <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                          {activeTab === 'workflows' 
                            ? 'Workflow' 
                            : activeTab === 'assistant'
                              ? 'Topic'
                              : 'Title'
                          }
                        </div>
                        <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Status</div>
                        <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Type</div>
                        {activeTab === 'all' && (
                          <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Client</div>
                        )}
                        <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Run Date</div>
                        <div></div>
                      </div>

                      {/* Table content */}
                      <div className="divide-y divide-[#E4E5E1]">
                        {filteredItems().length > 0 ? (
                          filteredItems().map((item) => (
                            <Link 
                              href={
                                'workflow' in item 
                                  ? `/workflows/runs/${item.id}`
                                  : `/assistant/${item.id}`
                              }
                              key={item.id}
                              className={`grid ${
                                activeTab === 'all' 
                                  ? 'grid-cols-[24px_2fr_1fr_1fr_1fr_1fr_32px]' 
                                  : 'grid-cols-[24px_2fr_1fr_1fr_1fr_32px]'
                              } gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4`}
                              onMouseEnter={() => setHoveredRowId(item.id)}
                              onMouseLeave={() => setHoveredRowId(null)}
                            >
                              <div 
                                className="w-4 relative z-10 flex items-center opacity-0 group-hover:opacity-100 [&:has(input:checked)]:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="relative w-4 h-4">
                                  <input
                                    type="checkbox"
                                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => {
                                      setSelectedItems(prev => {
                                        const next = new Set(prev);
                                        if (next.has(item.id)) {
                                          next.delete(item.id);
                                        } else {
                                          next.add(item.id);
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
                              <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                {'workflow' in item ? item.workflow.title : item.title}
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-oracle">
                                <span className={`inline-block px-2 py-0.5 rounded-[6px] ${getStatusBadge(item.status)}`}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                {'workflow' in item ? 'Workflow' : 'Assistant'}
                              </div>
                              {activeTab === 'all' && (
                                <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] truncate">
                                  {'workflow' in item && item.client ? item.client.name : '—'}
                                </div>
                              )}
                              <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                {formatDate(item.created_at)}
                              </div>
                              <div 
                                className="relative flex justify-end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <RunRowMenu 
                                  onOpenRun={() => router.push('workflow' in item ? `/workflows/runs/${item.id}` : `/assistant/${item.id}`)}
                                  onDelete={() => handleDelete(item.id)}
                                  isRowHovered={hoveredRowId === item.id}
                                />
                              </div>
                            </Link>
                          ))
                        ) : (
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
                              {searchTerm ? 'No items found' : 'No history yet'}
                            </h3>
                            <p className="text-[14px] leading-[20px] text-[#646462]">
                              {searchTerm 
                                ? 'Try adjusting your search terms'
                                : 'Your history will appear here'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}