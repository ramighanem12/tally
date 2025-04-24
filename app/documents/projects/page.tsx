'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import ProjectFilters from '../../components/ProjectFilters'
import NewProjectPanel from '../../components/NewProjectPanel'
import ShareModal from '../../components/ShareModal'
import { PostgrestResponse } from '@supabase/supabase-js'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Add icons for the action cards
const PlusIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

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

const DocumentIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 text-gray-500 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M13.5 3.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 6.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.5 9.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const checkboxStyle = `
  appearance-none
  w-[18px] h-[18px]
  border border-gray-300 dark:border-gray-600
  rounded-[4px]
  bg-white dark:bg-gray-800
  checked:bg-gray-900 checked:border-gray-900
  dark:checked:bg-gray-900 dark:checked:border-gray-900
  hover:border-gray-400 dark:hover:border-gray-500
  focus:outline-none focus:ring-2 focus:ring-gray-900/10
  transition-all duration-200
  relative
  cursor-pointer
  after:content-[''] after:absolute
  after:left-1/2 after:top-1/2 
  after:w-[10px] after:h-[10px]
  after:opacity-0 after:scale-50
  checked:after:opacity-100 checked:after:scale-100
  after:transition-all after:duration-200
  after:-translate-x-1/2 after:-translate-y-1/2
  after:bg-no-repeat after:bg-center
  checked:after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')]
`;

interface ProjectFile {
  id: string;
  name: string;
  url?: string;
  storage_path?: string;
  uploaded_by: string;
  uploaded_at: string;
  type: string;
  size: number;
  mime_type: string;
  document_type: string;
  kind: string;
  industry: string;
  metadata?: Record<string, any>;
  fileCount: number;
}

interface ProjectFileDocument {
  id: string;
  name: string;
  document_type: string;
}

interface VaultDocument {
  id: string;
  name: string;
  document_type: string;
}

interface DocumentProjectJoin {
  document_id: string;
  vault: VaultDocument;
}

interface ProjectFiltersProps {
  activeDropdown: string | null;
  setActiveDropdown: (dropdown: string | null) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedClients: string[];
  setSelectedClients: (clients: string[]) => void;
  sortedFiles: ProjectFile[];
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'name' | 'document_type' | 'industry' | 'uploaded_at' | 'fileCount'>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBuildQueryDropdownOpen, setIsBuildQueryDropdownOpen] = useState(false);
  const buildQueryDropdownRef = useRef<HTMLDivElement>(null);
  const [queryTemplateSearch, setQueryTemplateSearch] = useState('');
  const [isWorkflowDropdownOpen, setIsWorkflowDropdownOpen] = useState(false);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const workflowDropdownRef = useRef<HTMLDivElement>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Add available workflows (would typically come from your backend/API)
  const AVAILABLE_WORKFLOWS = [
    {
      id: 'financial-statement-review',
      name: 'Financial Statement Review',
    },
    {
      id: 'cash-balance',
      name: 'Tie-out Cash Balance',
    },
    {
      id: 'accounts-receivable',
      name: 'Accounts Receivable Aging',
    }
  ];

  // Add click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add click outside handler for build query dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buildQueryDropdownRef.current && !buildQueryDropdownRef.current.contains(event.target as Node)) {
        setIsBuildQueryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add click outside handler for workflow dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workflowDropdownRef.current && !workflowDropdownRef.current.contains(event.target as Node)) {
        setIsWorkflowDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && !initialLoadDone) {
      setIsLoading(true);
      loadProjects().finally(() => {
        setTimeout(() => {
          setIsLoading(false);
          setInitialLoadDone(true);
        }, 1000);
      });
    }
  }, [user, initialLoadDone]);

  const loadProjects = async () => {
    if (!user) {
      toast.error('Please sign in to view projects');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          document_projects:document_projects(count)
        `)
        .eq('uploaded_by', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        toast.error('Failed to load projects');
        return;
      }

      // Transform the data to include fileCount
      const transformedData = data?.map(project => ({
        ...project,
        fileCount: project.document_projects[0]?.count || 0
      }));

      setFiles(transformedData || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const handleDelete = async (fileIds: string[]) => {
    if (!fileIds.length || !user) return;

    try {
      // Get the files to delete
      const filesToDelete = files.filter(f => fileIds.includes(f.id));
      
      // Delete from projects table
      const { error: dbError } = await supabase
        .from('projects')
        .delete()
        .eq('uploaded_by', user.id)  // Ensure user can only delete their own files
        .in('id', fileIds);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        toast.error('Failed to delete projects');
        return;
      }

      // Delete from storage if storage_path exists
      const storagePaths = filesToDelete
        .filter(f => f.storage_path)
        .map(f => f.storage_path as string);

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove(storagePaths);

        if (storageError) {
          console.warn('Some files may remain in storage:', storageError);
          toast.warning('Some files may remain in storage');
        }
      }

      toast.success(`${fileIds.length} project${fileIds.length === 1 ? '' : 's'} deleted successfully`);
      setSelectedFiles([]); // Clear selection
      await loadProjects(); // Refresh the projects list
    } catch (error) {
      console.error('Error deleting projects:', error);
      toast.error('Failed to delete projects');
    }
  };

  const handleSort = (field: 'name' | 'document_type' | 'industry' | 'uploaded_at' | 'fileCount') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFiles(
      selectedFiles.length === files.length
        ? []
        : files.map(file => file.id)
    );
  };

  // Filter files based on search query and selected filters
  const filteredFiles = files.filter(file => {
    // Active/Past filter
    const now = new Date();
    const fileDate = new Date(file.uploaded_at);
    const isActive = fileDate >= new Date(now.setMonth(now.getMonth() - 3)); // Active if less than 3 months old
    
    if (activeTab === 'active' && !isActive) return false;
    if (activeTab === 'past' && isActive) return false;

    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const searchableFields = [
        file.name,
        file.document_type,
        file.industry
      ].filter(Boolean);
      
      if (!searchableFields.some(field => field?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Type filter
    if (selectedTypes.length > 0) {
      if (!file.document_type || !selectedTypes.includes(file.document_type)) {
        return false;
      }
    }

    // Client filter
    if (selectedClients.length > 0) {
      if (!file.industry || !selectedClients.includes(file.industry)) {
        return false;
      }
    }

    return true;
  });

  // Add sorting logic
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortField === 'uploaded_at') {
      return sortDirection === 'asc'
        ? new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
        : new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    }

    if (sortField === 'fileCount') {
      return sortDirection === 'asc'
        ? a.fileCount - b.fileCount
        : b.fileCount - a.fileCount;
    }

    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleFileUpload = async (fileOrFiles: File | FileList) => {
    if (fileOrFiles instanceof FileList) {
      // Handle multiple files
      const fileArray = Array.from(fileOrFiles);
      for (const file of fileArray) {
        await uploadSingleFile(file);
      }
    } else {
      // Handle single file
      await uploadSingleFile(fileOrFiles);
    }
  };

  const uploadSingleFile = async (file: File) => {
    if (!file || !user) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const loadingToast = toast.loading('Uploading document...');

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `public/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 31536000); // 1 year expiry

      if (signedError) throw signedError;

      // Determine document type and kind
      const documentType = determineDocumentType(file.name);
      const kind = determineKind(file.name);

      // 3. Create document record in the vault table
      const { data: doc, error: dbError } = await supabase
        .from('vault')
        .insert([{
          name: file.name,
          url: signedData.signedUrl,
          storage_path: filePath,
          uploaded_by: user.id,
          type: file.type,
          size: file.size,
          mime_type: file.type,
          document_type: documentType || '-',
          kind: kind || '-',
          industry: '-',
          metadata: {}
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success(`${file.name} uploaded successfully`, {
        id: loadingToast,
        duration: 4000,
      });
      
      await loadProjects(); // Refresh the documents list
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload ${file.name}: ${error.message}`, {
        id: loadingToast,
        duration: 4000,
      });
    }
  };

  const determineDocumentType = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Spreadsheet';
      case 'csv':
        return 'CSV File';
      default:
        return 'Other';
    }
  };

  const determineKind = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'Spreadsheet';
      default:
        return 'Other';
    }
  };

  const handleProjectCreated = () => {
    loadProjects();
  };

  const queryTemplates = [
    '1040 Tax Prep',
    '1065 Partnership',
    '1120 Corporate',
    'Audit Prep',
    'Financial Statement',
    'Balance Sheet',
    'Income Statement',
    'Cash Flow',
    'Tax Reconciliation'
  ];

  const filteredTemplates = queryTemplates.filter(template =>
    template.toLowerCase().includes(queryTemplateSearch.toLowerCase())
  );

  const handleDownload = async (projectIds: string[]) => {
    if (!user) return;
    const loadingToast = toast.loading('Preparing download...');

    try {
      // If only one project selected, create a simple zip with its files
      if (projectIds.length === 1) {
        const project = files.find(f => f.id === projectIds[0]);
        if (!project) {
          toast.error('Project not found');
          return;
        }

        // Get all documents in this project
        const { data: projectDocs, error: docsError } = await supabase
          .from('document_projects')
          .select(`
            vault:vault (
              id,
              name,
              storage_path
            )
          `)
          .eq('project_id', project.id)
          .eq('created_by', user.id);

        if (docsError) throw docsError;

        // Extract and flatten documents
        const docs = projectDocs
          .map(item => item.vault)
          .filter(Boolean)
          .flat();

        if (docs.length === 0) {
          toast.error('No files found in project', { id: loadingToast });
          return;
        }

        const zip = new JSZip();

        // Add each file to the zip
        for (const doc of docs) {
          if (!doc.storage_path) continue;

          try {
            // Get fresh signed URL
            const { data: signedData, error: signedError } = await supabase.storage
              .from('documents')
              .createSignedUrl(doc.storage_path, 60);

            if (signedError || !signedData?.signedUrl) {
              console.error(`Error getting signed URL for ${doc.name}:`, signedError);
              continue;
            }

            const response = await fetch(signedData.signedUrl);
            const blob = await response.blob();
            zip.file(doc.name, blob);
          } catch (error) {
            console.error(`Error adding ${doc.name} to zip:`, error);
          }
        }

        // Generate and download the zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${project.name}.zip`);
        toast.success('Download started', { id: loadingToast });
        return;
      }

      // For multiple projects, create a zip with folders
      const zip = new JSZip();

      // Process each selected project
      for (const projectId of projectIds) {
        const project = files.find(f => f.id === projectId);
        if (!project) continue;

        // Get all documents in this project
        const { data: projectDocs, error: docsError } = await supabase
          .from('document_projects')
          .select(`
            vault:vault (
              id,
              name,
              storage_path
            )
          `)
          .eq('project_id', project.id)
          .eq('created_by', user.id);

        if (docsError) throw docsError;

        // Extract and flatten documents
        const docs = projectDocs
          .map(item => item.vault)
          .filter(Boolean)
          .flat();

        // Create a folder for this project
        const projectFolder = zip.folder(project.name);
        if (!projectFolder) continue;

        // Add each file to the project folder
        for (const doc of docs) {
          if (!doc.storage_path) continue;

          try {
            // Get fresh signed URL
            const { data: signedData, error: signedError } = await supabase.storage
              .from('documents')
              .createSignedUrl(doc.storage_path, 60);

            if (signedError || !signedData?.signedUrl) {
              console.error(`Error getting signed URL for ${doc.name}:`, signedError);
              continue;
            }

            const response = await fetch(signedData.signedUrl);
            const blob = await response.blob();
            projectFolder.file(doc.name, blob);
          } catch (error) {
            console.error(`Error adding ${doc.name} to zip:`, error);
          }
        }
      }

      // Generate and download the zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'projects.zip');
      toast.success('Download started', { id: loadingToast });
    } catch (error) {
      console.error('Error downloading projects:', error);
      toast.error('Failed to download projects', { id: loadingToast });
    }
  };

  const handleRunWorkflow = async (workflowId: string) => {
    // Navigate to the specific workflow page
    router.push(`/ai-agents/run/${workflowId}`);
    setIsWorkflowDropdownOpen(false);
  };

  const filteredWorkflows = AVAILABLE_WORKFLOWS.filter(workflow =>
    workflow.name.toLowerCase().includes(workflowSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="library" />
      <div className="flex-1 p-4 pl-0 bg-[#F5F6F8]">
        <main className="h-full rounded-xl bg-white overflow-hidden">
          <div className="px-[48px] py-4 mt-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <h1 className="text-[18px] font-semibold text-gray-900">
                  Vault
                </h1>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                      activeTab === 'active'
                        ? 'text-gray-900 bg-gray-100'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                      activeTab === 'past'
                        ? 'text-gray-900 bg-gray-100'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>
              {/* Temporarily commented out
              <div className="flex items-center gap-2">
                <div className="relative w-[300px]">
                  <input
                    type="text"
                    placeholder="Search vault..."
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
                <button 
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="h-8 px-3 text-[13px] font-medium text-white bg-gray-800 border border-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  New vault
                </button>
              </div>
              */}
            </div>
          </div>

          <div className="px-[48px] pb-8">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="h-[120px] py-3 px-4 bg-white border border-gray-200 rounded-xl relative overflow-hidden"
                  >
                    <div className="flex flex-col justify-between h-full relative">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-[20px] bg-gray-200 rounded w-2/3 animate-pulse" />
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="w-24 h-[22px] bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse" />
                        <div className="w-16 h-[18px] bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="shimmer-overlay" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <svg className="w-6 h-6 text-gray-400 mb-3" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm text-gray-500">No vaults found</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {sortedFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => router.push(`/documents/projects/${file.id}`)}
                    className="group h-[120px] py-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer relative"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gray-900 opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                    <div className="h-full flex flex-col justify-between relative">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[16px] font-medium text-gray-900 truncate pr-2">
                            {file.name}
                          </span>
                          <div 
                            className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center ${
                              selectedFiles.includes(file.id)
                                ? 'bg-blue-600 text-white border-transparent'
                                : 'bg-white border border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectFile(file.id);
                            }}
                          >
                            {selectedFiles.includes(file.id) && (
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex px-2 py-0.5 text-[13px] font-medium text-gray-900 bg-gray-100 rounded max-w-full">
                            <span className="truncate">{file.document_type || '-'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg className="w-[14.7px] h-[14.7px] text-gray-900" viewBox="0 0 24 24" fill="none">
                          <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" fill="currentColor"/>
                        </svg>
                        <span className="text-[13px] font-medium text-gray-900">
                          {file.fileCount === 0 ? 'No files' : `${file.fileCount} file${file.fileCount === 1 ? '' : 's'}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Selection Island */}
        {selectedFiles.length > 0 && (
          <>
            <div className="fixed inset-0 bg-black/5 pointer-events-none z-20" />
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
              <span className="text-sm font-medium text-gray-900">
                {selectedFiles.length} vault{selectedFiles.length === 1 ? '' : 's'} selected
              </span>
              <div className="w-px h-4 bg-gray-200 mx-2" />
              <button
                onClick={() => handleDelete(selectedFiles)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 3.5L2.5 3.5M6.5 6.5V10.5M9.5 6.5V10.5M3.5 3.5V12.5C3.5 13.0523 3.94772 13.5 4.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V3.5M5.5 3.5V2.5C5.5 1.94772 5.94772 1.5 6.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Delete
              </button>
              <button
                onClick={() => handleDownload(selectedFiles)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11.3333 5.33333L8 8.66667L4.66667 5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V8.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </button>
              <button
                onClick={() => setIsWorkflowDropdownOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                  <path d="M6.5 4.5L11.5 8L6.5 11.5V4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Run workflow
              </button>
            </div>

            {isWorkflowDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/20 z-50" 
                  onClick={() => setIsWorkflowDropdownOpen(false)}
                />
                <div 
                  ref={workflowDropdownRef}
                  className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[320px] bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search workflows..."
                      value={workflowSearch}
                      onChange={(e) => setWorkflowSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
                    />
                  </div>
                  <div className="max-h-[240px] overflow-y-auto p-2">
                    {filteredWorkflows.length > 0 ? (
                      filteredWorkflows.map((workflow) => (
                        <button
                          key={workflow.id}
                          onClick={() => handleRunWorkflow(workflow.id)}
                          className="w-full flex items-center px-2 py-1.5 text-[13px] font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
                        >
                          <span>{workflow.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No workflows found
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Modals */}
        <NewProjectPanel
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedFiles([]);
          }}
          projectId={selectedFiles[0]}
        />

        {/* Add this CSS at the end of the component, before the final closing tag */}
        <style jsx>{`
          .shimmer-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            animation: shimmer 2s infinite linear;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.3) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            transform: translateX(-100%);
          }

          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    </div>
  )
} 
