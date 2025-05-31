'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import UploadDocumentModal from '../components/UploadDocumentModal'
import UploadRequestedDocumentModal from '../components/UploadRequestedDocumentModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { DocumentRequest } from '@/types'
import { useDocumentRequests } from '@/contexts/DocumentRequestsContext'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import DocumentRowMenu from '../components/DocumentRowMenu'
import EditNoteModal from '../components/EditNoteModal'
import RequestRowMenu from '../components/RequestRowMenu'
import DocumentRequestsBanner from '../components/DocumentRequestsBanner'
import { downloadSingleFile, downloadMultipleFiles } from '../utils/fileDownload'

// Update the DocumentTable props type to handle both Document and DocumentRequest
type DocumentTableProps = {
  documents: (DatabaseDocument | DocumentRequest)[];
  isRequests?: boolean;
  selectedItems: Set<string>;
  onSelectAll: (documents: (DatabaseDocument | DocumentRequest)[]) => void;
  onSelectDocument: (documentId: string) => void;
}

// Add this type guard function near the top of the file
function hasCompletedDate(doc: DatabaseDocument | DocumentRequest): doc is DocumentRequest & { completed_date: string } {
  return 'completed_date' in doc && doc.completed_date !== null;
}

// Add this type guard near the top of the file where other type guards are
function isDocumentRequest(doc: DatabaseDocument | DocumentRequest): doc is DocumentRequest {
  return 'status' in doc;
}

// Add this type guard to check for url property
function hasUrl(doc: DatabaseDocument | DocumentRequest): doc is DatabaseDocument {
  return 'url' in doc;
}

// Add this type guard to check for date property
function hasDate(doc: DatabaseDocument | DocumentRequest): doc is DatabaseDocument {
  return 'date' in doc;
}

// First add this type guard near the other type guards at the top
function hasType(doc: DatabaseDocument | DocumentRequest): doc is DatabaseDocument {
  return 'type' in doc;
}

// Rename to avoid conflict with imported type
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
  request?: string;
  date_requested?: string;
  due_date?: string;
  urgent?: boolean;
  type?: string;
  project?: string;
}

// Add this type near other type definitions
type PopoverProps = {
  content: string;
  isVisible: boolean;
  x: number;
  y: number;
}

// Add type guard for due_date
const getDaysLate = (dueDate: string | null | undefined): number => {
  if (!dueDate) return 0;
  return Math.ceil((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
};

// Add these new types/interfaces near the top
type DocumentSection = {
  title: string;
  count: number;
  isExpanded: boolean;
}

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [requestedDocuments, setRequestedDocuments] = useState<DocumentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [completedDocuments, setCompletedDocuments] = useState<DatabaseDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [isUploadRequestedDocumentModalOpen, setIsUploadRequestedDocumentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  // Move this before tabs definition
  const outstandingCount = requestedDocuments.filter(doc => 
    doc.status === 'pending' || doc.status === 'overdue'
  ).length;

  // Now define tabs using outstandingCount
  const tabs = [
    { 
      id: 'requests', 
      label: `Requests${outstandingCount > 0 ? ` (${outstandingCount})` : ''}`
    },
    { 
      id: 'documents', 
      label: 'Documents' 
    },
    {
      id: 'projects',
      label: 'Projects'
    }
  ];

  // Update the requestsCount to only count pending/overdue requests
  const requestsCount = requestedDocuments.filter(doc => 
    doc.status === 'pending' || doc.status === 'overdue'
  ).length;

  // Add counters for the tabs - remove notices counter
  const documentsCount = completedDocuments.length;

  // Add near the top of the component where other state/variables are defined
  const completedCount = requestedDocuments.filter(doc => 
    doc.status === 'completed'
  ).length;

  // Add these state declarations near the top with other states
  const [searchRequests, setSearchRequests] = useState('');
  const [searchDocuments, setSearchDocuments] = useState('');

  // Add this state near other state declarations
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Add this state near other state declarations
  const [isDownloading, setIsDownloading] = useState(false);

  // Add new state near other filter states
  const [dateRequestedFilter, setDateRequestedFilter] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [dueDateFilter, setDueDateFilter] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [dateUploadedFilter, setDateUploadedFilter] = useState<{ from: string; to: string }>({ from: '', to: '' });

  // Add near other state declarations
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Add new state variables in the DocumentsPage component
  const [documentSections, setDocumentSections] = useState<{
    completedSets: DocumentSection;
    otherDocuments: DocumentSection;
  }>({
    completedSets: {
      title: 'Completed document sets',
      count: 0,
      isExpanded: true
    },
    otherDocuments: {
      title: 'Other documents',
      count: 0,
      isExpanded: true
    }
  });

  // Add this useEffect with other useEffects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the filterBySearch helper to include date filtering
  const filterBySearch = (item: DatabaseDocument | DocumentRequest, searchText: string) => {
    const search = searchText.toLowerCase();

    // First check if item matches search text
    const matchesSearch = item.name.toLowerCase().includes(search) || 
      ('description' in item && item.description?.toLowerCase().includes(search));

    // Then check if item matches date filters
    const itemDate = new Date(item.created_at);
    
    // Apply different date filters based on document type
    if (isDocumentRequest(item)) {
      // For requests, check requested date and due date
      const requestedDate = item.date_requested ? new Date(item.date_requested) : null;
      const dueDate = item.due_date ? new Date(item.due_date) : null;

      const matchesRequestedDate = !dateRequestedFilter.from || !requestedDate || requestedDate >= new Date(dateRequestedFilter.from);
      const matchesRequestedEndDate = !dateRequestedFilter.to || !requestedDate || requestedDate <= new Date(dateRequestedFilter.to);
      
      const matchesDueDate = !dueDateFilter.from || !dueDate || dueDate >= new Date(dueDateFilter.from);
      const matchesDueEndDate = !dueDateFilter.to || !dueDate || dueDate <= new Date(dueDateFilter.to);

      return matchesSearch && 
             matchesRequestedDate && matchesRequestedEndDate &&
             matchesDueDate && matchesDueEndDate;
    } else {
      // For documents, check upload date
      const uploadDate = new Date(item.created_at);
      const matchesUploadDate = !dateUploadedFilter.from || uploadDate >= new Date(dateUploadedFilter.from);
      const matchesUploadEndDate = !dateUploadedFilter.to || uploadDate <= new Date(dateUploadedFilter.to);

      return matchesSearch && matchesUploadDate && matchesUploadEndDate;
    }
  };

  // Move fetchDocuments to the top of the component, before it's used in any hooks or callbacks
  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocs = data.map(doc => ({
        ...doc,
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
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Handle completed document click
  const handleCompletedDocClick = (url: string) => {
    window.open(url, '_blank');
  };

  // Add this helper function near the top of the component
  const isDocumentLate = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Replace single selectedDocuments state with two separate states
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  // Add helper for handling select all
  const handleSelectAll = useCallback((documents: (DatabaseDocument | DocumentRequest)[]) => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(doc => doc.id)));
    }
  }, [selectedDocuments]);

  // Update the DocumentTable component
  const DocumentTable = ({ documents, isRequests = false, selectedItems, onSelectAll, onSelectDocument }: DocumentTableProps) => {
    // Change to track which document's popover is visible
    const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    // Add these state declarations near the top of the DocumentTable component
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    // Add these tooltip handlers
    const handleTooltipEnter = (event: React.MouseEvent<HTMLSpanElement>, documentId: string) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left
      });
      setActiveTooltip(documentId);
    };

    const handleTooltipLeave = () => {
      setActiveTooltip(null);
    };

    return (
      <div className="w-full">
        {/* Table header */}
        <div className={`grid ${
          isRequests 
            ? 'grid-cols-[1.5fr_2.5fr_1fr_1fr_32px]'
            : 'grid-cols-[24px_1.5fr_2.5fr_1fr_1fr_32px]'
        } gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80`}>
          {/* Checkbox column */}
          {!isRequests && (
            <div className="w-4 flex items-center">
              <div className="relative w-4 h-4">
                <input
                  type="checkbox"
                  className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                  checked={documents.length > 0 && selectedItems.size === documents.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectAll(documents);
                    } else {
                      onSelectAll(documents.filter(doc => selectedItems.has(doc.id)));
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
          )}

          {/* Column headers */}
          {isRequests ? (
            <>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                Document Name
              </div>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                Description
              </div>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                Date Requested
              </div>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                Due Date
              </div>
            </>
          ) : (
            <>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                Document Name
              </div>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                Notes
              </div>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462] flex items-center gap-1">
                Type
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  className="text-[#646462]"
                >
                  <path 
                    fill="currentColor" 
                    d="M16.89 6.553l1.838 3.718 3.718 1.838c.737.364.737 1.416 0 1.781l-3.718 1.838-1.838 3.718c-.364.737-1.416.737-1.781 0l-1.838-3.718L9.553 13.89c-.737-.364-.737-1.416 0-1.781l3.718-1.838 1.838-3.718C15.474 5.816 16.526 5.816 16.89 6.553zM6.89 2.529l1.184 2.396 2.396 1.184c.737.364.737 1.416 0 1.781L8.075 9.075 6.89 11.471c-.364.737-1.416.737-1.781 0L3.925 9.075 1.529 7.89c-.737-.364-.737-1.416 0-1.781l2.396-1.184L5.11 2.529C5.474 1.792 6.526 1.792 6.89 2.529zM7.89 16.493l.535 1.082 1.082.535c.737.364.737 1.416 0 1.781l-1.082.535L7.89 21.507c-.364.737-1.416.737-1.781 0l-.535-1.082L4.493 19.89c-.737-.364-.737-1.416 0-1.781l1.082-.535.535-1.082C6.474 15.755 7.526 15.755 7.89 16.493z"
                  />
                </svg>
              </div>
              <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">
                Date Uploaded
              </div>
            </>
          )}
        </div>

        {documents.length === 0 ? (
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
              {isRequests ? (
                searchRequests ? 
                  'No document requests match your search' : 
                  'No document requests'
              ) : (
                searchDocuments ? 
                  'No documents match your search' : 
                  'No documents'
              )}
            </h3>
            <p className="text-[14px] leading-[20px] text-[#646462]">
              {isRequests ? (
                searchRequests ? 
                  'Try adjusting your search or filters' : 
                  'You have no pending document requests'
              ) : (
                searchDocuments ? 
                  'Try adjusting your search or filters' : 
                  'Upload a document to get started'
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E5E1]">
            {documents.map((document) => (
              <div 
                key={document.id}
                className={`grid ${
                  isRequests 
                    ? 'grid-cols-[1.5fr_2.5fr_1fr_1fr_32px]'
                    : 'grid-cols-[24px_1.5fr_2.5fr_1fr_1fr_32px]'
                } gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4`}
                onClick={() => {
                  if (isRequests) {
                    setSelectedRequest(document as DocumentRequest);
                    setIsUploadRequestedDocumentModalOpen(true);
                  } else if (hasUrl(document)) {
                    handleCompletedDocClick(document.url);
                  }
                }}
                onMouseEnter={() => setHoveredRowId(document.id)}
                onMouseLeave={() => setHoveredRowId(null)}
              >
                {/* Only show checkbox cell in non-requests rows */}
                {!isRequests && (
                  <div 
                    className="w-4 relative z-10 flex items-center opacity-0 group-hover:opacity-100 [&:has(input:checked)]:opacity-100 transition-opacity" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative w-4 h-4">
                      <input
                        type="checkbox"
                        className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                        checked={selectedItems.has(document.id)}
                        onChange={(e) => {
                          onSelectDocument(document.id);
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
                )}

                <div className={`${isRequests ? 'col-span-1' : ''} text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative flex items-center gap-2`}>
                  <span className="block">
                    {document.name}
                  </span>
                  {!isRequests && 'urgent' in document && document.urgent && (
                    <span 
                      className="inline-block px-2 py-0.5 rounded-[6px] font-oracle font-[450] text-[13px] leading-[18px] bg-[#F2B8B6] text-[#181818]"
                    >
                      Needs review
                    </span>
                  )}
                </div>
                
                {isRequests && (
                  <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                    <span className="block truncate max-w-[400px]" title={document.description || ''}>
                      {document.description}
                    </span>
                  </div>
                )}
                
                {isRequests ? (
                  <>
                    <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                      {new Date(('date_requested' in document && document.date_requested) || 
                        ('date' in document && document.date) || 
                        new Date()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative flex items-center gap-2">
                      {('due_date' in document && document.due_date) ? (
                        <>
                          {new Date(document.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {new Date(document.due_date) < new Date() && (
                            <span 
                              className="inline-block px-2 py-0.5 rounded-[6px] font-oracle font-[450] text-[13px] leading-[18px] bg-[#F2B8B6] text-[#181818]"
                            >
                              Late
                            </span>
                          )}
                        </>
                      ) : '-'}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Notes cell */}
                    <div 
                      className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] truncate pr-[10%] cursor-default relative"
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => {
                        // Check if content is truncated
                        const element = e.currentTarget;
                        const isTruncated = element.scrollWidth > element.clientWidth;
                        
                        if (document.description && isTruncated) {
                          const rect = element.getBoundingClientRect();
                          setActiveTooltip(document.id);
                          setTooltipPosition({
                            top: rect.top - 8,
                            left: rect.left
                          });
                        }
                      }}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      {document.description || '—'}
                      {activeTooltip === document.id && document.description && (
                        <div 
                          className="fixed mb-2 z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-3 w-[346px]"  // Increased from 288px to 346px
                          style={{
                            top: tooltipPosition.top,
                            left: tooltipPosition.left,
                            transform: 'translateY(-100%)'
                          }}
                        >
                          <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                            {document.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Type cell */}
                    <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                      {hasType(document) && document.type ? (
                        <span className="inline-block px-2 py-0.5 rounded-[6px] bg-[#F7F7F6] text-[#1A1A1A] font-oracle font-[450] text-[13px] leading-[18px]">
                          {document.type}
                        </span>
                      ) : '—'}
                    </div>

                    {/* Date Uploaded cell */}
                    <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                      {hasDate(document) ? document.date : '—'}
                    </div>
                  </>
                )}

                {!isRequests && (
                  <div className="relative flex justify-end">
                    <DocumentRowMenu 
                      onEditNote={() => {
                        setSelectedDocument(document as DatabaseDocument);
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
                )}

                {isRequests && (
                  <div className="relative flex justify-end">
                    <RequestRowMenu 
                      onProvideDocument={() => {
                        setSelectedRequest(document as DocumentRequest);
                        setIsUploadRequestedDocumentModalOpen(true);
                      }}
                      isRowHovered={hoveredRowId === document.id}
                    />
                  </div>
                )}

                {/* Add the tooltip */}
                {activeTooltip === document.id && 'due_date' in document && document.due_date && (
                  <div 
                    className="fixed z-[100] bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[180px] transition-all duration-200"
                    style={{
                      top: tooltipPosition.top - 8,
                      left: tooltipPosition.left,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                      Late by {getDaysLate(document.due_date)} days
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Update the getIncompleteRequestsCount function to only count pending/overdue requests
  const getIncompleteRequestsCount = (documents: DocumentRequest[]) => {
    return documents.filter(doc => doc.status === 'pending' || doc.status === 'overdue').length;
  };

  // Add near other hooks
  const { setIncompleteRequestsCount } = useDocumentRequests();

  // Update the fetchDocumentRequests function
  const fetchDocumentRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingRequests(true);
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        // Remove the completed status from the query
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update status for overdue items and sort by due_date
      const updatedData = data
        .map(request => ({
          ...request,
          status: isDocumentLate(request.due_date) ? 'overdue' : request.status
        }))
        .sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });

      setRequestedDocuments(updatedData);
      
      // Update the incomplete requests count
      const incompleteCount = updatedData.filter(
        doc => doc.status === 'pending' || doc.status === 'overdue'
      ).length;
      setIncompleteRequestsCount(incompleteCount);
    } catch (error) {
      console.error('Error fetching document requests:', error);
      toast.error('Failed to load document requests');
    } finally {
      setIsLoadingRequests(false);
    }
  }, [user, setIncompleteRequestsCount]);

  // The useEffect stays the same but now uses the memoized function
  useEffect(() => {
    fetchDocumentRequests();
  }, [user, setIncompleteRequestsCount]);

  // Move archiveDocuments inside component
  const archiveDocuments = async (documentIds: string[]) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .in('id', documentIds);

      if (error) throw error;
      
      toast.success('Documents archived successfully');
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error archiving documents:', error);
      toast.error('Failed to archive documents');
    }
  };

  // Use fetchDocuments in useEffect
  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Update the tab click handler
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Add state for edit note modal
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DatabaseDocument | null>(null);

  // Add helper function to separate documents
  const separateDocuments = (documents: DatabaseDocument[]) => {
    return documents.reduce(
      (acc, doc) => {
        if (doc.request) {
          acc.completedSets.push(doc);
        } else {
          acc.otherDocuments.push(doc);
        }
        return acc;
      },
      { completedSets: [] as DatabaseDocument[], otherDocuments: [] as DatabaseDocument[] }
    );
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="documents" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F6F5F3] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          {/* Fixed Header - updated title */}
          <div className="pl-4 pr-6 py-5 border-b border-[#E4E5E1]">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                Vault
              </h1>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Tab switcher moved here */}
            <div className="px-4 pt-4">
              <div className="flex items-center gap-2">
                {tabs.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handleTabChange(id)}
                    className={`px-2.5 py-1 rounded-md text-[14px] leading-[20px] font-medium font-oracle transition-colors ${
                      activeTab === id 
                        ? 'bg-[#F7F7F6] text-[#1A1A1A]'
                        : 'text-[#646462] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rest of the content */}
            <div className="px-4 py-3">
              {/* Banner */}
              {activeTab === 'requests' && !isLoadingRequests && (
                <DocumentRequestsBanner 
                  requestCount={getIncompleteRequestsCount(requestedDocuments)} 
                />
              )}

              {/* Update the content section with animations */}
              <div>
                {activeTab === 'requests' ? (
                  <div className="space-y-3">
                    {/* Search Row - Search on left */}
                    <div className="flex items-center gap-2">
                      {/* Search Bar */}
                      <div className="w-[320px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchRequests}
                            onChange={(e) => setSearchRequests(e.target.value)}
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

                    <DocumentTable 
                      documents={requestedDocuments
                        .filter(doc => {
                          // Keep only the search filter
                          return filterBySearch(doc, searchRequests);
                        })
                        .filter(doc => doc.status === 'pending' || doc.status === 'overdue')}
                      isRequests={true}
                      selectedItems={selectedRequests}
                      onSelectAll={(documents) => {
                        setSelectedRequests(prev => {
                          const next = new Set(prev);
                          if (next.size === documents.length) {
                            next.clear();
                          } else {
                            documents.forEach(doc => next.add(doc.id));
                          }
                          return next;
                        });
                      }}
                      onSelectDocument={(documentId) => {
                        setSelectedRequests(prev => {
                          const next = new Set(prev);
                          if (next.has(documentId)) {
                            next.delete(documentId);
                          } else {
                            next.add(documentId);
                          }
                          return next;
                        });
                      }}
                    />
                  </div>
                ) : activeTab === 'documents' ? (
                  <div className="space-y-3">
                    {/* Search Row - Search and buttons on same line */}
                    <div className="flex items-center justify-between">
                      {/* Search Bar */}
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
                        {/* Selection action buttons */}
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
                              {isDownloading ? (
                                <div className="flex items-center gap-2">
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
                                  <span>Downloading...</span>
                                </div>
                              ) : (
                                <span>Download {selectedDocuments.size > 1 ? 'all' : ''}</span>
                              )}
                            </button>
                          </>
                        )}

                        {/* Add Document Button */}
                        <button
                          onClick={() => setIsUploadDocumentModalOpen(true)}
                          className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 h-[28px] rounded-full font-oracle font-medium text-[13px] leading-[18px] transition-colors"
                        >
                          Add document
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 relative -mx-4">
                      {/* Unified Document Table with Section Headers */}
                      <div>
                        {/* Completed Sets Section */}
                        <div className="border-t border-[#E4E5E1]">
                          <button
                            onClick={() => setDocumentSections(prev => ({
                              ...prev,
                              completedSets: {
                                ...prev.completedSets,
                                isExpanded: !prev.completedSets.isExpanded
                              }
                            }))}
                            className="w-full px-4 py-2 flex items-center justify-between bg-[#F7F7F6]/50 hover:bg-[#F0F0F0] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                className={`transition-transform ${documentSections.completedSets.isExpanded ? 'text-[#1A1A1A]' : 'text-[#A3A3A3]'} ${
                                  documentSections.completedSets.isExpanded ? 'rotate-90' : ''
                                }`}
                              >
                                <path 
                                  fill="currentColor" 
                                  d="M6.5 12L10.5 8L6.5 4V12Z"
                                />
                              </svg>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24"
                                className="text-[#66B937]"
                              >
                                <path 
                                  fill="currentColor"
                                  d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 16 9 C 16.25575 9 16.511531 9.0974687 16.707031 9.2929688 C 17.098031 9.6839688 17.098031 10.316031 16.707031 10.707031 L 11.707031 15.707031 C 11.512031 15.902031 11.256 16 11 16 C 10.744 16 10.487969 15.902031 10.292969 15.707031 L 7.2929688 12.707031 C 6.9019687 12.316031 6.9019688 11.683969 7.2929688 11.292969 C 7.6839688 10.901969 8.3160313 10.901969 8.7070312 11.292969 L 11 13.585938 L 15.292969 9.2929688 C 15.488469 9.0974688 15.74425 9 16 9 z"
                                />
                              </svg>
                              <span className="font-oracle font-medium text-[14px] leading-[20px] text-[#1A1A1A]">
                                {documentSections.completedSets.title} ({
                                  separateDocuments(completedDocuments).completedSets.filter(doc => 
                                    filterBySearch(doc, searchDocuments)
                                  ).length
                                })
                              </span>
                            </div>
                          </button>
                          
                          <div className="px-4">
                            {documentSections.completedSets.isExpanded && (
                              <DocumentTable
                                documents={separateDocuments(completedDocuments).completedSets.filter(doc => {
                                  return filterBySearch(doc, searchDocuments);
                                })}
                                isRequests={false}
                                selectedItems={selectedDocuments}
                                onSelectAll={handleSelectAll}
                                onSelectDocument={(documentId) => {
                                  setSelectedDocuments(prev => {
                                    const next = new Set(prev);
                                    if (next.has(documentId)) {
                                      next.delete(documentId);
                                    } else {
                                      next.add(documentId);
                                    }
                                    return next;
                                  });
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Other Documents Section */}
                        <div className="border-t border-[#E4E5E1]">
                          <button
                            onClick={() => setDocumentSections(prev => ({
                              ...prev,
                              otherDocuments: {
                                ...prev.otherDocuments,
                                isExpanded: !prev.otherDocuments.isExpanded
                              }
                            }))}
                            className="w-full px-4 py-2 flex items-center justify-between bg-[#F7F7F6]/50 hover:bg-[#F0F0F0] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                className={`transition-transform ${documentSections.otherDocuments.isExpanded ? 'text-[#1A1A1A]' : 'text-[#A3A3A3]'} ${
                                  documentSections.otherDocuments.isExpanded ? 'rotate-90' : ''
                                }`}
                              >
                                <path 
                                  fill="currentColor" 
                                  d="M6.5 12L10.5 8L6.5 4V12Z"
                                />
                              </svg>
                              <span className="font-oracle font-medium text-[14px] leading-[20px] text-[#1A1A1A]">
                                {documentSections.otherDocuments.title} ({
                                  separateDocuments(completedDocuments).otherDocuments.filter(doc => 
                                    filterBySearch(doc, searchDocuments)
                                  ).length
                                })
                              </span>
                            </div>
                          </button>
                          
                          <div className="px-4">
                            {documentSections.otherDocuments.isExpanded && (
                              <DocumentTable
                                documents={separateDocuments(completedDocuments).otherDocuments.filter(doc => {
                                  return filterBySearch(doc, searchDocuments);
                                })}
                                isRequests={false}
                                selectedItems={selectedDocuments}
                                onSelectAll={handleSelectAll}
                                onSelectDocument={(documentId) => {
                                  setSelectedDocuments(prev => {
                                    const next = new Set(prev);
                                    if (next.has(documentId)) {
                                      next.delete(documentId);
                                    } else {
                                      next.add(documentId);
                                    }
                                    return next;
                                  });
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Projects tab empty state
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
                      No projects
                    </h3>
                    <p className="text-[14px] leading-[20px] text-[#646462]">
                      Projects feature coming soon
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <UploadDocumentModal
        isOpen={isUploadDocumentModalOpen}
        onClose={() => {
          setIsUploadDocumentModalOpen(false);
        }}
        onUploadComplete={fetchDocuments}
      />
      <UploadRequestedDocumentModal
        isOpen={isUploadRequestedDocumentModalOpen}
        onClose={() => {
          setIsUploadRequestedDocumentModalOpen(false);
          setSelectedRequest(null);
        }}
        document={selectedRequest}
        onUploadComplete={() => {
          // Refresh both documents and requests
          fetchDocuments();
          fetchDocumentRequests();
        }}
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
          initialProjectId={selectedDocument.project || null}
          onUpdateComplete={() => {
            fetchDocuments();
          }}
        />
      )}
    </div>
  )
} 