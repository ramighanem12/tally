'use client'
import { useParams, useRouter } from 'next/navigation'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import CopilotNavigation from "@/app/components/CopilotNavigation"
import Link from 'next/link'
import { Workflow } from '@/data/workflows'
import { supabase } from '@/lib/supabase'
import SourcesCard from '@/app/components/SourcesCard'
import DeliverablesCard from '@/app/components/DeliverablesCard'
import DocumentsCard from '@/app/components/DocumentsCard'
import StepsCard from '@/app/components/StepsCard'
import { toast } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'

type RunStatus = 'initializing' | 'running' | 'completed' | 'failed';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  reasoning?: string;
  output?: any;
  startTime?: string;
  endTime?: string;
}

interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: RunStatus;
  steps?: WorkflowStep[];
  deliverable?: {
    title: string;
    content: string;
    summary: string;
    recommendations: string[];
    attachments: string[];
  };
  created_at: string;
  completed_at?: string;
  inputs?: Record<string, any>;
}

export default function WorkflowRunPage() {
  const router = useRouter()
  const params = useParams()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [workflowRun, setWorkflowRun] = useState<WorkflowRun | null>(null)
  const [runStatus, setRunStatus] = useState<RunStatus>('initializing')
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState('')

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch workflow run and related data - use useCallback to prevent infinite loops
  const fetchWorkflowRun = useCallback(async () => {
    if (!params.id) {
      console.log('No params.id, skipping fetch')
      return
    }

    try {
      console.log('Fetching workflow run with params:', params)
      console.log('Run ID from params:', params.id)
      
      setIsLoading(true)
      
      // Get workflow run
      const { data: runData, error: runError } = await supabase
        .from('workflow_runs')
        .select(`
          *,
          workflow:workflows (
            id,
            title,
            description,
            slug
          )
        `)
        .eq('id', params.id)
        .single()

      console.log('Workflow run response:', { runData, runError })

      if (runError) {
        console.error('Error fetching workflow run:', runError)
        toast.error('Failed to load workflow run')
        setIsLoading(false)
        return
      }

      console.log('Setting workflow run data:', runData)

      setWorkflowRun(runData)
      setRunStatus(runData.status)
      setWorkflowSteps(runData.steps || [])

      // Set workflow data
      if (runData.workflow) {
        setWorkflow({
          ...runData.workflow,
          steps: 0,
          inputs: []
        })
      }

      // If status is initializing, start execution
      if (runData.status === 'initializing') {
        await startWorkflowExecution(runData)
      }

    } catch (error) {
      console.error('Error in fetchWorkflowRun:', error)
      toast.error('Failed to load workflow run')
    } finally {
      setIsLoading(false)
    }
  }, [params.id]) // Only depend on params.id

  // Start workflow execution - also use useCallback
  const startWorkflowExecution = useCallback(async (runData: any) => {
    try {
      setIsExecuting(true)
      setExecutionProgress('Starting workflow execution...')

      // Get associated documents using the correct workflow_documents table structure
      const { data: workflowDocs, error: docsError } = await supabase
        .from('workflow_documents')
        .select(`
          document:documents (
            id,
            name,
            description,
            url,
            file_type,
            file_size
          )
        `)
        .eq('workflow_run_id', runData.id)

      if (docsError) {
        console.error('Error fetching workflow documents:', docsError)
        // Don't fail the execution if documents can't be loaded
      }

      // Fix the document mapping - properly handle the Supabase response structure
      const documents = workflowDocs?.map((wd: any) => {
        const doc = wd.document
        return {
          id: doc?.id,
          name: doc?.name,
          description: doc?.description,
          url: doc?.url,
          file_type: doc?.file_type,
          type: 'file' as const
        }
      }).filter(doc => doc.id) || []

      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          runId: runData.id,
          workflowId: runData.workflow_id,
          workflowTitle: runData.workflow?.title || 'Workflow',
          workflowDescription: runData.workflow?.description || '',
          inputs: runData.inputs || {},
          documents: documents
        })
      })

      if (!response.ok) {
        throw new Error('Failed to execute workflow')
      }

      const result = await response.json()
      
      if (result.success) {
        setWorkflowSteps(result.steps || [])
        setRunStatus('completed')
        setExecutionProgress('Workflow completed successfully!')
        
        // Refresh the workflow run data to get the latest deliverable
        await fetchWorkflowRun()
      } else {
        throw new Error(result.error || 'Workflow execution failed')
      }

    } catch (error) {
      console.error('Error executing workflow:', error)
      setRunStatus('failed')
      setExecutionProgress('Workflow execution failed')
      toast.error('Workflow execution failed. Please try regenerating.')
    } finally {
      setIsExecuting(false)
    }
  }, [fetchWorkflowRun])

  // Handle regenerate workflow
  const handleRegenerateWorkflow = async () => {
    if (!workflowRun) return

    try {
      // Reset status to initializing
      const { error } = await supabase
        .from('workflow_runs')
        .update({ 
          status: 'initializing',
          steps: [],
          deliverable: null
        })
        .eq('id', workflowRun.id)

      if (error) throw error

      // Restart execution
      setRunStatus('initializing')
      setWorkflowSteps([])
      await startWorkflowExecution(workflowRun)

    } catch (error) {
      console.error('Error regenerating workflow:', error)
      toast.error('Failed to regenerate workflow')
    }
  }

  // Handle download deliverable
  const handleDownloadDeliverable = async () => {
    if (!workflowRun?.deliverable) return

    try {
      const response = await fetch(`/api/workflow/deliverable?runId=${workflowRun.id}&format=pdf`)
      
      if (!response.ok) {
        throw new Error('Failed to generate deliverable')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${workflowRun.deliverable.title || 'workflow-deliverable'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Deliverable downloaded successfully!')
    } catch (error) {
      console.error('Error downloading deliverable:', error)
      toast.error('Failed to download deliverable')
    }
  }

  // Initial fetch - only run once when params.id changes
  useEffect(() => {
    console.log('useEffect triggered with params.id:', params.id)
    fetchWorkflowRun()
  }, [fetchWorkflowRun])

  // Auto-refresh when status is running - separate useEffect with proper cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (runStatus === 'running') {
      interval = setInterval(() => {
        console.log('Auto-refreshing workflow run...')
        fetchWorkflowRun()
      }, 3000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [runStatus, fetchWorkflowRun])

  if (isLoading) {
    console.log('Rendering loading state') // Add debug log
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <CopilotNavigation />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (!workflow || !workflowRun) {
    console.log('Rendering not found state', { workflow, workflowRun }) // Add debug log
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <CopilotNavigation />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium text-[#1A1A1A] mb-2">Workflow run not found</h2>
              <p className="text-[#646462] mb-4">The workflow run you're looking for doesn't exist.</p>
              <Link 
                href="/workflows/runs"
                className="text-[#41629E] hover:text-[#385389] transition-colors"
              >
                Back to workflow runs
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  console.log('Rendering main workflow run page') // Add debug log

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <CopilotNavigation />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-[#E4E5E1]">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-[20px] leading-[28px] font-medium font-oracle text-[#1A1A1A] flex items-center gap-2">
                  <Link 
                    href="/workflows/runs"
                    className="text-[#646462] hover:text-[#1A1A1A] transition-colors"
                  >
                    Workflow runs
                  </Link>
                  <span className="text-[#9A9A99]">/</span>
                  <span>{workflow.title}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`text-[12px] leading-[16px] font-oracle px-2 py-0.5 rounded-full ${
                      runStatus === 'completed' ? 'text-[#059669] bg-[#D1FAE5]' :
                      runStatus === 'running' ? 'text-[#D97706] bg-[#FEF3C7]' :
                      runStatus === 'failed' ? 'text-[#DC2626] bg-[#FEE2E2]' :
                      'text-[#6B7280] bg-[#F3F4F6]'
                    }`}>
                      {runStatus.charAt(0).toUpperCase() + runStatus.slice(1)}
                    </span>
                  </div>
                </h1>
                <div className="flex items-center gap-2">
                  {runStatus === 'failed' && (
                    <button
                      onClick={handleRegenerateWorkflow}
                      className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors"
                    >
                      Regenerate
                    </button>
                  )}
                  <div className="relative" ref={menuRef}>
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="w-8 h-8 flex items-center justify-center text-[#646462] hover:text-[#1A1A1A] hover:bg-[#F7F7F6] rounded-lg transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z" fill="currentColor"/>
                        <path d="M8 4C8.55228 4 9 3.55228 9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4Z" fill="currentColor"/>
                        <path d="M8 14C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left section - 75% */}
            <div className="w-[75%] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl">
                  <div className="bg-white rounded-lg border border-[#E4E5E1] p-6">
                    <h2 className="text-[18px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-4">
                      Workflow Execution
                    </h2>
                    
                    {runStatus === 'completed' && workflowRun?.deliverable ? (
                      <div className="prose max-w-none">
                        <h3 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                          {workflowRun.deliverable.title}
                        </h3>
                        <div className="text-[14px] leading-[20px] font-oracle text-[#646462] whitespace-pre-wrap">
                          {workflowRun.deliverable.content}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 mx-auto mb-4 text-[#9A9A99]">
                          {runStatus === 'failed' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                          ) : (
                            <div className="w-8 h-8 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
                          )}
                        </div>
                        <h3 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                          {runStatus === 'failed' ? 'Workflow execution failed' : 'Workflow in progress'}
                        </h3>
                        <p className="text-[14px] leading-[20px] font-oracle text-[#646462] mb-4">
                          {runStatus === 'failed' 
                            ? 'Something went wrong during execution. You can try regenerating the workflow.'
                            : 'Modus is working on your workflow. This may take a few minutes.'
                          }
                        </p>
                        {runStatus === 'failed' && (
                          <button
                            onClick={handleRegenerateWorkflow}
                            className="px-4 py-2 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors"
                          >
                            Regenerate Workflow
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Floating status card */}
                {(runStatus === 'initializing' || runStatus === 'running' || isExecuting) && (
                  <div className="fixed bottom-6 left-4 bg-white rounded-lg shadow-lg border border-[#E4E5E1] px-4 py-3 flex items-center gap-3 z-50">
                    <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
                    <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                      {executionProgress || 'Modus is working on the task...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right section - 25% */}
            <div className="w-[25%] min-w-[300px] border-l border-[#E4E5E1] bg-white">
              <div className="p-4 space-y-4">
                <StepsCard 
                  steps={workflowSteps}
                  runStatus={runStatus}
                />
                <SourcesCard 
                  response={workflowRun?.deliverable?.content || ''} 
                  isLoading={runStatus === 'running' || isExecuting}
                  topPadding={false}
                />
                <DeliverablesCard 
                  deliverable={workflowRun?.deliverable}
                  onDownload={handleDownloadDeliverable}
                  isReady={runStatus === 'completed' && !!workflowRun?.deliverable}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 