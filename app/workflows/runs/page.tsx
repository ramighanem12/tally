'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import RunRowMenu from '../../components/RunRowMenu'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Add helper function for formatting dates
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric', 
    year: 'numeric'
  });
}

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

// Add LoadingTable component
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

export default function WorkflowRunsPage() {
  const [searchRuns, setSearchRuns] = useState('');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRuns, setSelectedRuns] = useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchRuns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
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

      if (error) throw error;
      setRuns(data || []);
    } catch (error) {
      console.error('Error fetching runs:', error);
      toast.error('Failed to load workflow runs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // Filter runs based on search
  const filteredRuns = runs.filter(run => {
    const search = searchRuns.toLowerCase();
    return run.workflow.title.toLowerCase().includes(search) || 
           (run.workflow.slug.toLowerCase().includes(search) || false);
  });

  // Get status badge style
  const getStatusBadge = (status: WorkflowRun['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-[#E6F4ED] text-[#0F5132]';
      case 'failed':
        return 'bg-[#FFEFED] text-[#B42318]';
      case 'running':
        return 'bg-[#E6EDFF] text-[#0040A1]';
      case 'initializing':
        return 'bg-[#F0F1EF] text-[#646462]';
    }
  };

  // Update the status display to just show the status
  const getStatusDisplay = (run: WorkflowRun) => {
    return run.status.charAt(0).toUpperCase() + run.status.slice(1);
  };

  const handleOpenRun = (runId: string) => {
    // TODO: Implement run opening logic
    console.log('Opening run:', runId);
  };

  const handleDeleteRun = async (runId: string) => {
    try {
      // Delete the workflow run
      const { error } = await supabase
        .from('workflow_runs')
        .delete()
        .eq('id', runId);

      if (error) throw error;

      // Refresh the runs list
      await fetchRuns();
      toast.success('Run deleted successfully');
    } catch (error) {
      console.error('Error deleting run:', error);
      toast.error('Failed to delete run');
    }
  };

  // Add bulk delete function
  const handleBulkDelete = async () => {
    try {
      if (!confirm(`Are you sure you want to delete ${selectedRuns.size} run${selectedRuns.size > 1 ? 's' : ''}?`)) {
        return;
      }

      const { error } = await supabase
        .from('workflow_runs')
        .delete()
        .in('id', Array.from(selectedRuns));

      if (error) throw error;

      await fetchRuns();
      setSelectedRuns(new Set());
      toast.success(`${selectedRuns.size} run${selectedRuns.size > 1 ? 's' : ''} deleted`);
    } catch (error) {
      console.error('Error deleting runs:', error);
      toast.error('Failed to delete runs');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="workflow-runs" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          <div className="pl-4 pr-6 py-5 border-b border-[#E4E5E1]">
            <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
              <div className="flex items-center">
                <Link href="/workflows" className="text-[#646462] hover:text-[#1A1A1A]">
                  Workflows
                </Link>
                <span className="mx-2 text-[#646462]">/</span>
                <span>History</span>
              </div>
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3">
              <div className="space-y-3">
                {/* Search Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="w-[320px]">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchRuns}
                        onChange={(e) => setSearchRuns(e.target.value)}
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

                  {/* Add Remove button - with correct white styling */}
                  {selectedRuns.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3 h-[28px] rounded-full font-oracle font-medium text-[14px] leading-[20px] transition-colors flex items-center gap-1 ml-auto border border-[#E4E4E4]"
                    >
                      {selectedRuns.size > 1 ? 'Delete all' : 'Delete'}
                    </button>
                  )}
                </div>

                {/* Table */}
                <div className="w-full">
                  <div className="grid grid-cols-[24px_2fr_1fr_1fr_1fr_32px] gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80">
                    <div className="w-4 flex items-center">
                      <div className="relative w-4 h-4">
                        <input
                          type="checkbox"
                          className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                          checked={runs.length > 0 && selectedRuns.size === runs.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRuns(new Set(runs.map(run => run.id)));
                            } else {
                              setSelectedRuns(new Set());
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
                    <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Workflow</div>
                    <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Status</div>
                    <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Client</div>
                    <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Run Date</div>
                    <div></div>
                  </div>

                  <div className="divide-y divide-[#E4E5E1]">
                    {isLoading ? (
                      <LoadingTable />
                    ) : filteredRuns.length > 0 ? (
                      filteredRuns.map((run) => (
                        <Link 
                          href={`/workflows/runs/${run.id}`}
                          key={run.id}
                          className="grid grid-cols-[24px_2fr_1fr_1fr_1fr_32px] gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4"
                          onMouseEnter={() => setHoveredRowId(run.id)}
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
                                checked={selectedRuns.has(run.id)}
                                onChange={() => {
                                  setSelectedRuns(prev => {
                                    const next = new Set(prev);
                                    if (next.has(run.id)) {
                                      next.delete(run.id);
                                    } else {
                                      next.add(run.id);
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
                            {run.workflow.title}
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-oracle">
                            <span className={`inline-block px-2 py-0.5 rounded-[6px] ${getStatusBadge(run.status)}`}>
                              {getStatusDisplay(run)}
                            </span>
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] truncate">
                            {run.client?.name || '—'}
                          </div>
                          <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                            {formatDate(run.created_at)}
                          </div>
                          <div 
                            className="relative flex justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <RunRowMenu 
                              onOpenRun={() => router.push(`/workflows/runs/${run.id}`)}
                              onDelete={() => handleDeleteRun(run.id)}
                              isRowHovered={hoveredRowId === run.id}
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
                          {searchRuns ? 'No runs found' : 'No runs yet'}
                        </h3>
                        <p className="text-[14px] leading-[20px] text-[#646462]">
                          {searchRuns 
                            ? 'Try adjusting your search terms'
                            : 'Run a workflow to get started'
                          }
                        </p>
                      </div>
                    )}
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