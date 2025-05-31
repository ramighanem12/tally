'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface ImportFromVaultModalProps {
  isOpen: boolean
  onClose: () => void
  onImport?: (selectedDocs: string[]) => void
}

// Update interfaces to match vault/page.tsx
interface Project {
  id: string
  name: string
  description?: string
  document_count?: number
  size?: number
  updatedAt?: string
  client_name?: string
}

interface SupabaseDocumentWithSize {
  documents: {
    file_size: number;
  };
}

interface ProjectDocument {
  project?: {
    id: string;
    name: string;
  };
}

interface DatabaseDocument {
  id: string
  name: string
  url: string
  file_type: string
  file_size: number
  created_at: string
  updated_at: string
  project?: string
  project_name?: string
  project_documents?: ProjectDocument[]
  project_names?: string[]
  type?: string
}

// Add interface for Project with matching docs
interface ProjectWithMatchingDocs extends Project {
  matchingDocs: DatabaseDocument[]
}

export default function ImportFromVaultModal({ isOpen, onClose, onImport }: ImportFromVaultModalProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<DatabaseDocument[]>([])
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set())
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch projects and documents
  const fetchProjectsAndDocs = async () => {
    setIsLoading(true)
    try {
      // Fetch projects with client data
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('updated_at', { ascending: false })

      if (projectsError) throw projectsError

      // Get document counts and sizes for projects using project_documents
      const projectsWithStats = await Promise.all(projectsData.map(async (project) => {
        const { data: documents, error: documentsError } = await supabase
          .from('project_documents')
          .select(`
            documents!inner (
              file_size
            )
          `)
          .eq('project_id', project.id)

        if (documentsError) throw documentsError

        const totalSize = ((documents as unknown) as SupabaseDocumentWithSize[])
          ?.reduce((sum, doc) => sum + (doc.documents.file_size || 0), 0) || 0;

        return {
          ...project,
          client_name: project.clients?.name, // Extract client name from the join
          document_count: documents?.length || 0,
          size: Math.round(totalSize / (1024 * 1024))
        }
      }))

      // Fetch all documents with their project associations
      const { data: docsData, error: docsError } = await supabase
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
        .order('created_at', { ascending: false })

      if (docsError) throw docsError

      const formattedDocs = docsData.map(doc => ({
        ...doc,
        project_names: doc.project_documents?.map((pd: ProjectDocument) => pd.project?.name).filter(Boolean),
        project: doc.project_documents?.[0]?.project?.id,
        project_name: doc.project_documents?.[0]?.project?.name
      }))

      setProjects(projectsWithStats)
      setDocuments(formattedDocs)
      // Expand all projects by default
      setExpandedProjects(new Set(projectsWithStats.map(p => p.id)))
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load vault data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchProjectsAndDocs()
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDocs(new Set())
      setSearchQuery('')
    }
  }, [isOpen])

  // Update the filterItems function
  const filterItems = (items: Project[]): ProjectWithMatchingDocs[] => {
    if (!searchQuery) {
      // When not searching, show all projects that have any documents
      return items
        .filter(project => getProjectDocs(project.id).length > 0)
        .map(project => ({
          ...project,
          matchingDocs: getProjectDocs(project.id)
        }))
    }
    
    const query = searchQuery.toLowerCase()
    return items
      .map(project => {
        // Get all documents for this project
        const projectDocs = getProjectDocs(project.id)
        
        // If project name matches, include all its documents
        if (project.name.toLowerCase().includes(query)) {
          return {
            ...project,
            matchingDocs: projectDocs
          }
        }
        
        // Otherwise, only include documents that match the search
        const matchingDocs = projectDocs.filter(doc => 
          doc.name.toLowerCase().includes(query) || 
          doc.type?.toLowerCase().includes(query)
        )
        
        if (matchingDocs.length > 0) {
          return {
            ...project,
            matchingDocs
          }
        }
        return null
      })
      .filter((project): project is ProjectWithMatchingDocs => 
        project !== null
      )
  }

  // Get documents for a project
  const getProjectDocs = (projectId: string) => {
    return documents.filter(doc => 
      doc.project_documents?.some((pd: ProjectDocument) => pd.project?.id === projectId)
    )
  }

  // Get standalone documents (not in any project)
  const getStandaloneDocs = () => {
    return documents.filter(doc => 
      !doc.project_documents || doc.project_documents.length === 0
    )
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Toggle project expansion
  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  // Handle project selection
  const handleProjectSelect = (projectId: string, checked: boolean) => {
    const projectDocs = getProjectDocs(projectId)
    const newSelected = new Set(selectedDocs)
    
    if (checked) {
      // Add all project document IDs to selection
      projectDocs.forEach(doc => newSelected.add(doc.id))
    } else {
      // Remove all project document IDs from selection
      projectDocs.forEach(doc => newSelected.delete(doc.id))
    }
    
    setSelectedDocs(newSelected)
  }

  // Handle individual doc selection
  const handleDocSelect = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocs)
    if (checked) {
      newSelected.add(docId)
    } else {
      newSelected.delete(docId)
    }
    setSelectedDocs(newSelected)
  }

  // Add helper to check if all project docs are selected
  const isProjectSelected = (projectId: string): boolean => {
    const projectDocs = getProjectDocs(projectId)
    return projectDocs.length > 0 && projectDocs.every(doc => selectedDocs.has(doc.id))
  }

  // Add helper to get project selection count
  const getSelectedProjectsCount = (): number => {
    return projects.filter(project => 
      getProjectDocs(project.id).some(doc => selectedDocs.has(doc.id))
    ).length
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[736px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Import from Vault
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors"
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
        </div>

        <p className="text-[15px] leading-[22px] font-normal font-oracle text-[#1A1A1A] mb-4">
          Select documents from your vault to import.
        </p>

        {/* Combined search and content card */}
        <div className="border border-[#E4E5E1] rounded-lg mb-4 overflow-hidden">
          {/* Search bar inside card */}
          <div className="relative border-b border-[#E4E5E1]">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[42px] pl-9 pr-3 border-0
                text-[14px] leading-[20px] font-oracle text-[#1A1A1A] 
                focus:ring-0 focus:outline-none
                placeholder:text-[#646462]"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646462]"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>

          {/* Scrollable content area */}
          <div className="h-[368px] overflow-y-auto divide-y divide-[#E4E5E1]">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Projects */}
                {filterItems(projects).map((project) => (
                  <div key={project.id} className="divide-y divide-[#E4E5E1]">
                    <label className="flex items-center gap-3 p-3 hover:bg-[#F7F7F6] cursor-pointer">
                      <div className="relative w-4 h-4">
                        <input
                          type="checkbox"
                          checked={isProjectSelected(project.id)}
                          onChange={(e) => handleProjectSelect(project.id, e.target.checked)}
                          className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white 
                          peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] 
                          transition-all" 
                        />
                        <svg 
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 
                            text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M2.5 6L5 8.5L9.5 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <svg 
                          className="h-5 w-5 text-[#646462]"
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" />
                        </svg>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A] truncate max-w-[150px]">
                            {project.name}
                          </span>
                          {project.client_name && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#F7F7F6] text-[#1A1A1A] text-[13px] leading-[18px]">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                x="0px" 
                                y="0px" 
                                width="15" 
                                height="15" 
                                viewBox="0 0 24 24"
                                className="fill-current text-[#646462]"
                              >
                                <path d="M 3 3 A 1.0001 1.0001 0 0 0 2 4 L 2 20 A 1.0001 1.0001 0 0 0 3 21 L 15 21 L 21 21 A 1.0001 1.0001 0 0 0 22 20 L 22 8 A 1.0001 1.0001 0 0 0 21 7 L 16 7 L 16 4 A 1.0001 1.0001 0 0 0 15 3 L 3 3 z M 4 5 L 14 5 L 14 7.8320312 A 1.0001 1.0001 0 0 0 14 8.1582031 L 14 19 L 4 19 L 4 5 z M 6 7 L 6 9 L 8 9 L 8 7 L 6 7 z M 10 7 L 10 9 L 12 9 L 12 7 L 10 7 z M 16 9 L 20 9 L 20 19 L 16 19 L 16 17 L 18 17 L 18 15 L 16 15 L 16 13 L 18 13 L 18 11 L 16 11 L 16 9 z M 6 11 L 6 13 L 8 13 L 8 11 L 6 11 z M 10 11 L 10 13 L 12 13 L 12 11 L 10 11 z M 6 15 L 6 17 L 8 17 L 8 15 L 6 15 z M 10 15 L 10 17 L 12 17 L 12 15 L 10 15 z"></path>
                              </svg>
                              {project.client_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleProject(project.id);
                        }}
                        className="text-[#646462]"
                      >
                        <svg 
                          className={`h-5 w-5 transition-transform ${
                            expandedProjects.has(project.id) ? 'rotate-180' : ''
                          }`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12,14.071L8.179,10.25c-0.414-0.414-1.086-0.414-1.5,0l0,0c-0.414,0.414-0.414,1.086,0,1.5l4.614,4.614 c0.391,0.391,1.024,0.391,1.414,0l4.614-4.614c0.414-0.414,0.414-1.086,0-1.5v0c-0.414-0.414-1.086-0.414-1.5,0L12,14.071z" />
                        </svg>
                      </button>
                    </label>
                    
                    {/* Project documents - use matchingDocs */}
                    {expandedProjects.has(project.id) && project.matchingDocs.map((doc: DatabaseDocument) => (
                      <label key={doc.id} className="flex items-center gap-3 p-3 pl-8 hover:bg-[#F7F7F6] cursor-pointer">
                        <div className="relative w-4 h-4">
                          <input
                            type="checkbox"
                            checked={selectedDocs.has(doc.id)}
                            onChange={(e) => handleDocSelect(doc.id, e.target.checked)}
                            className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                          />
                          <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white 
                            peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] 
                            transition-all" 
                          />
                          <svg 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 
                              text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M2.5 6L5 8.5L9.5 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg 
                            className="h-5 w-5 text-[#646462]"
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M 13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
                          </svg>
                          <span className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A]">
                            {doc.name}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                ))}

                {/* Standalone Documents */}
                {getStandaloneDocs()
                  .filter(doc => !searchQuery || 
                    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.type?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((doc) => (
                    <label key={doc.id} className="flex items-center gap-3 p-3 hover:bg-[#F7F7F6] cursor-pointer">
                      <div className="relative w-4 h-4">
                        <input
                          type="checkbox"
                          checked={selectedDocs.has(doc.id)}
                          onChange={(e) => handleDocSelect(doc.id, e.target.checked)}
                          className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white 
                          peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] 
                          transition-all" 
                        />
                        <svg 
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 
                            text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M2.5 6L5 8.5L9.5 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg 
                          className="h-5 w-5 text-[#646462]"
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M 13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
                        </svg>
                        <span className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A]">
                          {doc.name}
                        </span>
                      </div>
                    </label>
                  ))}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[#E4E5E1] -mx-6">
          <div className="px-6 flex justify-between items-center">
            <span className="text-[14px] leading-[20px] font-oracle text-[#646462]">
              {selectedDocs.size > 0 && (
                <>
                  {selectedDocs.size} document{selectedDocs.size !== 1 ? 's' : ''} selected
                  {(() => {
                    const selectedProjectsCount = getSelectedProjectsCount()
                    return selectedProjectsCount > 0 ? 
                      ` (${selectedProjectsCount} project${selectedProjectsCount !== 1 ? 's' : ''})` : 
                      ''
                  })()}
                </>
              )}
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={onClose}
                className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onImport?.(Array.from(selectedDocs))}
                className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 