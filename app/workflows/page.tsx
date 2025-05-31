'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, RefObject } from 'react'
import Link from 'next/link'
import { Workflow as BaseWorkflow, WorkflowStatus } from '@/data/workflows'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import React from 'react'

interface Workflow extends BaseWorkflow {
  kind?: string;
  status: WorkflowStatus;
  custom_user_id?: string;
}

// Simplified category mapping since we'll have fewer categories
const categoryToTab: Record<string, string> = {
  'Sales tax': 'sales-tax',
  'Personal income tax': 'personal-tax',
  'Bookkeeping': 'bookkeeping'
};

// First, add interface for the joined data structure
interface WorkflowRunWithWorkflow {
  workflow_id: string;
  workflows: {
    id: string;
    slug: string;
    title: string;
    description: string;
    steps: number;
    type: string | string[];
    category: string;
    kind?: string;
  };
}

// Define the tabs
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent' },
  { 
    id: 'for-me', 
    label: (
      <div className="flex items-center gap-1.5">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24"
          className="fill-current"
        >
          <path d="M 6.0078125 2 A 1.0001 1.0001 0 0 0 5.1054688 2.5527344 L 3.921875 4.921875 L 1.5527344 6.1054688 A 1.0001 1.0001 0 0 0 1.5527344 7.8945312 L 3.921875 9.078125 L 5.1054688 11.447266 A 1.0001 1.0001 0 0 0 6.8945312 11.447266 L 8.078125 9.078125 L 10.447266 7.8945312 A 1.0001 1.0001 0 0 0 10.447266 6.1054688 L 8.078125 4.921875 L 6.8945312 2.5527344 A 1.0001 1.0001 0 0 0 6.0078125 2 z M 6 5.234375 L 6.4394531 6.1132812 A 1.0001 1.0001 0 0 0 6.8867188 6.5605469 L 7.765625 7 L 6.8867188 7.4394531 A 1.0001 1.0001 0 0 0 6.4394531 7.8867188 L 6 8.765625 L 5.5605469 7.8867188 A 1.0001 1.0001 0 0 0 5.1132812 7.4394531 L 4.234375 7 L 5.1132812 6.5605469 A 1.0001 1.0001 0 0 0 5.5605469 6.1132812 L 6 5.234375 z M 16.007812 6 A 1.0001 1.0001 0 0 0 15.105469 6.5527344 L 13.255859 10.255859 L 9.5527344 12.105469 A 1.0001 1.0001 0 0 0 9.5527344 13.894531 L 13.255859 15.744141 L 15.105469 19.447266 A 1.0001 1.0001 0 0 0 16.894531 19.447266 L 18.744141 15.744141 L 22.447266 13.894531 A 1.0001 1.0001 0 0 0 22.447266 12.105469 L 18.744141 10.255859 L 16.894531 6.5527344 A 1.0001 1.0001 0 0 0 16.007812 6 z M 16 9.2382812 L 17.103516 11.447266 A 1.0001 1.0001 0 0 0 17.552734 11.896484 L 19.761719 13 L 17.552734 14.103516 A 1.0001 1.0001 0 0 0 17.103516 14.552734 L 16 16.761719 L 14.896484 14.552734 A 1.0001 1.0001 0 0 0 14.447266 14.103516 L 12.238281 13 L 14.447266 11.896484 A 1.0001 1.0001 0 0 0 14.896484 11.447266 L 16 9.2382812 z M 7.0078125 16 A 1.0001 1.0001 0 0 0 6.1054688 16.552734 L 5.5878906 17.587891 L 4.5527344 18.105469 A 1.0001 1.0001 0 0 0 4.5527344 19.894531 L 5.5878906 20.412109 L 6.1054688 21.447266 A 1.0001 1.0001 0 0 0 7.8945312 21.447266 L 8.4121094 20.412109 L 9.4472656 19.894531 A 1.0001 1.0001 0 0 0 9.4472656 18.105469 L 8.4121094 17.587891 L 7.8945312 16.552734 A 1.0001 1.0001 0 0 0 7.0078125 16 z" />
        </svg>
        For Me
      </div>
    )
  },
  { id: 'favorites', label: 'Favorites' },
  { id: 'personal-tax', label: 'Personal tax' },
  { id: 'sales-tax', label: 'Sales tax' }
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [starredWorkflows, setStarredWorkflows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [recentWorkflows, setRecentWorkflows] = useState<Workflow[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const tabRefs = useRef<Record<string, RefObject<HTMLButtonElement>>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Initialize refs for all tabs
  useEffect(() => {
    tabs.forEach(tab => {
      tabRefs.current[tab.id] = tabRefs.current[tab.id] || React.createRef<HTMLButtonElement>();
    });
  }, []);

  // Add loading timeout effect
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Replace localStorage effects with database fetch
  useEffect(() => {
    async function fetchStarredWorkflows() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('workflow_stars')
        .select('workflow_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching starred workflows:', error)
        return
      }

      setStarredWorkflows(data.map(star => star.workflow_id))
    }

    fetchStarredWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('status', 'active')
      .order('title')

    if (error) {
      console.error('Error fetching workflows:', error)
      return
    }

    setWorkflows(data || [])
    setIsLoading(false)
  };

  // Replace toggleStar function
  const toggleStar = async (e: React.MouseEvent, workflowId: string) => {
    e.preventDefault(); // Prevent Link navigation
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Handle unauthenticated user - maybe show login prompt
      return;
    }

    try {
      if (starredWorkflows.includes(workflowId)) {
        // Remove star
        const { error } = await supabase
          .from('workflow_stars')
          .delete()
          .eq('workflow_id', workflowId)
          .eq('user_id', user.id)

        if (error) throw error;

        setStarredWorkflows(prev => prev.filter(id => id !== workflowId))
      } else {
        // Add star
        const { error } = await supabase
          .from('workflow_stars')
          .insert({
            workflow_id: workflowId,
            user_id: user.id
          })

        if (error) throw error;

        setStarredWorkflows(prev => [...prev, workflowId])
      }
    } catch (error) {
      console.error('Error toggling star:', error)
      // Optionally show error toast/message to user
    }
  };

  // Update the filter logic
  const allowedWorkflows = workflows.filter(workflow => 
    workflow.category === 'Bookkeeping' ||
    workflow.category === 'Personal income tax' ||
    workflow.category === 'Sales tax'
  );

  // Then update the fetchRecentWorkflows function
  const fetchRecentWorkflows = async () => {
    setIsLoadingRecent(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First cast to unknown, then to our interface type
      const { data, error } = await supabase
        .from('workflow_runs')
        .select(`
          workflow_id,
          workflows:workflows!inner (
            id,
            slug,
            title,
            description,
            steps,
            type,
            category,
            kind
          )
        `)
        .eq('run_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extract unique workflows from the joined data
      const uniqueWorkflows = Array.from(
        new Map(
          (data as unknown as WorkflowRunWithWorkflow[] || [])
            .map(run => run.workflows)
            .filter(Boolean)
            .map(workflow => [workflow.id, workflow as Workflow])
        ).values()
      ).slice(0, 6);

      setRecentWorkflows(uniqueWorkflows);
    } catch (error) {
      console.error('Error fetching recent workflows:', error);
      toast.error('Failed to load recent workflows');
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Fetch both workflows and recent workflows on page load
  useEffect(() => {
    async function fetchInitialData() {
      await Promise.all([
        fetchWorkflows(),
        fetchRecentWorkflows()
      ]);
    }

    fetchInitialData();
  }, []);

  // Update the filtered/grouped workflows logic
  const filteredWorkflows = workflows.filter(workflow => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recent') {
      return recentWorkflows.some(recent => recent.id === workflow.id);
    }
    if (activeTab === 'for-me') {
      // For now, return empty array since we don't have the logic yet
      return false;
    }
    if (activeTab === 'favorites') return starredWorkflows.includes(workflow.id);
    if (activeTab === 'personal-tax') return workflow.category === 'Personal income tax';
    if (activeTab === 'sales-tax') return workflow.category === 'Sales tax';
    return Array.isArray(workflow.type) 
      ? workflow.type.includes(activeTab)
      : workflow.type === activeTab;
  });

  // Update the grouping logic
  const groupedWorkflows = activeTab === 'all' 
    ? allowedWorkflows.reduce((acc, workflow) => {
        const category = workflow.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(workflow);
        return acc;
      }, {} as Record<string, Workflow[]>)
    : activeTab === 'recent'
      ? { 'Recently Used': recentWorkflows }
      : { '': filteredWorkflows };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Add this effect to set initial indicator position
  useEffect(() => {
    // Small delay to ensure refs are mounted
    const timer = setTimeout(() => {
      const currentTabRef = tabRefs.current[activeTab]?.current;
      if (currentTabRef) {
        setIndicatorStyle({
          left: currentTabRef.offsetLeft,
          width: currentTabRef.offsetWidth
        });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []); // Run once on mount

  // Keep the existing effect for tab changes
  useEffect(() => {
    const currentTabRef = tabRefs.current[activeTab]?.current;
    if (currentTabRef) {
      setIndicatorStyle({
        left: currentTabRef.offsetLeft,
        width: currentTabRef.offsetWidth
      });
    }
  }, [activeTab]); // Run when activeTab changes

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="workflows" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg">
          {/* Header section */}
          <div className="pl-4 pr-4 py-3 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center justify-between">
              <h1 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A]">
                Workflows
              </h1>
              <button
                onClick={() => {/* your existing handler */}}
                className="invisible px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add workflow
              </button>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="px-4 pt-3 flex gap-6 border-b border-[#E4E5E1] relative">
            {/* Sliding indicator */}
            <div 
              className="absolute bottom-0 h-[2px] bg-[#1A1A1A] transition-all duration-150 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width
              }}
            />
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={tabRefs.current[tab.id] as RefObject<HTMLButtonElement>}
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 text-[15px] leading-[20px] font-oracle ${
                  activeTab === tab.id 
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-3 pb-4">
              {isLoading || (activeTab === 'recent' && isLoadingRecent) ? (
                // Loading state
                <>
                  {activeTab === 'recent' ? (
                    // Recent tab loading - just 3 cards
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i}
                          className="p-4 rounded-lg bg-white border border-[#E4E5E1] shadow-sm h-[165px] animate-pulse"
                        >
                          <div className="flex flex-col gap-0.5">
                            <div className="h-4 w-24 bg-[#F3F6F6] rounded" />
                            <div className="h-6 w-48 bg-[#F3F6F6] rounded mt-1" />
                          </div>
                          <div className="flex-1" />
                          <div className="h-5 w-32 bg-[#F3F6F6] rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Default loading state for other tabs
                    <>
                      {['Category 1', 'Category 2'].map((category, index) => (
                        <div key={category} className="mb-6 last:mb-0">
                          {/* Category header skeleton */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="h-6 w-32 bg-[#F3F6F6] rounded animate-pulse" />
                            <div className="h-5 w-16 bg-[#F3F6F6] rounded animate-pulse" />
                          </div>
                          
                          {/* Three cards per category */}
                          <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                              <div 
                                key={i}
                                className="p-4 rounded-lg bg-white border border-[#E4E5E1] shadow-sm h-[165px] animate-pulse"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <div className="h-4 w-24 bg-[#F3F6F6] rounded" />
                                  <div className="h-6 w-48 bg-[#F3F6F6] rounded mt-1" />
                                </div>
                                <div className="flex-1" />
                                <div className="h-5 w-32 bg-[#F3F6F6] rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                Object.entries(groupedWorkflows).map(([category, workflows]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    {/* Only show category header when on "all" tab and category exists */}
                    {activeTab === 'all' && category !== '' && (
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                          {category}
                        </h2>
                        <button
                          onClick={() => handleTabChange(categoryToTab[category] || 'all')}
                          className="flex items-center gap-0.5 text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] transition-colors group"
                        >
                          View all
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24"
                            className={`w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform`}
                          >
                            <path 
                              d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                              transform="rotate(-90 12 12)"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4">
                      {workflows.map((workflow) => (
                        <Link 
                          key={workflow.id}
                          href={`/workflows/${workflow.slug}`}
                          className="p-4 rounded-lg bg-white border border-[#E4E5E1] shadow-sm hover:border-[#BBBDB7] hover:bg-[#FAFAFA] transition-all cursor-pointer group flex flex-col h-[165px]"
                        >
                          {/* Title row with star */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-[17px] leading-[22px] font-medium font-oracle text-[#1A1A1A] group-hover:text-[#000000] flex-1">
                              {workflow.title}
                            </h3>
                            <button
                              onClick={(e) => toggleStar(e, workflow.id)}
                              className="text-[#646462] hover:text-[#1A1A1A] transition-colors flex-none"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24"
                                className={`transition-colors hover:scale-110 ${
                                  starredWorkflows.includes(workflow.id) 
                                    ? "fill-[#F5B431]" 
                                    : "fill-[#9A9A99] hover:fill-[#1A1A1A]"
                                }`}
                              >
                                {starredWorkflows.includes(workflow.id) ? (
                                  <path d="M22.951,9.446c-0.118-0.362-0.431-0.626-0.808-0.681l-6.389-0.928l-2.857-5.79c-0.337-0.683-1.457-0.683-1.794,0 l-2.857,5.79L1.856,8.765C1.479,8.82,1.167,9.084,1.049,9.446c-0.118,0.362-0.02,0.759,0.253,1.025l4.623,4.506l-1.091,6.364 c-0.064,0.375,0.09,0.754,0.398,0.978c0.309,0.224,0.716,0.253,1.053,0.076L12,19.391l5.715,3.005 c0.146,0.077,0.306,0.115,0.465,0.115c0.207,0,0.414-0.064,0.588-0.191c0.308-0.224,0.462-0.603,0.398-0.978l-1.091-6.364 l4.623-4.506C22.971,10.205,23.069,9.808,22.951,9.446z" />
                                ) : (
                                  <path d="M 12.011719 1.4882812 A 1.0001 1.0001 0 0 0 11.103516 2.046875 L 8.2460938 7.8378906 L 1.8554688 8.765625 A 1.0001 1.0001 0 0 0 1.3027344 10.470703 L 5.9257812 14.978516 L 4.8339844 21.341797 A 1.0001 1.0001 0 0 0 6.2851562 22.396484 L 12 19.390625 L 17.714844 22.396484 A 1.0001 1.0001 0 0 0 19.166016 21.341797 L 18.074219 14.978516 L 22.697266 10.470703 A 1.0001 1.0001 0 0 0 22.144531 8.765625 L 15.753906 7.8378906 L 12.896484 2.046875 A 1.0001 1.0001 0 0 0 12.011719 1.4882812 z M 12 4.7480469 L 14.193359 9.1933594 A 1.0001 1.0001 0 0 0 14.945312 9.7402344 L 19.851562 10.453125 L 16.302734 13.912109 A 1.0001 1.0001 0 0 0 16.013672 14.798828 L 16.851562 19.681641 L 12.464844 17.375 A 1.0001 1.0001 0 0 0 11.535156 17.375 L 7.1484375 19.681641 L 7.9863281 14.798828 A 1.0001 1.0001 0 0 0 7.6972656 13.912109 L 4.1484375 10.453125 L 9.0546875 9.7402344 A 1.0001 1.0001 0 0 0 9.8066406 9.1933594 L 12 4.7480469 z" />
                                )}
                              </svg>
                            </button>
                          </div>

                          {/* Description */}
                          <div className="flex-1">
                            {workflow.description && (
                              <p className="text-[14px] leading-[20px] font-oracle text-[#646462] line-clamp-2">
                                {workflow.description}
                              </p>
                            )}
                          </div>

                          {/* Steps count */}
                          <div className="flex items-center gap-1.5 text-[#646462]">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="14" 
                              height="14" 
                              viewBox="0 0 24 24"
                              className="fill-current"
                            >
                              <path d="M20.83,15.831c-0.12,0.41-0.47,0.71-0.89,0.77l-7.51,1.18l-5.63,4.66c-0.2,0.16-0.45,0.25-0.7,0.25 c0.16,0,0.32-0.03,0.47-0.11C5.25,22.401,5,22.011,5,21.591V3.361c0-0.43,0.26-0.83,0.65-1c0.39-0.18,0.86-0.11,1.18,0.18 l13.68,12.15C20.82,14.981,20.95,15.421,20.83,15.831z"></path>
                            </svg>
                            <span className="text-[13px] leading-[20px] font-oracle">
                              {workflow.steps} steps
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 