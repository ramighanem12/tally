'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import DocumentRowMenu from '@/app/components/DocumentRowMenu'
import EditNoteModal from '@/app/components/EditNoteModal'
import UploadDocumentModal from '@/app/components/UploadDocumentModal'
import { downloadSingleFile, downloadMultipleFiles } from '@/app/utils/fileDownload'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import EditProjectModal from '@/app/components/EditProjectModal'
import ImportProjectDocumentsModal from '@/app/components/ImportProjectDocumentsModal'
import { DragEvent } from 'react'
import { uploadDocuments } from '@/app/utils/uploadDocuments'

interface DatabaseDocument {
  id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  date?: string;
  type?: string;
  project?: string;
  project_ids?: string[];
}

interface SupabaseProjectDocument {
  documents: {
    id: string;
    name: string;
    url: string;
    file_type: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    type?: string;
    project_documents: Array<{
      project_id: string;
    }>;
  }
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
}

// Add type guards
function hasUrl(doc: DatabaseDocument) {
  return 'url' in doc;
}

function hasDate(doc: DatabaseDocument) {
  return 'date' in doc;
}

function hasType(doc: DatabaseDocument) {
  return 'type' in doc;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const [projectDocuments, setProjectDocuments] = useState<DatabaseDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DatabaseDocument | null>(null);
  const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);
  const [searchDocuments, setSearchDocuments] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [isImportFromVaultModalOpen, setIsImportFromVaultModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch project documents
  const fetchProjectDocuments = async () => {
    setIsLoading(true); // Set loading to true before fetching
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select(`
          documents!inner (
            id,
            name,
            url,
            file_type,
            file_size,
            created_at,
            updated_at,
            type,
            project_documents (
              project_id
            )
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      // Transform the data to include all project IDs for each document
      const formattedDocs = ((data as unknown) as SupabaseProjectDocument[]).map(pd => ({
        ...pd.documents,
        project_ids: pd.documents.project_documents?.map(p => p.project_id) || [],
        date: new Date(pd.documents.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      })) as DatabaseDocument[];

      setProjectDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching project documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false); // Set loading to false when done
    }
  };

  // Add fetchProject function
  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    }
  };

  useEffect(() => {
    fetchProjectDocuments();
    fetchProject();
  }, [projectId]);

  // Filter documents based on search
  const filteredDocuments = projectDocuments.filter(doc => {
    const search = searchDocuments.toLowerCase();
    return doc.name.toLowerCase().includes(search) || 
      (doc.type?.toLowerCase().includes(search));
  });

  // Add these handlers first
  const handleCompletedDocClick = (url: string) => {
    window.open(url, '_blank');
  };

  const archiveDocuments = async (documentIds: string[]) => {
    try {
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('project_id', projectId)
        .in('document_id', documentIds);

      if (error) throw error;
      
      toast.success('Documents removed from project');
      fetchProjectDocuments();
    } catch (error) {
      console.error('Error removing documents from project:', error);
      toast.error('Failed to remove documents from project');
    }
  };

  const handleDeleteProject = async () => {
    setIsMenuOpen(false);
    
    if (!confirm('Are you sure you want to delete this project? All documents will be unassigned.')) {
      return;
    }

    try {
      // First, update all documents to remove project reference
      const { error: updateError } = await supabase
        .from('documents')
        .update({ project: null })
        .eq('project', projectId);

      if (updateError) throw updateError;

      // Then delete the project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) throw deleteError;
      
      toast.success('Project deleted successfully');
      // Redirect to vault page
      window.location.href = '/vault';
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Add this handler near the other handlers
  const handleEditProject = () => {
    setIsMenuOpen(false);
    setIsEditProjectModalOpen(true);
  };

  // Add this handler near the other handlers
  const handleDownloadProject = async () => {
    setIsMenuOpen(false);
    try {
      if (!project?.name) {
        throw new Error('Project name not found');
      }
      // Sanitize project name for filename
      const safeFileName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await downloadMultipleFiles(projectDocuments, `${safeFileName}.zip`);
      toast.success('Project downloaded successfully');
    } catch (error) {
      console.error('Error downloading project:', error);
      toast.error('Failed to download project');
    }
  };

  // Add handler for importing documents
  const handleImportDocuments = async (selectedDocs: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const projectAssignments = selectedDocs.map(docId => ({
        project_id: projectId,
        document_id: docId,
        created_by: user?.id
      }));

      const { error } = await supabase
        .from('project_documents')
        .insert(projectAssignments);

      if (error) throw error;

      toast.success('Documents imported successfully');
      fetchProjectDocuments();
    } catch (error) {
      console.error('Error importing documents:', error);
      toast.error('Failed to import documents');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssignDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add this LoadingTable component near the other components
  const LoadingTable = () => (
    <div className="divide-y divide-[#E4E5E1]">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          className="grid grid-cols-[24px_2fr_1fr_1fr_32px] gap-4 h-[42px] items-center px-4 -mx-4"
        >
          <div className="w-4 h-4 bg-[#F7F7F6] rounded animate-pulse" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-48" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-24" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-36" />
          <div></div>
        </div>
      ))}
    </div>
  );

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
    if (files.length > 0 && projectId) {
      const success = await uploadDocuments(files, projectId);
      if (success) {
        fetchProjectDocuments(); // Refresh the documents list
      }
    }
  }, [projectId, fetchProjectDocuments]);

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="documents" />
      <div className="flex-1 overflow-hidden bg-[#F6F5F3]">
        <main 
          className="h-full w-full bg-white overflow-hidden flex flex-col relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-[#1A1A1A]/10 backdrop-blur-[2px] z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center max-w-[320px] text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  className="mx-auto mb-4 text-[#646462]"
                >
                  <path 
                    fill="currentColor"
                    d="M 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 11 22 A 1.0001 1.0001 0 1 0 11 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 11 A 1.0001 1.0001 0 1 0 20 11 L 20 8 A 1.0001 1.0001 0 0 0 19.707031 7.2929688 L 14.707031 2.2929688 A 1.0001 1.0001 0 0 0 14 2 L 6.5 2 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z M 19 14 C 16.239 14 14 16.239 14 19 C 14 21.761 16.239 24 19 24 C 21.761 24 24 21.761 24 19 C 24 16.239 21.761 14 19 14 z M 19 16 C 19.414 16 19.75 16.336 19.75 16.75 L 19.75 18.25 L 21.25 18.25 C 21.664 18.25 22 18.586 22 19 C 22 19.414 21.664 19.75 21.25 19.75 L 19.75 19.75 L 19.75 21.25 C 19.75 21.664 19.414 22 19 22 C 18.586 22 18.25 21.664 18.25 21.25 L 18.25 19.75 L 16.75 19.75 C 16.336 19.75 16 19.414 16 19 C 16 18.586 16.336 18.25 16.75 18.25 L 18.25 18.25 L 18.25 16.75 C 18.25 16.336 18.586 16 19 16 z"
                  />
                </svg>
                <h3 className="text-[16px] leading-[24px] font-medium text-[#1A1A1A] mb-1">
                  Drop your files here
                </h3>
                <p className="text-[14px] leading-[20px] text-[#646462]">
                  Your files will be uploaded to this project
                </p>
              </div>
            </div>
          )}

          {/* Fixed Header with Breadcrumbs */}
          <div className="pl-4 pr-6 py-5 border-b border-[#E4E5E1]">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                <div className="flex items-center">
                  <Link href="/vault" className="text-[#646462] hover:text-[#1A1A1A]">
                    Vault
                  </Link>
                  <span className="mx-2 text-[#646462]">/</span>
                  {project ? (
                    <span className="truncate max-w-[400px]">{project.name}</span>
                  ) : (
                    <div className="h-6 w-24 bg-[#F7F7F6] rounded animate-pulse" />
                  )}
                </div>
              </h1>

              {/* Add the menu button and dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#646462]"
                  >
                    <path
                      d="M4 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM13.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                      fill="currentColor"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                    <div className="space-y-[2px]">
                      <button
                        onClick={handleEditProject}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                      >
                        Edit project
                      </button>
                      <button
                        onClick={handleDownloadProject}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                      >
                        Download project
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                      >
                        Delete project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3">
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
                                const selectedDoc = projectDocuments.find(doc => 
                                  selectedDocuments.has(doc.id)
                                )!;
                                await downloadSingleFile(selectedDoc.url, selectedDoc.name);
                              } else {
                                const selectedDocs = projectDocuments.filter(doc => 
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
                      </>
                    )}

                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                        className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 h-[28px] rounded-full font-oracle font-medium text-[14px] leading-[20px] transition-colors flex items-center gap-1"
                      >
                        <span>Add document</span>
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
                      </button>

                      {isAssignDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                          <div className="space-y-[2px]">
                            <button
                              onClick={() => {
                                setIsAssignDropdownOpen(false);
                                setIsUploadDocumentModalOpen(true);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                            >
                              Upload documents
                            </button>
                            <button
                              onClick={() => {
                                setIsAssignDropdownOpen(false);
                                setIsImportFromVaultModalOpen(true);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                            >
                              Assign documents
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents Table */}
                <div className="w-full">
                  <div className="grid grid-cols-[24px_2fr_1fr_1fr_32px] gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80">
                    <div className="w-4 flex items-center">
                      <div className="relative w-4 h-4">
                        <input
                          type="checkbox"
                          className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                          checked={projectDocuments.length > 0 && selectedDocuments.size === projectDocuments.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments(new Set(projectDocuments.map(doc => doc.id)));
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
                    <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Type</div>
                    <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Date Uploaded</div>
                    <div></div>
                  </div>

                  <div className="divide-y divide-[#E4E5E1]">
                    {isLoading ? (
                      <LoadingTable />
                    ) : filteredDocuments.length > 0 ? (
                      filteredDocuments.map((document) => (
                        <div 
                          key={document.id}
                          className="grid grid-cols-[24px_2fr_1fr_1fr_32px] gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4"
                          onClick={() => hasUrl(document) && handleCompletedDocClick(document.url)}
                          onMouseEnter={() => setHoveredRowId(document.id)}
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
                              isProjectView={true}
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
            </div>
          </div>
        </main>
      </div>

      {/* Add the modals at the bottom of the main JSX, before the closing div */}
      {isEditNoteModalOpen && selectedDocument && (
        <EditNoteModal
          isOpen={isEditNoteModalOpen}
          onClose={() => {
            setIsEditNoteModalOpen(false);
            setSelectedDocument(null);
          }}
          documentId={selectedDocument.id}
          initialType={selectedDocument.type || null}
          initialProjectIds={selectedDocument.project_ids || []}
          onUpdateComplete={() => {
            fetchProjectDocuments();
          }}
        />
      )}

      <UploadDocumentModal
        isOpen={isUploadDocumentModalOpen}
        onClose={() => {
          setIsUploadDocumentModalOpen(false);
        }}
        onUploadComplete={fetchProjectDocuments}
        projectId={projectId}
      />

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        onUpdateProject={() => {
          fetchProject();
        }}
        projectId={projectId || ''}
        initialName={project?.name || ''}
        initialDescription={project?.description}
      />

      <ImportProjectDocumentsModal
        isOpen={isImportFromVaultModalOpen}
        onClose={() => setIsImportFromVaultModalOpen(false)}
        projectId={projectId || ''}
        onImport={handleImportDocuments}
      />
    </div>
  );
} 