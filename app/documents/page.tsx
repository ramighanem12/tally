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
import NoteIcon from '../components/NoteIcon'
import DocumentRowMenu from '../components/DocumentRowMenu'
import EditNoteModal from '../components/EditNoteModal'
import RequestRowMenu from '../components/RequestRowMenu'
import RequestIcon from '../components/RequestIcon'
import DocumentRequestsBanner from '../components/DocumentRequestsBanner'
import DocumentDropZone from '../components/DocumentDropZone'
import { downloadSingleFile, downloadMultipleFiles } from '../utils/fileDownload'
import DateFilter from '../components/DateFilter'

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

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Add some dummy document data
  const [requestedDocuments, setRequestedDocuments] = useState<DocumentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Update the completed documents data to use document type tags
  const [completedDocuments, setCompletedDocuments] = useState<DatabaseDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  // Add new state for document modal
  const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);

  // Add new state for requested document modal
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [isUploadRequestedDocumentModalOpen, setIsUploadRequestedDocumentModalOpen] = useState(false);

  // Update state for active tab to default to 'requests'
  const [activeTab, setActiveTab] = useState('requests'); // Changed from 'documents' to 'requests'

  // Define tabs - remove Notices tab
  const tabs = [
    { id: 'requests', label: 'Requests' },
    { id: 'documents', label: 'Documents' }
  ];

  // Update the requestsCount to only count pending/overdue requests
  const requestsCount = requestedDocuments.filter(doc => 
    doc.status === 'pending' || doc.status === 'overdue'
  ).length;

  // Add counters for the tabs - remove notices counter
  const documentsCount = completedDocuments.length;

  // Add near the top of the component where other state/variables are defined
  const outstandingCount = requestedDocuments.filter(doc => 
    doc.status === 'pending' || doc.status === 'overdue'
  ).length;

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
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Add these tooltip handlers
    const handleTooltipEnter = (event: React.MouseEvent<HTMLSpanElement>, documentId: string) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top
      });
      setActiveTooltip(documentId);
    };

    const handleTooltipLeave = () => {
      setActiveTooltip(null);
    };

    return (
      <div className="w-full">
        <div 
          className={`grid ${isRequests ? 
            'grid-cols-[24px_1.5fr_2.5fr_1fr_1fr_32px]' : 
            'grid-cols-[24px_2fr_1fr_32px]'} gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-6 -mx-6 bg-white/80`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Checkbox header cell */}
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
          <div className={`${isRequests ? 'col-span-1' : ''} text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462]`}>
            Document Name
          </div>
          {isRequests && (
            <div className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462]">
              Description
            </div>
          )}
          {isRequests ? (
            <>
              <div 
                className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] relative"
                onClick={(e) => e.stopPropagation()}
              >
                <DateFilter
                  dateRangeFilter={dateRequestedFilter}
                  setDateRangeFilter={setDateRequestedFilter}
                  label="Date Requested"
                />
              </div>
              <div 
                className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] relative"
                onClick={(e) => e.stopPropagation()}
              >
                <DateFilter
                  dateRangeFilter={dueDateFilter}
                  setDateRangeFilter={setDueDateFilter}
                  label="Due Date"
                />
              </div>
            </>
          ) : (
            <div 
              className="text-[13px] leading-[18px] font-semibold font-['Inter'] text-[#646462] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <DateFilter
                dateRangeFilter={dateUploadedFilter}
                setDateRangeFilter={setDateUploadedFilter}
                label="Date Uploaded"
              />
            </div>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="py-4 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
            {isRequests ? (
              searchRequests ? 
                'No document requests match your search' : 
                'No document requests'
            ) : (
              searchDocuments ? 
                'No documents match your search' : 
                'No documents'
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E4E5E1]">
            {documents.map((document) => (
              <div 
                key={document.id}
                className={`grid ${isRequests ? 
                  'grid-cols-[24px_1.5fr_2.5fr_1fr_1fr_32px]' : 
                  'grid-cols-[24px_2fr_1fr_32px]'} gap-4 h-[42px] items-center relative group cursor-pointer`}
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
                {/* Checkbox cell */}
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

                <div 
                  className="absolute inset-x-[-8px] h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-white/80 transition-colors"
                />
                
                <div className={`${isRequests ? 'col-span-1' : ''} text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative flex items-center gap-2`}>
                  <span className="block">
                    {document.name}
                  </span>
                  {!isRequests && 'description' in document && document.description && (
                    <NoteIcon description={document.description} />
                  )}
                  {!isRequests && 'request' in document && document.request && (
                    <RequestIcon request={requestedDocuments.find(req => req.id === document.request)!} />
                  )}
                  {!isRequests && 'urgent' in document && document.urgent && (
                    <span 
                      className="inline-block px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] bg-[#F2B8B6] text-[#181818]"
                    >
                      Needs review
                    </span>
                  )}
                </div>
                
                {isRequests && (
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                    <span className="block truncate max-w-[400px]" title={document.description || ''}>
                      {document.description}
                    </span>
                  </div>
                )}
                
                {isRequests ? (
                  <>
                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                      {new Date(('date_requested' in document && document.date_requested) || 
                        ('date' in document && document.date) || 
                        new Date()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative flex items-center gap-2">
                      {('due_date' in document && document.due_date) ? (
                        <>
                          {new Date(document.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {new Date(document.due_date) < new Date() && (
                            <span 
                              className="inline-block px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] bg-[#F2B8B6] text-[#181818]"
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
                    {!isRequests && hasDate(document) && (
                      <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                        {document.date}
                      </div>
                    )}
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
                      top: tooltipPosition.y - 8,
                      left: tooltipPosition.x,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] whitespace-normal">
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

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="documents" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header row with Documents title and tabs */}
          <div className="flex items-center justify-between px-2 py-2 mb-[9px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                  Documents
                </h1>
                <div 
                  ref={menuRef}
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F7F7F6] transition-colors"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16"
                      className="text-[#646462]"
                    >
                      <path 
                        fill="currentColor"
                        d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM3 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                      />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute left-full top-0 ml-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                      <div className="space-y-[2px]">
                        <button 
                          onClick={() => {
                            // Handle click
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
                        >
                          Download all
                        </button>
                        <button 
                          onClick={() => {
                            // Handle click
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
                        >
                          Archive selected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tab switcher */}
            <div className="flex gap-6 relative border-b border-[#E4E5E1]">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`pb-2 relative ${
                    activeTab === id 
                      ? 'text-[#1A1A1A]' 
                      : 'text-[#646462] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="text-[14px] leading-[20px] font-medium font-['Inter']">
                    {label}
                  </span>
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content card */}
          <main className="flex-1 rounded-[14px] bg-white/60 overflow-hidden flex flex-col">
            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 pr-[24px] py-3">
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
                              className="w-full h-[32px] pl-8 pr-3 rounded-lg border border-[#E4E4E4] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] placeholder-[#9A9A99] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none transition-colors"
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
                  ) : (
                    <div className="space-y-3">
                      {/* Search Row - Search on left, Download and Archive far right */}
                      <div className="flex items-center justify-between">
                        {/* Search Bar - Left aligned */}
                        <div className="w-[320px]">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchDocuments}
                              onChange={(e) => setSearchDocuments(e.target.value)}
                              placeholder="Search..."
                              className="w-full h-[32px] pl-8 pr-3 rounded-lg border border-[#E4E4E4] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] placeholder-[#9A9A99] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none transition-colors"
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

                        {/* Download and Archive Buttons */}
                        {selectedDocuments.size > 0 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={async () => {
                                const selectedIds = Array.from(selectedDocuments);
                                await archiveDocuments(selectedIds);
                                setSelectedDocuments(new Set()); // Clear selection after removing
                              }}
                              className="bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors flex items-center gap-2 border border-[#E4E5E1]"
                            >
                              <span>Remove {selectedDocuments.size > 1 ? 'all' : ''}</span>
                            </button>

                            <button
                              onClick={async () => {
                                setIsDownloading(true);
                                try {
                                  if (selectedDocuments.size === 1) {
                                    // Get the selected document
                                    const selectedDoc = completedDocuments.find(doc => 
                                      selectedDocuments.has(doc.id)
                                    )!;
                                    // Download single file directly
                                    await downloadSingleFile(selectedDoc.url, selectedDoc.name);
                                  } else {
                                    // Multiple files - create zip
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
                              className={`bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors flex items-center gap-2 border border-[#E4E5E1] ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isDownloading ? (
                                <>
                                  <svg 
                                    className="animate-spin h-4 w-4 text-[#1A1A1A]" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24"
                                  >
                                    <circle 
                                      className="opacity-25" 
                                      cx="12" 
                                      cy="12" 
                                      r="10" 
                                      stroke="currentColor" 
                                      strokeWidth="4"
                                    />
                                    <path 
                                      className="opacity-75" 
                                      fill="currentColor" 
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span>Downloading...</span>
                                </>
                              ) : (
                                <span>{selectedDocuments.size > 1 ? 'Download all' : 'Download'}</span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 relative">
                        <DocumentTable 
                          documents={completedDocuments.filter(doc => {
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
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
          initialNote={selectedDocument.description || ''}
          onUpdateComplete={() => {
            // Refresh the documents list
            fetchDocuments();
          }}
        />
      )}
    </div>
  )
} 