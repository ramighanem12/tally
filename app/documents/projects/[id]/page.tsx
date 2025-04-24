'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import CopilotNavigation from '../../../components/CopilotNavigation'
import DocumentFilters from '../../../components/DocumentFilters'
import UploadModal from '../../../components/UploadModal'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import FilePreviewModal from '../../../components/FilePreviewModal'

const DocumentIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 text-gray-500 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M13.5 3.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 6.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.5 9.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SortIcon = ({ className = "", active = false, direction }: { 
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

interface Document {
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
  projects: Array<{
    id: string;
    name: string;
  }>;
}

interface Project {
  id: string;
  name: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface SupabaseVaultResponse {
  document_id: string;
  vault: {
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
    projects: Array<{
      project: {
        id: string;
        name: string;
      };
    }>;
  } | null;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'document_type' | 'kind' | 'industry' | 'uploaded_at'>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const workflowDropdownRef = useRef<HTMLDivElement>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [previewFile, setPreviewFile] = useState<Document | null>(null);

  // Add click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('Click event:', event.target);
      console.log('Is inside filter-dropdown:', !!(event.target as Element).closest('.filter-dropdown'));
      if (!(event.target as Element).closest('.filter-dropdown')) {
        console.log('Setting activeDropdown to null');
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && !initialLoadDone) {
      setIsLoading(true);
      Promise.all([loadProject(), loadDocuments(), loadAvailableDocuments()]).finally(() => {
        setTimeout(() => {
          setIsLoading(false);
          setInitialLoadDone(true);
        }, 1000);
      });
    }
  }, [user, initialLoadDone]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      // Place cursor at end of text
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length);
    }
  }, [isEditingName]);

  const loadProject = async () => {
    if (!user) {
      toast.error('Please sign in to view project');
      return;
    }

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .eq('uploaded_by', user.id)
        .single();

      if (error) throw error;

      setProject(project);
      setEditedName(project.name);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    }
  };

  const loadDocuments = async () => {
    if (!user) {
      toast.error('Please sign in to view documents');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('document_projects')
        .select(`
          document_id,
          vault:vault (
            id,
            name,
            url,
            storage_path,
            uploaded_by,
            uploaded_at,
            type,
            size,
            mime_type,
            document_type,
            kind,
            industry,
            metadata,
            projects:document_projects(project:projects(id, name))
          )
        `)
        .eq('project_id', params.id)
        .eq('created_by', user.id);

      if (error) throw error;

      // Extract and flatten documents
      const docs = ((data || []) as unknown as SupabaseVaultResponse[])
        .map(item => {
          const doc = item.vault;
          if (!doc) return null;
          
          // Transform the nested projects data into the expected format
          const transformedDoc: Document = {
            id: doc.id,
            name: doc.name,
            url: doc.url,
            storage_path: doc.storage_path,
            uploaded_by: doc.uploaded_by,
            uploaded_at: doc.uploaded_at,
            type: doc.type,
            size: doc.size,
            mime_type: doc.mime_type,
            document_type: doc.document_type,
            kind: doc.kind,
            industry: doc.industry,
            metadata: doc.metadata,
            projects: doc.projects.map(p => ({
              id: p.project.id,
              name: p.project.name
            }))
          };
          
          return transformedDoc;
        })
        .filter((doc): doc is Document => doc !== null);

      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const loadAvailableDocuments = async () => {
    if (!user) {
      toast.error('Please sign in to view available documents');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vault')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setAvailableDocuments(data || []);
    } catch (error) {
      console.error('Error loading available documents:', error);
      toast.error('Failed to load available documents');
    }
  };

  const handleSort = (field: 'name' | 'document_type' | 'kind' | 'industry' | 'uploaded_at') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDocuments(
      selectedDocuments.length === documents.length
        ? []
        : documents.map(doc => doc.id)
    );
  };

  const handleDelete = async (documentIds: string[]) => {
    if (!documentIds.length || !user) return;

    try {
      const { error } = await supabase
        .from('document_projects')
        .delete()
        .eq('project_id', params.id)
        .in('document_id', documentIds);

      if (error) throw error;

      toast.success(`${documentIds.length} document${documentIds.length === 1 ? '' : 's'} removed from project`);
      setSelectedDocuments([]);
      await loadDocuments();
    } catch (error) {
      console.error('Error removing documents:', error);
      toast.error('Failed to remove documents');
    }
  };

  // Filter documents based on search query and filters
  const filteredDocuments = documents.filter(doc => {
    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const searchableFields = [
        doc.name,
        doc.document_type,
        doc.kind,
        doc.industry
      ].filter(Boolean);
      
      if (!searchableFields.some(field => field?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Document type filter
    if (selectedDocTypes.length > 0) {
      if (!doc.document_type || !selectedDocTypes.includes(doc.document_type)) {
        return false;
      }
    }

    // Kind filter
    if (selectedKinds.length > 0) {
      if (!doc.kind || !selectedKinds.includes(doc.kind)) {
        return false;
      }
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      const docIndustry = doc.industry || '-';
      if (!selectedIndustries.includes(docIndustry)) {
        return false;
      }
    }

    return true;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortField === 'uploaded_at') {
      return sortDirection === 'asc'
        ? new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
        : new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    }

    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Add handleFileUpload function
  const handleFileUpload = async (fileOrFiles: FileList) => {
    if (!user || !params.id) return;

    const fileArray = Array.from(fileOrFiles);
    const loadingToast = toast.loading(`Uploading ${fileArray.length} document${fileArray.length === 1 ? '' : 's'}...`);

    try {
      for (const file of fileArray) {
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
            industry: null,
            metadata: {}
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        // 4. Associate document with the project
        const { error: linkError } = await supabase
          .from('document_projects')
          .insert({
            document_id: doc.id,
            project_id: params.id,
            created_by: user.id
          });

        if (linkError) throw linkError;
      }

      toast.success(`${fileArray.length} document${fileArray.length === 1 ? '' : 's'} uploaded successfully`, {
        id: loadingToast
      });
      
      loadDocuments(); // Refresh the documents list
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(`Upload failed: ${error.message}`, {
        id: loadingToast
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

  const handleImport = async (documentIds: string[]) => {
    if (!user || !params.id) return;

    try {
      // Create document_projects entries for each selected document
      const { error } = await supabase
        .from('document_projects')
        .insert(
          documentIds.map(docId => ({
            project_id: params.id,
            document_id: docId,
            created_by: user.id,
            created_at: new Date().toISOString()
          }))
        );

      if (error) throw error;

      toast.success(`${documentIds.length} document${documentIds.length === 1 ? '' : 's'} added to project`);
      await loadDocuments();
      await loadAvailableDocuments(); // Reload available documents after import
    } catch (error) {
      console.error('Error importing documents:', error);
      toast.error('Failed to import documents');
    }
  };

  const handleUpdateName = async () => {
    if (!user || !project || editedName.trim() === '') {
      setIsEditingName(false);
      setEditedName(project?.name || '');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          name: editedName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('uploaded_by', user.id);

      if (error) throw error;

      setProject({ ...project, name: editedName.trim() });
      setIsEditingName(false);
      toast.success('Project name updated');
    } catch (error) {
      console.error('Error updating project name:', error);
      toast.error('Failed to update project name');
      setEditedName(project?.name || '');
    }
  };

  const handleDownload = async (fileIds: string[]) => {
    try {
      // Get the selected files with their storage paths
      const selectedFilesToDownload = documents.filter(doc => fileIds.includes(doc.id));
      
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

  const handleRemoveFromProject = async (documentIds: string[]) => {
    try {
      const { error } = await supabase
        .from('document_projects')
        .delete()
        .eq('project_id', params.id)
        .in('document_id', documentIds);

      if (error) throw error;

      // Refresh documents list
      loadDocuments();
      
      // Clear selection
      setSelectedDocuments([]);
      
      toast.success(`${documentIds.length} ${documentIds.length === 1 ? 'document' : 'documents'} removed from project`);
    } catch (error) {
      console.error('Error removing documents from project:', error);
      toast.error('Failed to remove documents from project');
    }
  };

  const handleFileClick = (file: Document) => {
    setPreviewFile(file);
  };

  return (
    <>
      <div className="flex h-screen">
        <CopilotNavigation selectedTab="library" />
        <div className="flex-1 p-4 pl-0 bg-gray-100">
          <main className="h-full rounded-xl bg-white overflow-hidden">
            <div className="px-[48px] py-4 mt-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[15px]">
                  <span 
                    onClick={() => router.push('/documents/projects')}
                    className="text-gray-900 font-medium hover:text-gray-600 cursor-pointer"
                  >
                    Projects
                  </span>
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <div className="relative">
                        <span className="invisible whitespace-pre absolute" style={{ fontSize: '15px' }}>{editedName}</span>
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-[15px] text-gray-600 bg-transparent focus:outline-none"
                          style={{ width: `${editedName.length}ch` }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateName();
                            } else if (e.key === 'Escape') {
                              setIsEditingName(false);
                              setEditedName(project?.name || '');
                            }
                          }}
                          onBlur={handleUpdateName}
                        />
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-600">{project?.name || 'Loading...'}</span>
                        <button 
                          onClick={() => {
                            setEditedName(project?.name || '');
                            setIsEditingName(true);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M 17.585938 2.1074219 A 1.250125 1.250125 0 0 0 16.664062 2.4726562 L 3.2597656 15.875 A 1.250125 1.250125 0 0 0 2.9238281 16.484375 L 2.0253906 20.480469 A 1.250125 1.250125 0 0 0 3.5195312 21.974609 L 7.515625 21.074219 A 1.250125 1.250125 0 0 0 8.125 20.738281 L 21.529297 7.3378906 A 1.250125 1.250125 0 0 0 21.884766 6.2910156 C 21.884766 6.2910156 21.698323 4.7588698 20.470703 3.53125 C 19.242882 2.302081 17.708984 2.1171875 17.708984 2.1171875 A 1.250125 1.250125 0 0 0 17.585938 2.1074219 z M 17.835938 4.8359375 C 18.095181 4.9136695 18.310044 4.9072715 18.701172 5.2988281 C 19.092106 5.6897627 19.087893 5.9043049 19.166016 6.1640625 L 18.078125 7.25 L 16.75 5.921875 L 17.835938 4.8359375 z M 14.982422 7.6894531 L 16.310547 9.0175781 L 6.6132812 18.714844 L 4.8964844 19.101562 L 5.2832031 17.386719 L 14.982422 7.6894531 z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[300px] h-[30px] px-2 py-1 pl-8 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder:font-medium"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
                        <path d="M7.5 12.5C10.2614 12.5 12.5 10.2614 12.5 7.5C12.5 4.73858 10.2614 2.5 7.5 2.5C4.73858 2.5 2.5 4.73858 2.5 7.5C2.5 10.2614 4.73858 12.5 7.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M11.5 11.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="h-[30px] px-3 text-[13px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Add document
                  </button>
                </div>
              </div>
            </div>

            <div className="px-[48px] pb-8">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="max-h-[600px] overflow-y-auto">
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
                          <th className="sticky top-0 bg-white pl-[26px] pr-4 py-1.5 border-r border-gray-200 z-10 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200 rounded-tl-xl">
                            <div className="flex items-center justify-center h-full cursor-pointer">
                              <div
                                className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                                  selectedDocuments.length === documents.length && documents.length > 0
                                    ? 'bg-blue-600 text-white border-transparent'
                                    : 'bg-white border border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={handleSelectAll}
                              >
                                {selectedDocuments.length === documents.length && documents.length > 0 && (
                                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
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
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
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
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
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
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200 rounded-tr-xl">
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
                            <tr key={index} className="animate-pulse">
                              <td className="pl-[26px] pr-4 py-1.5 w-[40px] border-r border-gray-200">
                                <div className="flex items-center justify-center">
                                  <div className="w-4 h-4 bg-gray-200 rounded" />
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 w-[280px] border-r border-gray-200">
                                <div className="w-[200px] h-[26px] bg-gray-200 rounded" />
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="w-[120px] h-[26px] bg-gray-200 rounded" />
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="w-[100px] h-[26px] bg-gray-200 rounded" />
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5">
                                <div className="w-[100px] h-[26px] bg-gray-200 rounded" />
                              </td>
                            </tr>
                          ))
                        ) : filteredDocuments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="pl-[26px] pr-6 py-1.5 h-[400px] border-r border-gray-200">
                              <div className="flex flex-col items-center justify-center h-full">
                                <svg className="w-6 h-6 text-gray-400 mb-3" viewBox="0 0 24 24" fill="none">
                                  <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p className="text-sm text-gray-500">No files found</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          sortedDocuments.map((doc) => (
                            <tr 
                              key={doc.id}
                              className="hover:bg-gray-50 cursor-pointer last:hover:rounded-b-xl [&:last-child>td:first-child]:rounded-bl-xl [&:last-child>td:last-child]:rounded-br-xl"
                              onClick={() => handleFileClick(doc)}
                            >
                              <td className="pl-[26px] pr-4 py-1.5 border-r border-gray-200 relative z-0" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                                      selectedDocuments.includes(doc.id)
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white border border-gray-300 hover:border-gray-400'
                                    }`}
                                    onClick={() => handleSelectDocument(doc.id)}
                                  >
                                    {selectedDocuments.includes(doc.id) && (
                                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="w-full">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[13px] font-medium text-gray-900 bg-gray-100 rounded">
                                    <DocumentIcon className="flex-shrink-0" />
                                    <span className="truncate max-w-[240px]">{doc.name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <span className="inline-flex px-2 py-0.5 text-[13px] font-medium text-gray-900 bg-gray-100 rounded max-w-full">
                                  <span className="truncate">{doc.document_type || '-'}</span>
                                </span>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5 border-r border-gray-200">
                                <div className="flex items-center gap-1.5">
                                  {doc.kind === 'PDF' && (
                                    <img src="/pdflogo.svg" alt="PDF file" className="w-3.5 h-3.5" />
                                  )}
                                  {(doc.kind === 'Word' || doc.kind === 'DOC') && (
                                    <img src="/doc.svg" alt="Word file" className="w-3.5 h-3.5" />
                                  )}
                                  {(doc.kind === 'Excel' || doc.kind === 'CSV' || doc.kind === 'Spreadsheet') && (
                                    <img src="/excel.svg" alt="Excel file" className="w-3.5 h-3.5" />
                                  )}
                                  <span className="text-[13px] font-medium text-gray-900">
                                    {doc.kind ? (doc.kind === 'CSV' ? 'Spreadsheet' : doc.kind) : '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-1.5">
                                <div className="flex items-center h-[26px] max-w-full">
                                  <span className="text-[13px] font-medium text-gray-900 truncate">
                                    {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
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
        </div>
      </div>

      {/* Selection Island */}
      {selectedDocuments.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black/5 pointer-events-none z-20" />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
            <span className="text-sm font-medium text-gray-900">
              {selectedDocuments.length} file{selectedDocuments.length === 1 ? '' : 's'} selected
            </span>
            <div className="w-px h-4 bg-gray-200 mx-2" />
            <button
              onClick={() => handleDownload(selectedDocuments)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M8 2.5V11M8 11L4.5 7.5M8 11L11.5 7.5M3 13.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download
            </button>
            <button
              onClick={() => handleRemoveFromProject(selectedDocuments)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M 12 2 C 6.486 2 2 6.486 2 12 C 2 17.514 6.486 22 12 22 C 17.514 22 22 17.514 22 12 C 22 6.486 17.514 2 12 2 z M 12 4 C 16.411 4 20 7.589 20 12 C 20 16.411 16.411 20 12 20 C 7.589 20 4 16.411 4 12 C 4 7.589 7.589 4 12 4 z M 8 11 L 8 13 L 16 13 L 16 11 L 8 11 z"/>
              </svg>
              Remove from project
            </button>
          </div>
        </>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        onImport={handleImport}
        availableDocuments={availableDocuments}
      />

      <FilePreviewModal
        isOpen={previewFile !== null}
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
  );
} 
