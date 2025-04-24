'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import DocumentPanel from '../../components/DocumentPanel'
import DocumentTypeFilter from '../../components/DocumentTypeFilter'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

interface IconProps {
  className?: string;
}

const ChevronRightIcon = ({ className = "" }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeaderDocumentIcon = ({ className = "" }: IconProps) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 15H7M16.5 11H7M16.5 7H7M19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="none">
    <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.3333 5.33333L8 2L4.66667 5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EllipsisIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="2.5" r="1.35" fill="currentColor"/>
    <circle cx="8" cy="8" r="1.35" fill="currentColor"/>
    <circle cx="8" cy="13.5" r="1.35" fill="currentColor"/>
  </svg>
);

const ReturnIcon = () => (
  <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 16 16" fill="none">
    <path d="M7 3L3 7M3 7L7 11M3 7H11C12.6569 7 14 8.34315 14 10V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentIcon = ({ fileName }: { fileName: string }) => {
  const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.csv');
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isWord = fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc');
  
  if (isExcel) {
    return (
      <img src="/excel.svg" alt="Excel file" className="w-4 h-4 mr-2" />
    );
  }

  if (isPdf) {
    return (
      <img src="/pdflogo.svg" alt="PDF file" className="w-4 h-4 mr-2" />
    );
  }

  if (isWord) {
    return (
      <img src="/doc.svg" alt="Word file" className="w-4 h-4 mr-2" />
    );
  }

  return (
    <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 16 16" fill="none">
      <path d="M4 1.5H8.58579C8.851 1.5 9.10536 1.60536 9.29289 1.79289L13.2071 5.70711C13.3946 5.89464 13.5 6.149 13.5 6.41421V13C13.5 13.8284 12.8284 14.5 12 14.5H4C3.17157 14.5 2.5 13.8284 2.5 13V3C2.5 2.17157 3.17157 1.5 4 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 1.5V4.5C8.5 5.32843 9.17157 6 10 6H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const checkboxStyle = `
  appearance-none
  w-[18px] h-[18px]
  border-2 border-gray-300 dark:border-gray-600
  rounded
  bg-white dark:bg-gray-800
  checked:bg-blue-600 checked:border-blue-600
  dark:checked:bg-blue-500 dark:checked:border-blue-500
  hover:border-blue-500 dark:hover:border-blue-400
  focus:outline-none focus:ring-2 focus:ring-blue-500/20
  transition-colors
  relative
  cursor-pointer
  after:content-[''] after:absolute
  after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2
  after:w-[10px] after:h-[10px]
  after:bg-no-repeat after:bg-center
  checked:after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')]
`;

interface Document {
  id: string;
  name: string;
  url?: string;
  uploaded_by: string;
  uploaded_at: string;
  status: 'In Review' | 'Accepted' | 'Returned';
  type: string;
  size: number;
  mime_type: string;
  storage_path?: string;
  access?: string;
  engagement?: string;
  metadata?: Record<string, any>;
}

interface DocumentReview {
  id: string;
  name: string;
  content?: string;
  url?: string;
  status: 'In Review' | 'Accepted' | 'Returned';
  updated: string;
}

const DocumentUploadIcon = ({ isUploading = false }: { isUploading?: boolean }) => (
  <div className="relative">
    {isUploading ? (
      <svg className="w-10 h-10 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    ) : (
      <>
        <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 7H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </>
    )}
  </div>
);

const FilterIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type SortField = 'name' | 'updated' | 'access' | 'engagement';
type SortDirection = 'asc' | 'desc';

const SortIcon = ({ className = "", active = false, direction }: { 
  className?: string; 
  active?: boolean; 
  direction?: SortDirection;
}) => (
  <svg 
    className={`${className} ${active ? 'text-gray-900' : ''} ${direction === 'desc' ? 'rotate-180' : ''} transition-transform`} 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none"
  >
    <path d="M8 3.33334V12.6667M8 3.33334L11.3333 6.66667M8 3.33334L4.66667 6.66667" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Replace the current SparkleIcon with this one from ControlDetailsModal
const SparkleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L9.5 5.5L13.5 7L9.5 8.5L8 12.5L6.5 8.5L2.5 7L6.5 5.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 2L13 3L13.5 2L14.5 1.5L13.5 1L13 0L12.5 1L11.5 1.5L12.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 13.5L3.5 14.5L4 13.5L5 13L4 12.5L3.5 11.5L3 12.5L2 13L3 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Add dummy engagements data
const DUMMY_ENGAGEMENTS = [
  { id: '1', name: 'SOC 2 Type II Audit 2024' },
  { id: '2', name: 'ISO 27001 Assessment' },
  { id: '3', name: 'HIPAA Compliance Review' },
  { id: '4', name: 'PCI DSS Gap Analysis' },
  { id: '5', name: 'GDPR Implementation' },
  { id: '6', name: 'SOX Compliance Audit' },
  { id: '7', name: 'NIST Framework Review' },
  { id: '8', name: 'Data Privacy Assessment' },
  { id: '9', name: 'Security Controls Review' },
  { id: '10', name: 'Vendor Risk Assessment' }
];

const PlusIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="none">
    <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PersonalDocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(false);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadDocuments()
    }
  }, [user])

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('docs')
        .select('*')
        .eq('uploaded_by', user?.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file || !user) return

    try {
      setIsUploading(true)
      
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`
      const filePath = `public/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) throw uploadError

      // 2. Get the public URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 31536000) // 1 year expiry

      if (signedError) throw signedError

      // 3. Create document record in the docs table
      const { data: doc, error: dbError } = await supabase
        .from('docs')
        .insert([{
          name: file.name,
          url: signedData.signedUrl,
          storage_path: filePath,
          uploaded_by: user.id,
          type: file.type,
          size: file.size,
          mime_type: file.type,
          status: 'In Review'
        }])
        .select()
        .single()

      if (dbError) throw dbError

      toast.success(`${file.name} uploaded successfully`)
      await loadDocuments() // Refresh the documents list
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(`Failed to upload ${file.name}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDocs(
      selectedDocs.length === documents.length
        ? []
        : documents.map(doc => doc.id)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await handleFileUpload(file)
    }
  }, [user])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  // Add this function to filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedDocTypes.length === 0 || 
      selectedDocTypes.some(type => {
        switch(type) {
          case 'PDF':
            return doc.name.toLowerCase().endsWith('.pdf')
          case 'Excel':
            return doc.name.toLowerCase().endsWith('.xlsx') || 
                   doc.name.toLowerCase().endsWith('.xls')
          case 'Word':
            return doc.name.toLowerCase().endsWith('.docx') || 
                   doc.name.toLowerCase().endsWith('.doc')
          case 'CSV':
            return doc.name.toLowerCase().endsWith('.csv')
          default:
            return false
        }
      })
    return matchesSearch && matchesType
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Add sorting to the filtered documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'updated':
        return direction * (new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
      case 'access':
        return direction * ((a.access || '').localeCompare(b.access || ''));
      case 'engagement':
        return direction * ((a.engagement || '').localeCompare(b.engagement || ''));
      default:
        return 0;
    }
  });

  // Add this function to handle file deletion
  const handleDelete = async (doc: Document, showToast = true) => {
    try {
      // Delete from docs table
      const { error: dbError } = await supabase
        .from('docs')
        .delete()
        .eq('id', doc.id)

      if (dbError) throw dbError

      // Delete from storage if storage_path exists
      if (doc.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.storage_path])

        if (storageError) {
          console.warn(`File may remain in storage: ${doc.storage_path}`)
        }
      }

      setActiveDropdown(null)
      await loadDocuments()

      // Only show toast if showToast is true
      if (showToast) {
        toast.success(`${doc.name} deleted successfully`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#F9FAFB',
            color: '#111827',
            border: '1px solid #E5E7EB',
            paddingLeft: '16px',
            paddingRight: '16px',
          },
          icon: '✓',
        })
      }

    } catch (error: any) {
      console.error('Error deleting document:', error)
      if (showToast) {
        toast.error(`Failed to delete ${doc.name}`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#F9FAFB',
            color: '#111827',
            border: '1px solid #E5E7EB',
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        })
      }
      throw error
    }
  }

  // Add this to handle Ask Tally click
  const handleAskTally = (selectedDocIds: string[]) => {
    // Get the selected documents' data
    const selectedDocuments = documents.filter(doc => selectedDocIds.includes(doc.id));
    
    // Store selected documents in localStorage or state management
    localStorage.setItem('pinnedDocuments', JSON.stringify(selectedDocuments));
    
    // Navigate to copilot page
    router.push('/copilot');
  };

  const handleRowClick = (doc: Document) => {
    setSelectedDocument(doc);
    setIsPanelOpen(true);
  };

  const handleCreateMatrix = async (selectedDocIds: string[]) => {
    try {
      // First create the matrix
      const { data: matrix, error: matrixError } = await supabase
        .from('matrices')
        .insert({
          name: 'New Matrix',
          created_by: user?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (matrixError) throw matrixError

      // Then create the document associations
      const { error: docsError } = await supabase
        .from('matrix_documents')
        .insert(
          selectedDocIds.map((docId, index) => ({
            matrix_id: matrix.id,
            document_id: docId,
            order_index: index
          }))
        )

      if (docsError) throw docsError

      // Navigate to the matrix page with a query param to show column modal
      router.push(`/matrices/${matrix.id}?showColumnModal=true`)

    } catch (error) {
      console.error('Error creating matrix:', error)
      toast.error('Failed to create matrix')
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="documents-personal" />
      <div className="fixed top-4 right-4 z-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#F9FAFB',
              color: '#111827',
              border: '1px solid #E5E7EB',
            },
          }}
        />
      </div>
      <main className={`
        flex-1 flex flex-col overflow-hidden bg-white
        transition-all duration-300 ease-out relative 
        ${isPanelOpen ? 'mr-[40%]' : ''}
      `}>
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className={`
            py-6
            ${isPanelOpen ? 'px-6' : 'px-20'}
            transition-all duration-300 ease-out
          `}>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <Link 
                href="/copilot" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Copilot
              </Link>
              <ChevronRightIcon className="text-gray-400" />
              <span className="text-gray-900 font-medium">Documents</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <HeaderDocumentIcon className="text-gray-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Access and manage your documents
                  </p>
                </div>
              </div>
              <button
                onClick={() => {/* TODO: Implement document import */}}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <PlusIcon />
                Import documents
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table container */}
        <div className={`
          flex-1 overflow-y-auto py-6
          ${isPanelOpen ? 'px-6' : 'px-20'}
          transition-all duration-300 ease-out
        `}>
          {/* Drag and drop card */}
          <div className="mb-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white p-4">
              <div 
                {...getRootProps()} 
                className={`
                  border-2 border-dashed rounded-lg bg-gray-50 cursor-pointer transition-all duration-150
                  ${isDragAccept ? 'border-green-500 bg-green-50' : ''}
                  ${isDragReject ? 'border-red-500 bg-red-50' : ''}
                  ${!isDragActive && !isUploading ? 'border-gray-200 dark:border-gray-700' : ''}
                  ${isDragActive && !isDragAccept && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
                  ${isUploading ? 'border-blue-500 bg-blue-50' : ''}
                `}
              >
                <input {...getInputProps()} disabled={isUploading} />
                <div className="flex flex-col items-center justify-center py-5">
                  <DocumentUploadIcon isUploading={isUploading} />
                  <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {isUploading ? 'Uploading file...' :
                       isDragReject ? 'This file type is not supported' : 
                       isDragAccept ? 'Drop to upload file' :
                       isDragActive ? 'Drop files here...' : 
                       'Click to upload or drag and drop'}
                    </p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {isUploading ? 'Please wait while we process your file' :
                       'PDF, Word and Excel spreadsheets only'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Files table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Search bar - Fixed header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className={`
                relative transition-all duration-300 ease-out
                ${isPanelOpen ? 'w-[320px]' : 'w-[400px]'}
              `}>
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
                  viewBox="0 0 16 16" 
                  fill="none"
                >
                  <path d="M7.5 13C10.5376 13 13 10.5376 13 7.5C13 4.46243 10.5376 2 7.5 2C4.46243 2 2 4.46243 2 7.5C2 10.5376 4.46243 13 7.5 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedDocs.length > 0 && (
                  <>
                    <button
                      onClick={() => handleAskTally(selectedDocs)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-colors"
                    >
                      <SparkleIcon />
                      Ask Tally
                    </button>
                    <button
                      onClick={() => handleCreateMatrix(selectedDocs)}
                      className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Create matrix
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          for (const docId of selectedDocs) {
                            const doc = documents.find(d => d.id === docId);
                            if (doc) {
                              await handleDelete(doc, true);
                            }
                          }
                          setSelectedDocs([]);
                        } catch (error) {
                          console.error('Error in bulk delete:', error);
                        }
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Delete {selectedDocs.length} files
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                  </>
                )}
                <button 
                  onClick={() => setIsFilterRowVisible(!isFilterRowVisible)}
                  className={`
                    px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg 
                    border border-gray-200 transition-colors inline-flex items-center
                    ${isFilterRowVisible ? 'border-blue-500 text-blue-500' : ''}
                  `}
                >
                  <FilterIcon className="mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Filter row */}
            {isFilterRowVisible && (
              <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <button className="px-2.5 py-1 text-sm font-medium text-gray-600 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg inline-flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="none">
                    <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Uploaded</span>
                </button>

                <button className="px-2.5 py-1 text-sm font-medium text-gray-600 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg inline-flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="none">
                    <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Audit</span>
                </button>

                <button className="px-2.5 py-1 text-sm font-medium text-gray-600 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg inline-flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="none">
                    <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Access</span>
                </button>

                <DocumentTypeFilter 
                  selectedTypes={selectedDocTypes}
                  onTypeChange={setSelectedDocTypes}
                />
              </div>
            )}

            {/* Table wrapper - This div ensures consistent horizontal scroll */}
            <div className="w-full overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse" style={{ minWidth: '800px' }}>
                  <colgroup>
                    <col className="w-[48px]" />
                    <col className="w-[45%]" />
                    <col className="w-[15%]" />
                    <col className="w-[25%]" />
                    <col className="w-[15%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pl-4 pr-3 py-3 w-[56px]">
                        <div className="flex items-center justify-center h-full">
                          <input
                            type="checkbox"
                            className={checkboxStyle}
                            checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-[300px]">
                        <button 
                          onClick={() => handleSort('name')}
                          className="inline-flex items-center gap-2"
                        >
                          Name
                          <SortIcon 
                            active={sortField === 'name'} 
                            direction={sortField === 'name' ? sortDirection : undefined}
                          />
                        </button>
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-[180px]">
                        <button 
                          onClick={() => handleSort('updated')}
                          className="inline-flex items-center gap-2"
                        >
                          Updated
                          <SortIcon 
                            active={sortField === 'updated'} 
                            direction={sortField === 'updated' ? sortDirection : undefined}
                          />
                        </button>
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-[120px]">
                        <button 
                          onClick={() => handleSort('engagement')}
                          className="inline-flex items-center gap-2"
                        >
                          Engagement
                          <SortIcon 
                            active={sortField === 'engagement'} 
                            direction={sortField === 'engagement' ? sortDirection : undefined}
                          />
                        </button>
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-[120px]">
                        <button 
                          onClick={() => handleSort('access')}
                          className="inline-flex items-center gap-2"
                        >
                          Access
                          <SortIcon 
                            active={sortField === 'access'} 
                            direction={sortField === 'access' ? sortDirection : undefined}
                          />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none">
                              <path d="M4.5 6.5C4.5 5.11929 5.61929 4 7 4H17C18.3807 4 19.5 5.11929 19.5 6.5V17.5C19.5 18.8807 18.3807 20 17 20H7C5.61929 20 4.5 18.8807 4.5 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M7.5 9.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M7.5 12.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M7.5 15.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                              {searchQuery ? 'No matching documents found' : 'No documents found'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {searchQuery ? 'Try adjusting your search' : 'Get started by uploading your first document'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedDocuments.map((doc, index) => (
                        <tr 
                          key={doc.id}
                          onClick={() => {
                            setSelectedDocument(doc);
                            requestAnimationFrame(() => {
                              setIsPanelOpen(true);
                            });
                          }}
                          className={`
                            hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer
                            ${index === sortedDocuments.length - 1 ? '[&>td:first-child]:rounded-bl-lg [&>td:last-child]:rounded-br-lg' : ''}
                          `}
                        >
                          <td 
                            className="w-[48px] pl-4 pr-3 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                className={checkboxStyle}
                                checked={selectedDocs.includes(doc.id)}
                                onChange={() => handleSelectDoc(doc.id)}
                              />
                            </div>
                          </td>
                          <td className="w-[400px] px-3 py-3">
                            <div className="flex items-center max-w-[400px]">
                              <DocumentIcon fileName={doc.name} />
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[calc(100%-24px)]">
                                {doc.name}
                              </span>
                            </div>
                          </td>
                          <td className="w-[120px] px-3 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(doc.uploaded_at)}
                            </span>
                          </td>
                          <td className="w-[200px] px-3 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {doc.engagement || '-'}
                            </span>
                          </td>
                          <td className="w-[100px] px-3 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {doc.access || '-'}
                            </span>
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

      {/* Add the panel */}
      <DocumentPanel 
        document={selectedDocument} 
        onClose={() => {
          setIsPanelOpen(false);
          setTimeout(() => {
            setSelectedDocument(null);
          }, 300);
        }}
        className={`
          absolute top-0 right-0 h-full w-[40%]
          transform ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
          transition-transform duration-300 ease-out
          shadow-[-1px_0_3px_-1px_rgba(0,0,0,0.05)]
          bg-white border-l border-gray-200
        `}
      />
    </div>
  )
} 