'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => void;
  onImport?: (documentIds: string[]) => void;
  availableDocuments?: Array<{
    id: string;
    name: string;
    document_type: string;
    kind: string;
    industry: string;
    uploaded_at: string;
  }>;
  availableProjects?: Array<{
    id: string;
    name: string;
    document_type: string;
    industry: string;
    uploaded_at: string;
    fileCount: number;
  }>;
}

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

export default function UploadModal({ isOpen, onClose, onUpload, onImport, availableDocuments = [], availableProjects = [] }: UploadModalProps) {
  const { user } = useAuth();
  const [isShowing, setIsShowing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'Upload' | 'Import documents' | 'Import projects'>('Upload');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'name'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const mountedRef = useRef(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (isOpen) {
        setIsShowing(true);
        setIsAnimating(true);
      }
      return;
    }

    if (isOpen) {
      setIsShowing(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const files = e.dataTransfer.files;
      onUpload(files);
      toast.success(`${files.length} file${files.length === 1 ? '' : 's'} uploaded successfully`, {
        description: files.length === 1 ? files[0].name : undefined
      });
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = e.target.files;
      onUpload(files);
      toast.success(`${files.length} file${files.length === 1 ? '' : 's'} uploaded successfully`, {
        description: files.length === 1 ? files[0].name : undefined
      });
      onClose();
    }
  };

  const handleImport = () => {
    if (onImport && selectedDocuments.length > 0) {
      onImport(selectedDocuments);
      toast.success(`${selectedDocuments.length} document${selectedDocuments.length === 1 ? '' : 's'} imported successfully`);
      setSelectedDocuments([]);
      onClose();
    }
  };

  const handleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedDocuments = [...availableDocuments].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  if (!isShowing) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`} />
      
      {/* Modal */}
      <div className="relative h-full">
        <div 
          className={`fixed inset-x-[25%] inset-y-[20%] bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ease-out transform overflow-hidden flex flex-col ${
            isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 className="text-[18px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
              Add documents
            </h2>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors"
            >
              <svg 
                className="w-4 h-4 text-[#1A1A1A]" 
                viewBox="0 0 16 16" 
                fill="none"
              >
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="px-6 border-b border-gray-200">
            <nav className="flex space-x-4">
              {([
                'Upload' as const,
                'Import documents' as const,
                'Import projects' as const
              ]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-[500]
                    ${tab === activeTab
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {/*tab === 'Google Drive' && (
                    <img src="/google_drive.svg" alt="Google Drive" className="w-4 h-4" />
                  )*/}
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'Upload' && (
              <div className="p-6 h-full">
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv';
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files) {
                        handleFileSelect({ target } as React.ChangeEvent<HTMLInputElement>);
                      }
                    };
                    input.click();
                  }}
                  className={`h-full bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-12 h-12 mb-4">
                      <svg className="w-12 h-12 text-[#707070] hover:text-gray-900" viewBox="0 0 48 48" fill="currentColor">
                        <path d="M 23.970703 6 A 2.0002 2.0002 0 0 0 22.585938 6.5859375 L 16.585938 12.585938 A 2.0002 2.0002 0 1 0 19.414062 15.414062 L 22 12.828125 L 22 31 A 2.0002 2.0002 0 1 0 26 31 L 26 12.828125 L 28.585938 15.414062 A 2.0002 2.0002 0 1 0 31.414062 12.585938 L 25.414062 6.5859375 A 2.0002 2.0002 0 0 0 23.970703 6 z M 12 17 C 8.7099679 17 6 19.709968 6 23 L 6 36 C 6 39.290032 8.7099679 42 12 42 L 36 42 C 39.290032 42 42 39.290032 42 36 L 42 23 C 42 19.709968 39.290032 17 36 17 L 35 17 A 2.0002 2.0002 0 1 0 35 21 L 36 21 C 37.127968 21 38 21.872032 38 23 L 38 36 C 38 37.127968 37.127968 38 36 38 L 12 38 C 10.872032 38 10 37.127968 10 36 L 10 23 C 10 21.872032 10.872032 21 12 21 L 13 21 A 2.0002 2.0002 0 1 0 13 17 L 12 17 z"/>
                      </svg>
                    </div>
                    <p className="text-base font-medium text-gray-900 mb-1">
                      Drop your files here, or <span className="underline">browse</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, Word, Excel files up to 50MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Import documents' && (
              <div className="h-full flex flex-col">
                {availableDocuments.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No documents available</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <table className="w-full border-collapse">
                        <colgroup>
                          <col style={{ width: '64px' }} />
                          <col />
                        </colgroup>
                        <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                          <tr className="relative">
                            <th className="pl-[26px] pr-4 py-1.5 border-r border-gray-200">
                              <div className="flex items-center justify-center h-full">
                                <div
                                  className={`flex items-center justify-center w-4 h-4 rounded transition-colors cursor-pointer ${
                                    selectedDocuments.length === availableDocuments.length && availableDocuments.length > 0
                                      ? 'bg-blue-600 text-white border-transparent'
                                      : 'bg-white border border-gray-300 hover:border-gray-400'
                                  }`}
                                  onClick={() => {
                                    if (selectedDocuments.length === availableDocuments.length) {
                                      setSelectedDocuments([]);
                                    } else {
                                      setSelectedDocuments(availableDocuments.map(doc => doc.id));
                                    }
                                  }}
                                >
                                  {selectedDocuments.length === availableDocuments.length && availableDocuments.length > 0 && (
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </th>
                            <th className="pl-[18px] pr-6 py-1.5 text-left text-[13px] font-[500] text-gray-500">
                              <button 
                                onClick={handleSort}
                                className="inline-flex items-center gap-2 hover:text-gray-700"
                              >
                                File
                                <SortIcon 
                                  active={true}
                                  direction={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                              <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200"></div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 border-b border-gray-200">
                          {sortedDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="pl-[26px] pr-4 py-2 border-r border-gray-200">
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`flex items-center justify-center w-4 h-4 rounded transition-colors cursor-pointer ${
                                      selectedDocuments.includes(doc.id)
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white border border-gray-300 hover:border-gray-400'
                                    }`}
                                    onClick={() => {
                                      setSelectedDocuments(prev => 
                                        prev.includes(doc.id)
                                          ? prev.filter(id => id !== doc.id)
                                          : [...prev, doc.id]
                                      );
                                    }}
                                  >
                                    {selectedDocuments.includes(doc.id) && (
                                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-2 max-w-0">
                                <div className="flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                                    <path d="M13.5 3.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M5.5 6.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M5.5 9.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                  <span className="text-[14px] font-[500] text-gray-900 truncate">{doc.name}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-4 flex justify-end border-t border-gray-200">
                      <button
                        onClick={handleImport}
                        disabled={selectedDocuments.length === 0}
                        className={`
                          px-4 py-2 text-[13px] font-[500] rounded-[9px]
                          ${selectedDocuments.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                          }
                        `}
                      >
                        {selectedDocuments.length === 0 ? 'Import' : `Import ${selectedDocuments.length} file${selectedDocuments.length === 1 ? '' : 's'}`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'Import projects' && (
              <div className="h-full flex flex-col">
                {availableProjects.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No projects available</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <table className="w-full border-collapse">
                        <colgroup>
                          <col style={{ width: '64px' }} />
                          <col />
                        </colgroup>
                        <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                          <tr className="relative">
                            <th className="pl-[26px] pr-4 py-1.5 border-r border-gray-200">
                              <div className="flex items-center justify-center h-full">
                                <div
                                  className={`flex items-center justify-center w-4 h-4 rounded transition-colors cursor-pointer ${
                                    selectedProjects.length === availableProjects.length && availableProjects.length > 0
                                      ? 'bg-blue-600 text-white border-transparent'
                                      : 'bg-white border border-gray-300 hover:border-gray-400'
                                  }`}
                                  onClick={() => {
                                    if (selectedProjects.length === availableProjects.length) {
                                      setSelectedProjects([]);
                                    } else {
                                      setSelectedProjects(availableProjects.map(proj => proj.id));
                                    }
                                  }}
                                >
                                  {selectedProjects.length === availableProjects.length && availableProjects.length > 0 && (
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </th>
                            <th className="pl-[18px] pr-6 py-1.5 text-left text-[13px] font-[500] text-gray-500">
                              <button 
                                onClick={handleSort}
                                className="inline-flex items-center gap-2 hover:text-gray-700"
                              >
                                Project
                                <SortIcon 
                                  active={true}
                                  direction={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                              <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200"></div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 border-b border-gray-200">
                          {[...availableProjects].sort((a, b) => {
                            return sortDirection === 'asc'
                              ? a.name.localeCompare(b.name)
                              : b.name.localeCompare(a.name);
                          }).map((project, index, array) => (
                            <tr key={project.id} className={`hover:bg-gray-50 ${index === array.length - 1 ? 'border-b border-gray-200' : ''}`}>
                              <td className="pl-[26px] pr-4 py-2 border-r border-gray-200">
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`flex items-center justify-center w-4 h-4 rounded transition-colors cursor-pointer ${
                                      selectedProjects.includes(project.id)
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white border border-gray-300 hover:border-gray-400'
                                    }`}
                                    onClick={() => {
                                      setSelectedProjects(prev => 
                                        prev.includes(project.id)
                                          ? prev.filter(id => id !== project.id)
                                          : [...prev, project.id]
                                      );
                                    }}
                                  >
                                    {selectedProjects.includes(project.id) && (
                                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="pl-[18px] pr-6 py-2 max-w-0">
                                <div className="flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                                    <path d="M2.5 13.5V5.5C2.5 4.94772 2.94772 4.5 3.5 4.5H6.5L8 6H12.5C13.0523 6 13.5 6.44772 13.5 7V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H3.5C2.94772 14.5 2.5 14.0523 2.5 13.5Z" stroke="currentColor" strokeWidth="1.5"/>
                                  </svg>
                                  <span className="text-[14px] font-[500] text-gray-900 truncate">
                                    {project.name} ({project.fileCount} file{project.fileCount === 1 ? '' : 's'})
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-4 flex justify-end border-t border-gray-200">
                      <button
                        onClick={() => {
                          if (onImport && selectedProjects.length > 0) {
                            onImport(selectedProjects);
                            setSelectedProjects([]);
                            onClose();
                          }
                        }}
                        disabled={selectedProjects.length === 0}
                        className={`
                          px-4 py-2 text-[13px] font-[500] rounded-[9px]
                          ${selectedProjects.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                          }
                        `}
                      >
                        {selectedProjects.length === 0 ? 'Import' : `Import ${selectedProjects.length} project${selectedProjects.length === 1 ? '' : 's'}`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/*activeTab === 'Google Drive' && (
              <div className="p-6 h-full flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">Google Drive integration coming soon</p>
              </div>
            )*/}

            {/*activeTab === 'OneDrive' && (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">OneDrive integration coming soon</p>
              </div>
            )*/}

            {/*activeTab === 'SharePoint' && (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">SharePoint integration coming soon</p>
              </div>
            )*/}
          </div>
        </div>
      </div>
    </div>
  );
} 
