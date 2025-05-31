'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface ImportProjectDocumentsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onImport?: (selectedDocs: string[]) => void
}

interface ProjectDocument {
  project?: {
    id: string;
    name: string;
  };
}

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
  project_documents?: ProjectDocument[];
  project_names?: string[];
}

interface SupabaseDocument {
  id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  type?: string;
  project_documents: {
    project: {
      id: string;
      name: string;
    };
  }[];
}

export default function ImportProjectDocumentsModal({ 
  isOpen, 
  onClose, 
  projectId, 
  onImport 
}: ImportProjectDocumentsModalProps) {
  const [documents, setDocuments] = useState<DatabaseDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all documents
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

      // Format documents and filter out ones already in this project
      const formattedDocs = (data as unknown as SupabaseDocument[])
        .map(doc => ({
          ...doc,
          date: new Date(doc.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          project_names: doc.project_documents
            ?.map(pd => pd.project?.name)
            .filter((name): name is string => name !== undefined)
        }))
        .filter(doc => !doc.project_documents?.some(pd => pd.project?.id === projectId));

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDocs(new Set());
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    !searchQuery || 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[736px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Assign documents
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
          Assign documents from your vault not assigned to this project.
        </p>

        {/* Search and content card */}
        <div className="border border-[#E4E5E1] rounded-lg mb-4 overflow-hidden">
          {/* Search bar */}
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

          {/* Documents list */}
          <div className="h-[368px] overflow-y-auto divide-y divide-[#E4E5E1]">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <label 
                  key={doc.id} 
                  className="flex items-center gap-3 p-3 hover:bg-[#F7F7F6] cursor-pointer"
                >
                  <div className="relative w-4 h-4">
                    <input
                      type="checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedDocs);
                        if (e.target.checked) {
                          newSelected.add(doc.id);
                        } else {
                          newSelected.delete(doc.id);
                        }
                        setSelectedDocs(newSelected);
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
                  <div className="flex items-center gap-2 flex-1">
                    <svg 
                      className="h-5 w-5 text-[#646462]"
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M 13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A] truncate">
                        {doc.name}
                      </div>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[#E4E5E1] -mx-6">
          <div className="px-6 flex justify-between items-center">
            <span className="text-[14px] leading-[20px] font-oracle text-[#646462]">
              {selectedDocs.size > 0 && (
                `${selectedDocs.size} document${selectedDocs.size !== 1 ? 's' : ''} selected`
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
                onClick={() => {
                  onImport?.(Array.from(selectedDocs));
                  onClose();
                }}
                disabled={selectedDocs.size === 0}
                className={`px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors ${
                  selectedDocs.size > 0
                    ? 'bg-[#1A1A1A] hover:bg-[#333333] text-white'
                    : 'bg-[#F0F1EF] text-[#646462] cursor-not-allowed'
                }`}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 