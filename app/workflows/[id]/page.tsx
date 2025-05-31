'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import WorkflowRunPanel from '@/app/components/WorkflowRunPanel'
import { FolderIcon, DeleteIcon, FileIcon } from '@/app/components/icons'
import MultiSelectDropdown from '@/app/components/MultiSelectDropdown'
import { Workflow } from '@/data/workflows'
import { toast } from 'react-hot-toast'
import SourcesCard from '@/app/components/SourcesCard'
import DeliverablesCard from '@/app/components/DeliverablesCard'
import DocumentsCard from '@/app/components/DocumentsCard'
import ViewFilesModal, { ViewFilesModalProps } from '@/app/components/ViewFilesModal'
import { handleWorkflowDocuments } from '@/app/utils/workflowDocuments'
import WorkflowActionCard from '@/app/components/WorkflowActionCard'

interface VaultProject {
  id: string;
  name: string;
  type: 'project';
  files?: string[];
}

interface VaultDocument {
  id: string;
  name: string;
  type: 'file';
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'project';
  files?: string[];
  file?: File;
}

function TypewriterText({ text, onComplete }: { text: string, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 10)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  return displayedText
}

export default function WorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isDescriptionComplete, setIsDescriptionComplete] = useState(false)

  // Fetch workflow from Supabase
  useEffect(() => {
    async function fetchWorkflow() {
      console.log('Fetching workflow with params:', params)
      console.log('Workflow ID from params:', params.id)
      
      setIsLoading(true)
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps (
            id,
            name,
            description,
            order_index
          )
        `)
        .eq('slug', params.id)
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Error fetching workflow:', error)
        setIsLoading(false)
        return
      }

      // Add the steps count to match the Workflow interface
      const workflowWithSteps = {
        ...data,
        steps: data.workflow_steps?.length || 0
      }

      console.log('Setting workflow:', workflowWithSteps)
      setWorkflow(workflowWithSteps)
      setIsLoading(false)
    }

    if (params.id) {
      fetchWorkflow()
    }
  }, [params.id])

  // Add state for view files modal
  const [isViewFilesModalOpen, setIsViewFilesModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])

  // Add at the top with other states
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false)

  // Add state to track completed inputs
  const [completedInputs, setCompletedInputs] = useState<Set<string>>(new Set())
  const [collectedInputs, setCollectedInputs] = useState<Record<string, any>>({})

  // Update these options (can be moved outside component if preferred)
  const sourceOptions = [
    { id: 'gaap', label: '🇺🇸 US GAAP Framework' },
    { id: 'irs', label: '🇺🇸 IRS Publications & Guidelines' },
    { id: 'fasb', label: '🇺🇸 FASB Accounting Standards' },
    { id: 'hmrc', label: '🇬🇧 HMRC Tax Manuals & Notices' },
    { id: 'aasb', label: '🇦🇺 AASB Standards' },
    { id: 'cra', label: '🇨🇦 CRA Tax Guidelines' },
    { id: 'ifrs', label: 'IFRS Standards & Interpretations' }
  ]

  const formatOptions = [
    { id: 'pdf', label: 'PDF document' },
    { id: 'slides', label: 'Slide deck' },
    { id: 'excel', label: 'Excel spreadsheet' },
    { id: 'binder', label: 'Binder' },
    { id: 'workpapers', label: 'Annotated workpapers' }
  ]

  if (isLoading) {
    return (
      <div className="h-screen flex overflow-hidden">
        <CopilotNavigation selectedTab="projects" />
        <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
          <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="h-screen flex overflow-hidden">
        <CopilotNavigation selectedTab="projects" />
        <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
          <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-medium text-[#1A1A1A] mb-2">Workflow not found</h2>
                <p className="text-[#646462] mb-4">The workflow you're looking for doesn't exist.</p>
                <Link 
                  href="/workflows"
                  className="text-[#41629E] hover:text-[#385389] transition-colors"
                >
                  Back to workflows
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const handleWorkflowSubmit = (data: Record<string, any>) => {
    if (data.files) {
      // Handle uploaded files
      const newFiles = Object.values(data.files)
        .flat()
        .map((file: unknown) => {
          const fileObj = file as File;
          return {
            id: crypto.randomUUID(),
            name: fileObj.name,
            type: 'file' as const
          } satisfies FileItem;
        })
        .filter(file => !selectedFiles.some((f: FileItem) => f.name === file.name))
      setSelectedFiles((prev: FileItem[]) => [...prev, ...newFiles])
    }

    if (data.vaultDocuments) {
      const { projects, standalone } = data.vaultDocuments[Object.keys(data.vaultDocuments)[0]]
      
      // Fix project mapping with explicit type
      const newProjects = projects
        .filter((project: VaultProject) => 
          !selectedFiles.some((f: FileItem) => f.type === 'project' && f.id === project.id)
        )
        .map((project: VaultProject) => ({
          ...project,
          type: 'project' as const
        }));

      // Fix standalone file mapping with explicit type
      const newStandalone = standalone
        .filter((doc: VaultDocument) => 
          !selectedFiles.some((f: FileItem) => f.id === doc.id || f.name === doc.name)
        )
        .map((doc: VaultDocument) => ({
          ...doc,
          type: 'file' as const
        }));

      setSelectedFiles((prev: FileItem[]) => [...prev, ...newProjects, ...newStandalone])
    }
  }

  const handleRunWorkflow = async () => {
    try {
      console.log('Starting workflow run creation...')
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)
      
      if (!user) throw new Error('Not authenticated')

      console.log('Creating workflow run with data:', {
        workflow_id: workflow?.slug,
        run_by: user.id,
        status: 'initializing',
        inputs: collectedInputs
      })

      // Create new workflow run with collected inputs
      const { data: workflowRun, error } = await supabase
        .from('workflow_runs')
        .insert({
          workflow_id: workflow?.slug,
          run_by: user.id,
          status: 'initializing',
          inputs: collectedInputs // Store the collected inputs
        })
        .select()
        .single()

      console.log('Workflow run creation response:', { workflowRun, error })

      if (error) throw error

      // Handle document uploads and associations if there are files
      if (selectedFiles.length > 0) {
        console.log('Handling workflow documents...', selectedFiles)
        await handleWorkflowDocuments(selectedFiles, workflowRun.id);
      }

      console.log('Navigating to run page:', `/workflows/runs/${workflowRun.id}`)
      
      // Navigate to the run page with the new run ID
      router.push(`/workflows/runs/${workflowRun.id}`)
    } catch (error) {
      console.error('Error creating workflow run:', error)
      toast.error('Failed to start workflow')
    }
  }

  // Add handlers for removing files
  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((prev: FileItem[]) => prev.filter((f: FileItem) => f.id !== fileId))
  }

  const handleRemoveProjectFile = (projectId: string, fileName: string) => {
    setSelectedFiles((prev: FileItem[]) => {
      return prev.map((item: FileItem) => {
        if (item.id === projectId && item.type === 'project') {
          const updatedFiles = item.files?.filter((f: string) => f !== fileName);
          
          if (!updatedFiles?.length) {
            return null;
          }
          
          return {
            ...item,
            files: updatedFiles,
            type: 'project' as const // Ensure type is preserved
          };
        }
        return item;
      })
      .filter((item): item is FileItem => item !== null); // Type guard instead of 'as'
    });
  };

  // Add with other helper functions
  const getTotalDocumentCount = (files: FileItem[]): number => {
    return files.reduce((total: number, item: FileItem) => {
      if (item.type === 'project' && item.files) {
        return total + item.files.length;
      }
      return total + 1;
    }, 0);
  };

  const handleUploadFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: 'file' as const,
      file: file  // Store the actual File object
    }))
    
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handleImportFiles = async (docIds: string[]) => {
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select(`
          *,
          project_documents (
            project:projects (
              id,
              name
            )
          )
        `)
        .in('id', docIds)

      if (error) throw error

      // Update type definition for project map
      const projectMap = new Map<string, FileItem>();
      const standaloneFiles: FileItem[] = [];

      documents.forEach(doc => {
        const project = doc.project_documents?.[0]?.project;
        
        if (project) {
          if (!projectMap.has(project.id)) {
            projectMap.set(project.id, {
              id: project.id,
              name: project.name,
              files: [],
              type: 'project' as const
            });
          }
          const projectItem = projectMap.get(project.id);
          if (projectItem && projectItem.files) {
            projectItem.files.push(doc.name);
          }
        } else {
          standaloneFiles.push({
            id: doc.id,
            name: doc.name,
            type: 'file' as const
          });
        }
      });

      // Convert project map to array
      const projectFiles = Array.from(projectMap.values());

      // Update the files state with both projects and standalone files
      setSelectedFiles(prev => [...prev, ...projectFiles, ...standaloneFiles]);

    } catch (error) {
      console.error('Error importing documents:', error)
      toast.error('Failed to import documents')
    }
  }

  const handleInputComplete = (inputId: string, response: any) => {
    setCompletedInputs(prev => new Set([...Array.from(prev), inputId]))
    // Store the input response
    setCollectedInputs(prev => ({
      ...prev,
      [inputId]: response
    }))
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="projects" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg">
          {/* Header section */}
          <div className="pl-4 pr-4 py-3 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A]">
                  <div className="flex items-center">
                    <Link 
                      href="/workflows"
                      className="text-[#646462] hover:text-[#1A1A1A] transition-colors"
                    >
                      Workflows
                    </Link>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      className="mx-1.5 text-[#646462]"
                    >
                      <path 
                        fill="currentColor" 
                        d="M11.109,3L11.109,3C9.78,3,8.988,4.481,9.725,5.587L14,12l-4.275,6.413C8.988,19.519,9.78,21,11.109,21h0 c0.556,0,1.076-0.278,1.385-0.741l4.766-7.15c0.448-0.672,0.448-1.547,0-2.219l-4.766-7.15C12.185,3.278,11.666,3,11.109,3z"
                      />
                    </svg>
                    {isLoading ? (
                      <div className="animate-pulse h-6 w-24 bg-[#F7F7F6] rounded" />
                    ) : workflow ? (
                      <span>{workflow.title}</span>
                    ) : (
                      <span>Workflow not found</span>
                    )}
                  </div>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRunWorkflow}
                  disabled={completedInputs.size === 0}
                  className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] disabled:bg-[#E4E5E1] disabled:text-[#9A9A99] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A] disabled:border-[#E4E5E1]"
                >
                  Run workflow
                </button>
              </div>
            </div>
          </div>

          {/* Main content area with right section */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-w-0 relative">
              {/* Chat message */}
              <div className="px-4 pt-4">
                {isLoading ? (
                  <div className="flex items-start gap-[8px] mb-4 animate-[slideUp_0.3s_ease-out]">
                    <div className="flex-shrink-0 w-[22px] h-[22px] mt-[2px]">
                      <div className="w-full h-full bg-[#F7F7F6] rounded-full animate-pulse" />
                    </div>
                    <div className="max-w-[65%] pb-1">
                      <div className="h-6 w-64 bg-[#F7F7F6] rounded animate-pulse" />
                    </div>
                  </div>
                ) : workflow ? (
                  <div className="flex items-start gap-[8px] mb-4 animate-[slideUp_0.3s_ease-out]">
                    <div className="flex-shrink-0 w-[22px] h-[22px] mt-[2px]">
                      <img 
                        src="/ModusLetter.svg"
                        alt="Modus AI"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="max-w-[65%] pb-1">
                      <p className="text-[16px] leading-[24px] font-oracle text-[#1A1A1A]">
                        <TypewriterText 
                          text={workflow.description_long || workflow.description || ''} 
                          onComplete={() => setIsDescriptionComplete(true)}
                        />
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action cards */}
              <div className="px-4 pb-6">
                {workflow?.inputs.map((input, index) => (
                  <WorkflowActionCard
                    key={input.id}
                    input={input}
                    onComplete={handleInputComplete}
                    visible={!isLoading && isDescriptionComplete && (!index || completedInputs.has(workflow.inputs[index - 1].id))}
                    autoStart={!index}
                  />
                ))}
              </div>
            </div>

            {/* Right section - 25% */}
            <div className="w-[25%] min-w-[300px]">
              <div>
                <DocumentsCard 
                  files={selectedFiles}
                  onUploadFiles={handleUploadFiles}
                  onImportFiles={handleImportFiles}
                  onRemoveFile={handleRemoveFile}
                  onRemoveProjectFile={handleRemoveProjectFile}
                />
              </div>
            </div>
          </div>
        </main>

        <ViewFilesModal
          isOpen={isViewFilesModalOpen}
          onClose={() => setIsViewFilesModalOpen(false)}
          files={selectedFiles}
          onRemoveFile={handleRemoveFile}
          onRemoveProjectFile={handleRemoveProjectFile}
        />
      </div>
    </div>
  )
}