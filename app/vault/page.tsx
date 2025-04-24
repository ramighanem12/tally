'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import AIChatPanel from '../components/AIChatPanel'
import AIChatButton from '../components/AIChatButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import DocumentTypeFilter from '../components/DocumentTypeFilter'
import DocumentFilters from '../components/DocumentFilters'
import AddToProjectPanel from '../components/AddToProjectPanel'
import DocumentPanel from '../components/DocumentPanel'
import SelectionIsland from '../components/SelectionIsland'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import FilePreviewModal from '../components/FilePreviewModal'

// Add icons for the action cards
const PlusIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M7.5 12.5C10.2614 12.5 12.5 10.2614 12.5 7.5C12.5 4.73858 10.2614 2.5 7.5 2.5C4.73858 2.5 2.5 4.73858 2.5 7.5C2.5 10.2614 4.73858 12.5 7.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11.5 11.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CompareIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ExtractIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M8 2.5V13.5M8 13.5L4 9.5M8 13.5L12 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SummarizeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 3.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 8H11M5 5.5H11M5 10.5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TaxIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 3.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 8L11 8M5 5.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 10.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const AuditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M5.5 7.5L7.5 9.5L10.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 3.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const AnalyzeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 13.5H2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4.5 5.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 2.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11.5 8.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Add document icon
const DocumentIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M13.5 3.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 6.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.5 9.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

const checkboxStyle = `
  flex items-center justify-center w-4 h-4 rounded transition-colors
  bg-white border border-gray-300
  checked:bg-blue-600 checked:text-white checked:border-transparent
  hover:border-gray-400
  after:content-['']
  relative
  cursor-pointer
`;

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M2.5 4.5H13.5M4.5 8H11.5M6.5 11.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.3333 5.33333L8 2L4.66667 5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 ${className}`} viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="3.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 2.5L6 4.5M10 2.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

type VaultFile = {
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
  metadata?: Record<string, any>;
  projects: Array<{
    id: string;
    name: string;
  }>;
};

const DocumentUploadIcon = ({ className = "" }: { className?: string }) => (
  <div className="relative">
    <svg className="w-10 h-10 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  </div>
);

export default function VaultPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'name' | 'document_type' | 'kind' | 'uploaded_at'>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isNewDocumentOpen, setIsNewDocumentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [documentTypeSearch, setDocumentTypeSearch] = useState('');
  const [kindSearch, setKindSearch] = useState('');
  const [isNewProjectDropdownOpen, setIsNewProjectDropdownOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const newProjectDropdownRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; fileCount: number }>>([]);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<VaultFile | null>(null);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const workflowDropdownRef = useRef<HTMLDivElement>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);

  useEffect(() => {
    if (user && !initialLoadDone) {
      setIsLoading(true);
      Promise.all([loadDocuments(), loadProjects()]).finally(() => {
        setTimeout(() => {
          setIsLoading(false);
          setInitialLoadDone(true);
        }, 1000);
      });
    }
  }, [user, initialLoadDone]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('vault')
        .select('*')
        .eq('uploaded_by', user?.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Initialize empty projects array for each document
      const transformedDocs = data?.map(doc => ({
        ...doc,
        projects: []
      }));

      setFiles(transformedDocs || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, 
          name,
          document_projects:document_projects(count)
        `)
        .eq('uploaded_by', user?.id)
        .order('name');

      if (error) throw error;

      // Transform the data to include the file count
      const transformedProjects = data?.map(project => ({
        id: project.id,
        name: project.name,
        fileCount: project.document_projects[0]?.count || 0
      }));

      setProjects(transformedProjects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

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

    setIsUploading(true);
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
          document_type: documentType,
          kind: kind,
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
      
      await loadDocuments(); // Refresh the documents list
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload ${file.name}: ${error.message}`, {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsUploading(false);
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

  const handleDelete = async (fileIds: string[]) => {
    if (!fileIds.length) return;

    try {
      // Get the files to delete
      const filesToDelete = files.filter(f => fileIds.includes(f.id));
      
      // Delete from vault table
      const { error: dbError } = await supabase
        .from('vault')
        .delete()
        .in('id', fileIds);

      if (dbError) throw dbError;

      // Delete from storage if storage_path exists
      const storagePaths = filesToDelete
        .filter(f => f.storage_path)
        .map(f => f.storage_path as string);

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove(storagePaths);

        if (storageError) {
          console.warn(`Some files may remain in storage:`, storageError);
        }
      }

      toast.success(`${fileIds.length} file${fileIds.length === 1 ? '' : 's'} deleted successfully`);
      setSelectedFiles([]); // Clear selection
      await loadDocuments(); // Refresh the documents list
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete files');
    }
  };

  const handleSort = (field: 'name' | 'document_type' | 'kind' | 'uploaded_at') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'uploaded_at' ? 'desc' : 'asc');
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
      selectedFiles.length === sortedDocuments.length
        ? []
        : sortedDocuments.map(file => file.id)
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.document_type && file.document_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (file.kind && file.kind.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDocType = selectedDocTypes.length === 0 || selectedDocTypes.includes(file.document_type);
    const matchesKind = selectedKinds.length === 0 || selectedKinds.includes(file.kind);

    return matchesSearch && matchesDocType && matchesKind;
  });

  const sortedDocuments = [...filteredFiles].sort((a, b) => {
    if (sortField === 'uploaded_at') {
      return sortDirection === 'asc'
        ? new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
        : new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    }

    const aValue = a[sortField]?.toLowerCase() || '';
    const bValue = b[sortField]?.toLowerCase() || '';

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Add click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNewDocumentOpen && !(event.target as Element).closest('.document-dropdown')) {
        setIsNewDocumentOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNewDocumentOpen]);

  // Add function to handle file input change
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      setIsNewDocumentOpen(false); // Close dropdown after upload
    }
  };

  // Add click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.relative')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleProjectCreated = () => {
    loadDocuments(); // Refresh documents after project creation
  };

  // Add click outside handler for project dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      // Create entries in the junction table for each selected document
      const documentProjects = selectedFiles.map(docId => ({
        document_id: docId,
        project_id: projectId,
        created_by: user.id
      }));

      const { error } = await supabase
        .from('document_projects')
        .upsert(documentProjects, {
          onConflict: 'document_id,project_id',
          ignoreDuplicates: true
        });

      if (error) throw error;

      toast.success('Files added to project successfully');
      setIsProjectDropdownOpen(false);
      setSelectedFiles([]); // Clear selection to dismiss the island
      loadDocuments(); // Refresh the documents list
      loadProjects(); // Refresh the projects list
    } catch (error: any) {
      console.error('Error adding files to project:', error);
      toast.error('Failed to add files to project');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Add click outside handler for new project dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newProjectDropdownRef.current && !newProjectDropdownRef.current.contains(event.target as Node)) {
        setIsNewProjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateProject = async () => {
    if (!user || !newProjectName.trim()) return;

    try {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Associate selected documents with the new project
      const documentProjects = selectedFiles.map(docId => ({
        document_id: docId,
        project_id: project.id,
        created_by: user.id
      }));

      const { error: linkError } = await supabase
        .from('document_projects')
        .insert(documentProjects);

      if (linkError) throw linkError;

      toast.success('Project created successfully');
      setNewProjectName('');
      setIsNewProjectDropdownOpen(false);
      setSelectedFiles([]); // Clear selection to dismiss the island
      loadDocuments(); // Refresh the documents list
      loadProjects(); // Refresh the projects list
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleDownload = async (fileIds: string[]) => {
    try {
      // Get the selected files with their storage paths
      const selectedFilesToDownload = files.filter(file => fileIds.includes(file.id));
      
      if (selectedFilesToDownload.length === 0) {
        toast.error('No files selected for download');
        return;
      }

      // If only one file, download directly
      if (selectedFilesToDownload.length === 1) {
        const file = selectedFilesToDownload[0];
        if (!file.storage_path) {
          toast.error('File not available for download');
          return;
        }
        
        const loadingToast = toast.loading('Preparing download...');
        
        try {
          // Get fresh signed URL
          const { data: signedData, error: signedError } = await supabase.storage
            .from('documents')
            .createSignedUrl(file.storage_path, 60); // 60 seconds expiry

          if (signedError || !signedData?.signedUrl) {
            toast.error('Failed to generate download link', {
              id: loadingToast
            });
            return;
          }

          // Fetch the file and save it
          const response = await fetch(signedData.signedUrl);
          const blob = await response.blob();
          saveAs(blob, file.name);
          
          toast.success('Download started', {
            id: loadingToast
          });
        } catch (error) {
          console.error('Error downloading file:', error);
          toast.error('Failed to download file', {
            id: loadingToast
          });
        }
        return;
      }

      // For multiple files, create a zip
      const zip = new JSZip();
      const loadingToast = toast.loading('Preparing files for download...');

      // Add each file to the zip
      for (const file of selectedFilesToDownload) {
        if (!file.storage_path) continue;
        
        try {
          // Get fresh signed URL for each file
          const { data: signedData, error: signedError } = await supabase.storage
            .from('documents')
            .createSignedUrl(file.storage_path, 60); // 60 seconds expiry

          if (signedError || !signedData?.signedUrl) {
            console.error(`Error getting signed URL for ${file.name}:`, signedError);
            continue;
          }

          const response = await fetch(signedData.signedUrl);
          const blob = await response.blob();
          zip.file(file.name, blob);
        } catch (error) {
          console.error(`Error adding ${file.name} to zip:`, error);
        }
      }

      // Generate and download the zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'documents.zip');

      toast.success('Download started', {
        id: loadingToast
      });
    } catch (error) {
      console.error('Error downloading files:', error);
      toast.error('Failed to download files');
    }
  };

  const handleFileClick = async (file: VaultFile, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If file has a URL, show it directly
    if (file.url) {
      setPreviewFile(file);
      return;
    }

    // Otherwise get a fresh signed URL
    if (file.storage_path) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(file.storage_path, 3600); // 1 hour expiry

      if (signedError) {
        console.error('Error getting signed URL:', signedError);
        toast.error('Failed to load file preview');
        return;
      }

      setPreviewFile({
        ...file,
        url: signedData.signedUrl
      });
    }
  };

  return (
    <>
      <div className="flex h-screen">
        <CopilotNavigation selectedTab="library" />
        <div className="flex-1 p-4 pl-0 bg-[#F5F6F8] overflow-hidden">
          <main className="h-full rounded-xl bg-white overflow-hidden">
            <div className="px-[48px] py-4 mt-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <h1 className="text-[18px] font-semibold text-gray-900">
                    Documents
                  </h1>
                  {/* <p className="text-[#707070] text-[14px] font-medium max-w-[500px]">
                    Store and manage all your documents in one place. Upload files, organize them, and share them securely.
                  </p> */}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-[300px]">
                    <input
                      type="text"
                      placeholder="Search documents..."
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
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv';
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          handleFileUpload(target.files);
                        }
                      };
                      input.click();
                    }}
                    className="h-8 px-3 text-[13px] font-medium text-white bg-gray-800 border border-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Add document
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="bg-white h-full flex flex-col border-t border-gray-200">
                <div className="flex-1 overflow-y-auto">
                  <div className="min-w-[990px] w-full">
                    <table className="w-full table-fixed border-collapse relative">
                      <colgroup>
                        <col style={{ width: '64px' }} />
                        <col style={{ width: '280px' }} />
                        <col style={{ width: '200px' }} />
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '146px' }} />
                      </colgroup>
                      <thead className="sticky top-0 bg-white z-10">
                        <tr>
                          <th className="sticky top-0 bg-white pl-6 pr-4 py-1.5 border-r border-gray-200 z-10 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                            <div className="flex items-center justify-center h-full cursor-pointer">
                              <div
                                className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                                  selectedFiles.length === sortedDocuments.length && sortedDocuments.length > 0
                                    ? 'bg-blue-600 text-white border-transparent'
                                    : 'bg-white border border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={handleSelectAll}
                              >
                                {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 && (
                                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 w-[280px] text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                            <button 
                              onClick={() => handleSort('name')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              File
                              <SortIcon 
                                active={sortField === 'name'} 
                                direction={sortField === 'name' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 w-[200px] text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                            <button 
                              onClick={() => handleSort('document_type')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              Document Type
                              <SortIcon 
                                active={sortField === 'document_type'} 
                                direction={sortField === 'document_type' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 w-[150px] text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                            <button 
                              onClick={() => handleSort('kind')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              File Type
                              <SortIcon 
                                active={sortField === 'kind'} 
                                direction={sortField === 'kind' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 w-[150px] text-left text-[13px] font-medium text-gray-500 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                            <button 
                              onClick={() => handleSort('uploaded_at')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              Last Modified
                              <SortIcon 
                                active={sortField === 'uploaded_at'} 
                                direction={sortField === 'uploaded_at' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y divide-gray-200`}>
                        {isLoading ? (
                          // Loading skeleton rows
                          [...Array(8)].map((_, index) => (
                            <tr key={index} className={`animate-pulse ${index === 7 ? '[&>td]:border-b [&>td]:border-gray-200' : ''}`}>
                              <td className="pl-6 pr-4 py-1.5 w-[40px] border-r border-gray-200">
                                <div className="flex items-center justify-center">
                                  <div className="w-4 h-4 bg-gray-200 rounded" />
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 w-[280px] border-r border-gray-200">
                                <div className="w-[200px] h-[26px] bg-gray-200 rounded-lg" />
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="w-[120px] h-[26px] bg-gray-200 rounded-lg" />
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="w-[100px] h-[26px] bg-gray-200 rounded-lg" />
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5">
                                <div className="w-[100px] h-[26px] bg-gray-200 rounded-lg" />
                              </td>
                            </tr>
                          ))
                        ) : filteredFiles.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="pl-12 pr-6 py-1.5 h-[400px] border-b border-gray-200">
                              <div className="flex flex-col items-center justify-center h-full">
                                <svg className="w-6 h-6 text-gray-400 mb-3" viewBox="0 0 24 24" fill="none">
                                  <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p className="text-sm text-gray-500">No files found</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          sortedDocuments.map((file) => (
                            <tr 
                              key={file.id}
                              className="hover:bg-gray-50 cursor-pointer last:hover:rounded-b-xl [&:last-child>td:first-child]:rounded-bl-xl [&:last-child>td:last-child]:rounded-br-xl [&:last-child>td]:border-b [&:last-child>td]:border-gray-200"
                              onClick={(e) => handleFileClick(file, e)}
                            >
                              <td className="pl-6 pr-4 py-1.5 w-[40px] border-r border-gray-200 relative z-0" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                                      selectedFiles.includes(file.id)
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white border border-gray-300 hover:border-gray-400'
                                    }`}
                                    onClick={() => handleSelectFile(file.id)}
                                  >
                                    {selectedFiles.includes(file.id) && (
                                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 w-[280px] border-r border-gray-200">
                                <div className="w-[280px]">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[13px] font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg">
                                    <DocumentIcon className="flex-shrink-0 text-gray-500" />
                                    <span className="truncate max-w-[240px]">{file.name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex px-2 py-0.5 text-[13px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg max-w-full">
                                    <span className="truncate">{file.document_type || '-'}</span>
                                  </span>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="flex items-center">
                                  <div className="flex items-center gap-1.5">
                                    {file.kind === 'PDF' && (
                                      <img src="/pdflogo.svg" alt="PDF file" className="w-3.5 h-3.5" />
                                    )}
                                    {(file.kind === 'Word' || file.kind === 'DOC') && (
                                      <img src="/doc.svg" alt="Word file" className="w-3.5 h-3.5" />
                                    )}
                                    {(file.kind === 'Excel' || file.kind === 'CSV' || file.kind === 'Spreadsheet') && (
                                      <img src="/excel.svg" alt="Excel file" className="w-3.5 h-3.5" />
                                    )}
                                    <span className="text-[13px] font-medium text-gray-900">
                                      {file.kind ? (file.kind === 'CSV' ? 'Spreadsheet' : file.kind) : '-'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5">
                                <div className="flex items-center h-[26px] max-w-full">
                                  <span className="text-[13px] font-medium text-gray-900 truncate">
                                    {new Date(file.uploaded_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
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
          <SelectionIsland 
            selectedFiles={selectedFiles}
            onDelete={handleDelete}
            onAddToProject={() => setIsProjectDropdownOpen(true)}
            onDownload={handleDownload}
          />
        </div>
        <AIChatPanel
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
        />
        {selectedDocument && (
          <DocumentPanel
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
        {isProjectDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 z-50" 
              onClick={() => setIsProjectDropdownOpen(false)}
            />
            <div 
              ref={dropdownRef}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[320px] bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50"
            >
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
                />
              </div>
              <div className="max-h-[240px] overflow-y-auto p-2">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleAddToProject(project.id)}
                      className="w-full px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-between group"
                    >
                      <span className="truncate mr-2">{project.name}</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-700">
                        {project.fileCount} file{project.fileCount === 1 ? '' : 's'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No projects found
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-200">
                <div ref={newProjectDropdownRef}>
                  {isNewProjectDropdownOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Project name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
                        autoFocus
                      />
                      <button
                        onClick={handleCreateProject}
                        disabled={!newProjectName.trim()}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsNewProjectDropdownOpen(true)}
                      className="w-full px-3 py-1.5 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1.5"
                    >
                      <PlusIcon />
                      New project
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
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
    </>
  )
} 