'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import CreateProjectModal from '../components/CreateProjectModal'
import DocumentRowMenu from '../components/DocumentRowMenu'
import EditNoteModal from '../components/EditNoteModal'
import UploadDocumentModal from '../components/UploadDocumentModal'
import { downloadSingleFile, downloadMultipleFiles } from '../utils/fileDownload'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { DragEvent } from 'react'
import { uploadDocuments } from '@/app/utils/uploadDocuments'

// Add Project interface
interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  document_count?: number;  // We'll need to add this via a join or count query
  size?: number;  // We'll need to calculate this from associated documents
  updatedAt?: string;  // Add this for the formatted date
  client_id?: string;
  client_name?: string; // Add this field
}

// Update the DatabaseDocument interface to include the correct project_documents type
interface DatabaseDocument {
  id: string;
  name: string;
  description?: string;
  url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  date?: string;
  type?: string;
  project?: string;
  project_documents?: {
    project?: {
      id: string;  // Add this
      name: string;
    };
  }[];
  project_names?: string[];
  project_ids?: string[];  // Add this
}

// Add interface for the Supabase document response
interface SupabaseDocumentWithSize {
  documents: {
    file_size: number;
  };
}

// Add these type guards
function hasUrl(doc: DatabaseDocument) {
  return 'url' in doc;
}

function hasDate(doc: DatabaseDocument) {
  return 'date' in doc;
}

function hasType(doc: DatabaseDocument) {
  return 'type' in doc;
}

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchProjects, setSearchProjects] = useState('');
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [completedDocuments, setCompletedDocuments] = useState<DatabaseDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DatabaseDocument | null>(null);
  const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);
  const [searchDocuments, setSearchDocuments] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const assignDropdownRef = useRef<HTMLDivElement>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const projectsTabRef = useRef<HTMLButtonElement>(null);
  const documentsTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Define tabs with swapped order
  const tabs = [
    {
      id: 'projects',
      label: 'Projects'
    },
    { 
      id: 'documents', 
      label: 'Documents' 
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Clear selected documents when switching tabs
    setSelectedDocuments(new Set());
    // Refresh projects data when switching to projects tab
    if (tabId === 'projects') {
      fetchProjects();
    }
  };

  const filterBySearch = (project: typeof projects[0], searchText: string) => {
    const search = searchText.toLowerCase();
    return project.name.toLowerCase().includes(search) || 
      (project.description?.toLowerCase().includes(search));
  };

  // Update fetchProjects function
  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithStats = await Promise.all(projectsData.map(async (project) => {
        const { data: documents, error: documentsError } = await supabase
          .from('project_documents')
          .select(`
            documents!inner (
              file_size
            )
          `)
          .eq('project_id', project.id);

        if (documentsError) throw documentsError;

        const totalSize = ((documents as unknown) as SupabaseDocumentWithSize[])
          ?.reduce((sum, doc) => sum + (doc.documents.file_size || 0), 0) || 0;
        
        return {
          ...project,
          client_name: project.clients?.name, // Extract client name
          document_count: documents?.length || 0,
          size: Math.round(totalSize / (1024 * 1024)), // Convert to MB
          updatedAt: new Date(project.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        };
      }));

      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Add useEffect to fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // Update handleCreateProject
  const handleCreateProject = () => {
    fetchProjects(); // Refresh projects after creation
  };

  // Add this function to handle document updates
  const handleDocumentUpdate = () => {
    fetchProjects(); // Refresh projects after document updates
    fetchDocuments(); // Refresh documents list
  };

  // Update the fetchDocuments function
  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          url,
          file_type,
          file_size,
          created_at,
          updated_at,
          type,
          project_documents (
            project:projects (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update interface to match actual response structure
      interface DocumentResponse {
        id: string;
        name: string;
        url: string;
        file_type: string;
        file_size: number;
        created_at: string;
        updated_at: string;
        type?: string;
        project_documents: Array<{
          project: {
            id: string;
            name: string;
          };
        }>;
      }

      // Add intermediate unknown assertion
      const formattedDocs = ((data as unknown) as DocumentResponse[]).map(doc => ({
        ...doc,
        project_names: doc.project_documents.map(pd => pd.project.name),
        project_ids: doc.project_documents.map(pd => pd.project.id),
        date: new Date(doc.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }));

      setCompletedDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Add document handlers
  const handleCompletedDocClick = (url: string) => {
    window.open(url, '_blank');
  };

  const archiveDocuments = async (documentIds: string[]) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .in('id', documentIds);

      if (error) throw error;
      
      toast.success('Documents archived successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error archiving documents:', error);
      toast.error('Failed to archive documents');
    }
  };

  // First get the filtered documents
  const filteredDocuments = completedDocuments.filter(doc => {
    const search = searchDocuments.toLowerCase();
    return doc.name.toLowerCase().includes(search) || 
      (doc.type?.toLowerCase().includes(search));
  });

  // Add this useEffect to handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(event.target as Node)) {
        setIsAssignDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the isDocumentInProject function to handle the correct type
  const isDocumentInProject = (documentId: string, projectId: string) => {
    const document = completedDocuments.find(doc => doc.id === documentId);
    return document?.project_ids?.includes(projectId) ?? false;
  };

  // Update the assignDocumentsToProject function to preserve existing assignments
  const assignDocumentsToProject = async (projectIds: string[]) => {
    setIsAssigning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get all selected documents
      const documentIds = Array.from(selectedDocuments);

      // For each document-project combination, check if it already exists
      // and only create new assignments for ones that don't
      const newAssignments = [];
      
      for (const docId of documentIds) {
        for (const projectId of projectIds) {
          // Skip if already assigned
          if (isDocumentInProject(docId, projectId)) {
            continue;
          }
          
          newAssignments.push({
            project_id: projectId,
            document_id: docId,
            created_by: user?.id
          });
        }
      }

      // Only insert if there are new assignments to make
      if (newAssignments.length > 0) {
        const { error: insertError } = await supabase
          .from('project_documents')
          .insert(newAssignments);

        if (insertError) throw insertError;
      }

      toast.success('Documents assigned successfully');
      fetchDocuments();
      setSelectedDocuments(new Set());
      setSelectedProjectIds([]);
    } catch (error) {
      console.error('Error assigning documents:', error);
      toast.error('Failed to assign documents');
    } finally {
      setIsAssigning(false);
      setIsAssignDropdownOpen(false);
    }
  };

  // Update the formatProjectDisplay helper function
  const formatProjectDisplay = (projectNames: string[] | undefined) => {
    if (!projectNames?.length) return '—';
    if (projectNames.length === 1) {
      return (
        <span className="truncate max-w-[200px] block">
          {projectNames[0]}
        </span>
      );
    }
    return (
      <div className="flex items-center">
        <span className="truncate max-w-[200px] block">
          {projectNames[0]}
        </span>
        <span className="ml-1 text-[#646462] flex-shrink-0">
          +{projectNames.length - 1}
        </span>
      </div>
    );
  };

  // Add drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const success = await uploadDocuments(files);
      if (success) {
        fetchDocuments(); // Refresh the documents list
      }
    }
  }, [fetchDocuments]);

  // Add this effect to update indicator position
  useEffect(() => {
    const currentTabRef = activeTab === 'projects' ? projectsTabRef : documentsTabRef;
    
    if (currentTabRef.current) {
      setIndicatorStyle({
        left: currentTabRef.current.offsetLeft,
        width: currentTabRef.current.offsetWidth
      });
    }
  }, [activeTab]);

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="documents" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg relative">
          {/* Fixed Header - Updated to match Engagements */}
          <div className="pl-4 pr-4 py-3 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-[24px] w-auto">
                  <svg 
                    viewBox="0 0 500 500" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-auto"
                  >
                    <rect width="500" height="500" rx="100" fill="#00458F"/>
                    <path d="M119.546 124C101.193 124 86 139.165 86 157.485V343.515C86 361.835 101.193 377 119.546 377H125.225H131.281H352.331C366.104 377 378.222 367.407 381.363 354.037L413.512 231.955C414.09 229.754 414.156 227.45 413.702 225.219C413.249 222.989 412.29 220.892 410.898 219.09C409.505 217.288 407.718 215.828 405.672 214.823C403.627 213.819 401.377 213.295 399.097 213.294H382.994L384.188 187.25C384.188 168.93 368.995 153.765 350.642 153.765H214.535C212.552 153.765 210.666 152.969 209.265 151.585L192.55 134.9C185.572 127.935 176.081 124 166.196 124H119.546ZM119.546 153.765H166.196C168.179 153.765 170.066 154.561 171.467 155.945L188.182 172.629C195.159 179.609 204.65 183.529 214.535 183.529H350.642C352.863 183.529 354.369 185.033 354.369 187.25V213.294H160.547C157.249 213.297 154.046 214.392 151.438 216.406C148.829 218.421 146.964 221.241 146.133 224.427L115.819 340.521V157.485C115.819 155.268 117.325 153.765 119.546 153.765ZM172.079 243.059H379.762L352.418 346.857C352.387 346.983 352.358 347.109 352.331 347.235H144.88L172.079 243.059Z" fill="white"/>
                  </svg>
                </div>
                <h1 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A]">
                  Vault
                </h1>
              </div>
              <button
                onClick={() => setIsUploadDocumentModalOpen(true)}
                className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add document
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="px-4 pt-3 flex gap-6 border-b border-[#E4E5E1] relative">
            {/* Sliding indicator */}
            <div 
              className="absolute bottom-0 h-[2px] bg-[#1A1A1A] transition-all duration-150 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width
              }}
            />
            
            <button
              ref={projectsTabRef}
              onClick={() => handleTabChange('projects')}
              className={`pb-3 text-[15px] leading-[20px] font-oracle ${
                activeTab === 'projects' 
                  ? 'text-[#1A1A1A] font-medium'
                  : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
              }`}
            >
              Projects
            </button>

            <button
              ref={documentsTabRef}
              onClick={() => handleTabChange('documents')}
              className={`pb-3 text-[15px] leading-[20px] font-oracle ${
                activeTab === 'documents'
                  ? 'text-[#1A1A1A] font-medium'
                  : 'text-[#6B7280] hover:text-[#1A1A1A] transition-colors'
              }`}
            >
              Documents
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-3 pb-4">
              {activeTab === 'projects' && (
                <div className="space-y-3">
                  {/* Search Row */}
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

                  {/* Project Cards Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {isLoadingProjects ? (
                      // Loading state
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
                    ) : (
                      <>
                        {projects
                          .filter(project => filterBySearch(project, searchProjects))
                          .map((project) => (
                            <Link 
                              key={project.id}
                              href={`/projects/${project.id}`}
                              className="p-4 rounded-lg bg-white border border-[#E4E5E1] shadow-sm hover:border-[#BBBDB7] hover:bg-[#FAFAFA] transition-all cursor-pointer group flex flex-col h-[160px]"
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                                  Updated {project.updatedAt}
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
                                {project.client_name && (
                                  <div className="flex items-center gap-1 text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      x="0px" 
                                      y="0px" 
                                      width="15" 
                                      height="15" 
                                      viewBox="0 0 24 24"
                                      className="fill-current text-[#1A1A1A]"
                                    >
                                      <path d="M 3 3 A 1.0001 1.0001 0 0 0 2 4 L 2 20 A 1.0001 1.0001 0 0 0 3 21 L 15 21 L 21 21 A 1.0001 1.0001 0 0 0 22 20 L 22 8 A 1.0001 1.0001 0 0 0 21 7 L 16 7 L 16 4 A 1.0001 1.0001 0 0 0 15 3 L 3 3 z M 4 5 L 14 5 L 14 7.8320312 A 1.0001 1.0001 0 0 0 14 8.1582031 L 14 19 L 4 19 L 4 5 z M 6 7 L 6 9 L 8 9 L 8 7 L 6 7 z M 10 7 L 10 9 L 12 9 L 12 7 L 10 7 z M 16 9 L 20 9 L 20 19 L 16 19 L 16 17 L 18 17 L 18 15 L 16 15 L 16 13 L 18 13 L 18 11 L 16 11 L 16 9 z M 6 11 L 6 13 L 8 13 L 8 11 L 6 11 z M 10 11 L 10 13 L 12 13 L 12 11 L 10 11 z M 6 15 L 6 17 L 8 17 L 8 15 L 6 15 z M 10 15 L 10 17 L 12 17 L 12 15 L 10 15 z"></path>
                                    </svg>
                                    <span>{project.client_name}</span>
                                  </div>
                                )}
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
                                    {project.document_count} documents
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}

                        {/* Create new project card */}
                        <div 
                          onClick={() => setIsCreateProjectModalOpen(true)}
                          className="p-4 rounded-lg border-2 border-dashed border-[#E4E5E1] hover:border-[#BBBDB7] hover:bg-[#FAFAFA] transition-all cursor-pointer group flex flex-col h-[160px] items-center justify-center"
                        >
                          <div className="flex flex-col items-center text-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              x="0px" 
                              y="0px" 
                              width="24" 
                              height="24" 
                              viewBox="0 0 24 24"
                              className="fill-current mb-[14px] text-[#646462] group-hover:text-[#1A1A1A]"
                            >
                              <path d="M 4.25 4 C 3.013 4 2 5.012 2 6.25 L 2 18.75 C 2 19.987 3.013 21 4.25 21 L 11 21 C 11.552 21 12 20.552 12 20 C 12 19.447 11.552 19 11 19 L 4.25 19 C 4.112 19 4 18.888 4 18.75 L 4 6.25 C 4 6.112 4.112 6 4.25 6 L 7.3789062 6 C 7.5119063 6 7.6394219 6.0534844 7.7324219 6.1464844 L 8.8535156 7.2675781 C 9.3225156 7.7355781 9.9580938 8 10.621094 8 L 19.75 8 C 19.888 8 20 8.112 20 8.25 L 20 11 C 20 11.552 20.448 12 21 12 C 21.552 12 22 11.552 22 11 L 22 8.25 C 22 7.012 20.987 6 19.75 6 L 10.621094 6 C 10.488094 6 10.360578 5.9465156 10.267578 5.8535156 L 9.1464844 4.7324219 C 8.6774844 4.2634219 8.0419062 4 7.3789062 4 L 4.25 4 z M 19 14 C 16.239 14 14 16.239 14 19 C 14 21.761 16.239 24 19 24 C 21.761 24 24 21.761 24 19 C 24 16.239 21.761 14 19 14 z M 19 16 C 19.414 16 19.75 16.336 19.75 16.75 L 19.75 18.25 L 21.25 18.25 C 21.664 18.25 22 18.586 22 19 C 22 19.414 21.664 19.75 21.25 19.75 L 19.75 19.75 L 19.75 21.25 C 19.75 21.664 19.414 22 19 22 C 18.586 22 18.25 21.664 18.25 21.25 L 18.25 19.75 L 16.75 19.75 C 16.336 19.75 16 19.414 16 19 C 16 18.586 16.336 18.25 16.75 18.25 L 18.25 18.25 L 18.25 16.75 C 18.25 16.336 18.586 16 19 16 z" />
                            </svg>
                            <h3 className="text-[15px] leading-[20px] font-medium font-oracle text-[#1A1A1A] mb-1">
                              New project
                            </h3>
                            <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                              Projects can contain up to 1,000 files
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-3">
                  {/* Search Row */}
                  <div className="flex items-center justify-between">
                    <div className="w-[320px]">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchDocuments}
                          onChange={(e) => setSearchDocuments(e.target.value)}
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

                    <div className="flex items-center gap-1.5">
                      {selectedDocuments.size > 0 && (
                        <>
                          <button
                            onClick={async () => {
                              const selectedIds = Array.from(selectedDocuments);
                              await archiveDocuments(selectedIds);
                              setSelectedDocuments(new Set());
                            }}
                            className="bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3 h-[28px] rounded-full font-oracle font-[500] text-[14px] leading-[20px] transition-colors border border-[#E4E5E1]"
                          >
                            Remove {selectedDocuments.size > 1 ? 'all' : ''}
                          </button>

                          <button
                            onClick={async () => {
                              setIsDownloading(true);
                              try {
                                if (selectedDocuments.size === 1) {
                                  const selectedDoc = completedDocuments.find(doc => 
                                    selectedDocuments.has(doc.id)
                                  )!;
                                  await downloadSingleFile(selectedDoc.url, selectedDoc.name);
                                } else {
                                  const selectedDocs = completedDocuments.filter(doc => 
                                    selectedDocuments.has(doc.id)
                                  );
                                  await downloadMultipleFiles(selectedDocs);
                                }
                              } catch (error) {
                                console.error('Error downloading:', error);
                                toast.error('Failed to download files');
                              } finally {
                                setIsDownloading(false);
                              }
                            }}
                            disabled={isDownloading}
                            className={`bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3 h-[28px] rounded-full font-oracle font-[500] text-[14px] leading-[20px] transition-colors border border-[#E4E5E1] ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isDownloading ? 'Downloading...' : `Download ${selectedDocuments.size > 1 ? 'all' : ''}`}
                          </button>

                          <div className="relative" ref={assignDropdownRef}>
                            <button
                              onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                              disabled={isAssigning}
                              className={`bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3 h-[28px] rounded-full font-oracle font-[500] text-[14px] leading-[20px] transition-colors border border-[#E4E5E1] flex items-center gap-1 ${isAssigning ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isAssigning ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle 
                                      className="opacity-25" 
                                      cx="12" 
                                      cy="12" 
                                      r="10" 
                                      stroke="currentColor" 
                                      strokeWidth="4"
                                      fill="none"
                                    />
                                    <path 
                                      className="opacity-75" 
                                      fill="currentColor" 
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span>Assigning...</span>
                                </>
                              ) : (
                                <>
                                  <span>Assign to</span>
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24"
                                    className={`w-4 h-4 transition-transform ${isAssignDropdownOpen ? 'rotate-180' : ''}`}
                                  >
                                    <path 
                                      d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </>
                              )}
                            </button>

                            {isAssignDropdownOpen && !isAssigning && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg overflow-hidden min-w-[200px] z-50">
                                <div className="max-h-[240px] overflow-y-auto py-1">
                                  {projects.map((project) => (
                                    <label 
                                      key={project.id}
                                      className="flex items-center gap-3 px-3 py-2 hover:bg-[#F7F7F6] cursor-pointer"
                                    >
                                      <div className="relative w-4 h-4">
                                        <input
                                          type="checkbox"
                                          checked={selectedProjectIds.includes(project.id)}
                                          onChange={(e) => {
                                            const newSelected = e.target.checked
                                              ? [...selectedProjectIds, project.id]
                                              : selectedProjectIds.filter(id => id !== project.id)
                                            setSelectedProjectIds(newSelected)
                                          }}
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
                                      <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] truncate max-w-[150px]">
                                        {project.name}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                                <div className="border-t border-[#E4E5E1] p-2 flex justify-end">
                                  <button
                                    onClick={() => {
                                      assignDocumentsToProject(selectedProjectIds);
                                      setIsAssignDropdownOpen(false);
                                    }}
                                    className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 h-[28px] rounded-full font-oracle font-[500] text-[14px] leading-[20px] transition-colors"
                                  >
                                    Assign
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      <button
                        onClick={() => setIsUploadDocumentModalOpen(true)}
                        className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 h-[28px] rounded-full font-oracle font-medium text-[14px] leading-[20px] transition-colors"
                      >
                        Add document
                      </button>
                    </div>
                  </div>

                  {/* Documents Table */}
                  <div className="w-full">
                    <div className="grid grid-cols-[24px_2fr_1fr_1fr_1fr_32px] gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80">
                      <div className="w-4 flex items-center">
                        <div className="relative w-4 h-4">
                          <input
                            type="checkbox"
                            className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                            checked={completedDocuments.length > 0 && selectedDocuments.size === completedDocuments.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments(new Set(completedDocuments.map(doc => doc.id)));
                              } else {
                                setSelectedDocuments(new Set());
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
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Name</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Project</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Type</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Date Uploaded</div>
                      <div></div>
                    </div>

                    <div className="divide-y divide-[#E4E5E1]">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((document) => (
                          <div 
                            key={document.id}
                            className="grid grid-cols-[24px_2fr_1fr_1fr_1fr_32px] gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4"
                            onClick={() => hasUrl(document) && handleCompletedDocClick(document.url)}
                          >
                            <div 
                              className="w-4 relative z-10 flex items-center opacity-0 group-hover:opacity-100 [&:has(input:checked)]:opacity-100 transition-opacity" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="relative w-4 h-4">
                                <input
                                  type="checkbox"
                                  className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                                  checked={selectedDocuments.has(document.id)}
                                  onChange={() => {
                                    setSelectedDocuments(prev => {
                                      const next = new Set(prev);
                                      if (next.has(document.id)) {
                                        next.delete(document.id);
                                      } else {
                                        next.add(document.id);
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
                            <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">{document.name}</div>
                            <div 
                              className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative"
                              onMouseEnter={(e) => {
                                const projectCount = document.project_names?.length ?? 0;
                                if (projectCount > 1) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredRowId(document.id);
                                  setTooltipPosition({
                                    x: rect.left + (rect.width / 2),
                                    y: rect.top
                                  });
                                }
                              }}
                              onMouseLeave={() => setHoveredRowId(null)}
                            >
                              {formatProjectDisplay(document.project_names)}
                              
                              {/* Tooltip */}
                              {hoveredRowId === document.id && (document.project_names?.length ?? 0) > 1 && (
                                <div 
                                  className="absolute z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px]"
                                  style={{
                                    top: -8,
                                    left: '50%',
                                    transform: 'translate(-50%, -100%)',
                                    pointerEvents: 'none'
                                  }}
                                >
                                  <ul className="list-disc pl-4 space-y-1">
                                    {document.project_names?.map((projectName, i) => (
                                      <li 
                                        key={i}
                                        className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-nowrap"
                                      >
                                        {projectName}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                              {hasType(document) && document.type ? (
                                <span className="inline-block px-2 py-0.5 rounded-[6px] bg-[#F7F7F6] text-[#1A1A1A]">
                                  {document.type}
                                </span>
                              ) : '—'}
                            </div>
                            <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                              {hasDate(document) ? document.date : '—'}
                            </div>
                            <div className="relative flex justify-end">
                              <DocumentRowMenu 
                                onEditNote={() => {
                                  setSelectedDocument(document);
                                  setIsEditNoteModalOpen(true);
                                }}
                                onArchive={async () => {
                                  await archiveDocuments([document.id]);
                                }}
                                onDownload={async () => {
                                  if (hasUrl(document)) {
                                    await downloadSingleFile(document.url, document.name);
                                  }
                                }}
                                isRowHovered={hoveredRowId === document.id}
                              />
                            </div>
                          </div>
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
                            {searchDocuments ? 'No documents found' : 'No documents yet'}
                          </h3>
                          <p className="text-[14px] leading-[20px] text-[#646462]">
                            {searchDocuments 
                              ? 'Try adjusting your search terms'
                              : 'Upload a document to get started'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {isEditNoteModalOpen && selectedDocument && (
        <EditNoteModal
          isOpen={isEditNoteModalOpen}
          onClose={() => {
            setIsEditNoteModalOpen(false);
            setSelectedDocument(null);
          }}
          documentId={selectedDocument.id}
          initialType={selectedDocument.type || null}
          initialProjectIds={selectedDocument.project_names?.map((name) => {
            const project = projects.find(p => p.name === name);
            return project?.id;
          }).filter((id): id is string => id !== undefined) || []}
          onUpdateComplete={() => {
            handleDocumentUpdate();
          }}
        />
      )}

      <UploadDocumentModal
        isOpen={isUploadDocumentModalOpen}
        onClose={() => {
          setIsUploadDocumentModalOpen(false);
        }}
        onUploadComplete={fetchDocuments}
      />
    </div>
  );
} 