'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import RunRowMenu from '@/app/components/RunRowMenu'
import Image from 'next/image'

interface Client {
  id: string;
  name: string;
  email: string | null;
  status: 'Active' | 'Inactive' | 'Pending';
  type: string;
  created_at: string;
  user_id: string;
}

interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  created_at: string;
  run_by: string;
  workflow: {
    title: string;
    slug: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  updated_at: string;
  client_name?: string;
  document_count?: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric', 
    year: 'numeric'
  });
}

// Add this helper function to match vault page date formatting
const formatUpdatedDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isRunsLoading, setIsRunsLoading] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [selectedRuns, setSelectedRuns] = useState<Set<string>>(new Set());
  const [searchRuns, setSearchRuns] = useState('');
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [searchProjects, setSearchProjects] = useState('');
  
  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'vault', label: 'Vault' },
    { id: 'workflows', label: 'Workflow runs' }
  ];

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setClient(data);
      } catch (error) {
        console.error('Error fetching client:', error);
        toast.error('Failed to load client');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [params.id]);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const { data, error } = await supabase
          .from('workflow_runs')
          .select(`
            *,
            workflow:workflows (
              title,
              slug
            )
          `)
          .eq('client_id', params.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRuns(data || []);
      } catch (error) {
        console.error('Error fetching runs:', error);
        toast.error('Failed to load workflow runs');
      } finally {
        setIsRunsLoading(false);
      }
    };

    fetchRuns();
  }, [params.id]);

  const fetchClientProjects = async () => {
    try {
      // First get the projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_documents (
            documents!inner (
              file_size
            )
          )
        `)
        .eq('client_id', params.id)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Format the projects with document count
      const formattedProjects = projectsData.map(project => ({
        ...project,
        document_count: project.project_documents?.length || 0
      }));

      setClientProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching client projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vault') {
      fetchClientProjects();
    }
  }, [activeTab, params.id]);

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

  const getStatusDisplay = (run: WorkflowRun) => {
    return run.status.charAt(0).toUpperCase() + run.status.slice(1);
  };

  const LoadingTable = () => (
    <div className="divide-y divide-[#E4E5E1]">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          className="grid grid-cols-[2fr_1fr_1fr_32px] gap-4 h-[42px] items-center px-4 -mx-4"
        >
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-48" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-24" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-36" />
          <div></div>
        </div>
      ))}
    </div>
  );

  const handleDeleteRun = async (runId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_runs')
        .delete()
        .eq('id', runId);

      if (error) throw error;

      const { data: newRuns, error: fetchError } = await supabase
        .from('workflow_runs')
        .select(`
          *,
          workflow:workflows (
            title,
            slug
          )
        `)
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRuns(newRuns || []);
      toast.success('Run deleted successfully');
    } catch (error) {
      console.error('Error deleting run:', error);
      toast.error('Failed to delete run');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRuns(new Set(runs.map(run => run.id)));
    } else {
      setSelectedRuns(new Set());
    }
  };

  const filteredRuns = runs.filter(run => {
    const search = searchRuns.toLowerCase();
    return run.workflow.title.toLowerCase().includes(search);
  });

  const filterBySearch = (project: Project, search: string) => {
    const searchLower = search.toLowerCase();
    return project.name.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="clients" />
      <div className="flex-1 overflow-hidden bg-[#F6F5F3]">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col">
          <div className="pl-4 pr-6 py-5 border-b border-[#E4E5E1]">
            <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
              <div className="flex items-center">
                <Link href="/clients" className="text-[#646462] hover:text-[#1A1A1A]">
                  Clients
                </Link>
                <span className="mx-2 text-[#646462]">/</span>
                {isLoading ? (
                  <div className="animate-pulse h-6 w-24 bg-[#F7F7F6] rounded" />
                ) : client ? (
                  <span>{client.name}</span>
                ) : (
                  <span>Client not found</span>
                )}
              </div>
            </h1>
          </div>

          {!isLoading && client && (
            <>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="border-b border-[#E4E5E1] flex-none">
                  <div className="px-4 flex gap-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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

                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 pt-3 pb-4">
                    {activeTab === 'details' && (
                      <div>
                        {/* Details content */}
                      </div>
                    )}
                    {activeTab === 'vault' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-[320px]">
                            <div className="relative">
                              <input
                                type="text"
                                value={searchProjects}
                                onChange={(e) => setSearchProjects(e.target.value)}
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
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          {isLoadingProjects ? (
                            [1, 2, 3, 4].map((i) => (
                              <div 
                                key={i}
                                className="p-4 rounded-lg bg-white border border-[#E4E5E1] shadow-sm flex flex-col h-[160px] animate-pulse"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <div className="h-4 w-24 bg-[#F7F7F6] rounded" />
                                  <div className="h-6 w-48 bg-[#F7F7F6] rounded mt-1" />
                                </div>
                                <div className="flex-1" />
                                <div className="h-5 w-32 bg-[#F7F7F6] rounded" />
                              </div>
                            ))
                          ) : clientProjects.length > 0 ? (
                            clientProjects
                              .filter(project => filterBySearch(project, searchProjects))
                              .map((project) => (
                                <Link 
                                  key={project.id}
                                  href={`/projects/${project.id}`}
                                  className="p-4 rounded-lg bg-white border border-[#E4E5E1] shadow-sm hover:border-[#BBBDB7] hover:bg-[#FAFAFA] transition-all cursor-pointer group flex flex-col h-[160px]"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                                      Updated {formatUpdatedDate(project.updated_at)}
                                    </span>
                                    <h3 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] group-hover:text-[#000000] line-clamp-1">
                                      {project.name}
                                    </h3>
                                    {project.description && (
                                      <p className="text-[14px] leading-[20px] font-oracle text-[#646462] line-clamp-1">
                                        {project.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex-1" />
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        x="0px" 
                                        y="0px" 
                                        width="15" 
                                        height="15" 
                                        viewBox="0 0 24 24"
                                        className="fill-current text-[#1A1A1A]"
                                      >
                                        <path d="M 4.25 3 C 3.0189372 3 2 4.0189372 2 5.25 L 2 17.75 C 2 18.981063 3.0189372 20 4.25 20 L 19.75 20 C 20.981063 20 22 18.981063 22 17.75 L 22 7.25 C 22 6.0189372 20.981063 5 19.75 5 L 10.621094 5 C 10.48775 5 10.361526 4.9474637 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784324 3.2643699 8.0415629 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5122497 5 7.6384738 5.052536 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215676 6.7356301 9.9584369 7 10.621094 7 L 19.75 7 C 19.898937 7 20 7.1010628 20 7.25 L 20 17.75 C 20 17.898937 19.898937 18 19.75 18 L 4.25 18 C 4.1010628 18 4 17.898937 4 17.75 L 4 5.25 C 4 5.1010628 4.1010628 5 4.25 5 z" />
                                      </svg>
                                      <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                        {project.document_count || 0} documents
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))
                          ) : (
                            <div className="col-span-4 flex flex-col items-center justify-center py-16 px-4">
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
                                No projects yet
                              </h3>
                              <p className="text-[14px] leading-[20px] text-[#646462]">
                                Create a project to get started
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {activeTab === 'workflows' && (
                      <div>
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-3">
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
                          </div>

                          <div className="grid grid-cols-[24px_2fr_1fr_1fr_32px] gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80">
                            <div className="w-4 flex items-center">
                              <div className="relative w-4 h-4">
                                <input
                                  type="checkbox"
                                  className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                                  checked={runs.length > 0 && selectedRuns.size === runs.length}
                                  onChange={(e) => handleSelectAll(e.target.checked)}
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
                            <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Run Date</div>
                            <div></div>
                          </div>

                          <div className="divide-y divide-[#E4E5E1]">
                            {isRunsLoading ? (
                              <LoadingTable />
                            ) : filteredRuns.length > 0 ? (
                              filteredRuns.map((run) => (
                                <Link 
                                  href={`/workflows/runs/${run.id}`}
                                  key={run.id}
                                  className="grid grid-cols-[24px_2fr_1fr_1fr_32px] gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4"
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
                                  <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                    {formatDate(run.created_at)}
                                  </div>
                                  <div className="relative flex justify-end">
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
                                  No workflow runs yet
                                </h3>
                                <p className="text-[14px] leading-[20px] text-[#646462]">
                                  Run a workflow for this client to get started
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 