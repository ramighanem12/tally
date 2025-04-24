'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Viewer } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import * as pdfjsLib from 'pdfjs-dist';
import { useAuth } from '@/contexts/AuthContext'
import { Request } from '@/lib/types'
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  isOpen: boolean
  onClose: () => void
  request: Request | null
}

interface DocumentRow {
  id: string;
  name: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
  status: 'In Review' | 'Accepted' | 'Returned';
  type: string;
  size: number;
  mime_type: string;
  storage_path?: string;
  request_id: string;
}

interface FormattedDocumentRow extends DocumentRow {
  formattedDate?: string;
}

interface DocumentReview {
  id: string;
  name: string;
  content?: string;
  url?: string;
  status: 'In Review' | 'Accepted' | 'Returned';
  updated: string;
}

interface RequestFile {
  id: string;
  name: string;
  url: string;
  storage_path?: string;
  uploaded_by: string;
  uploaded_at: string;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const EllipsisIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="2.5" r="1.35" fill="currentColor"/>
    <circle cx="8" cy="8" r="1.35" fill="currentColor"/>
    <circle cx="8" cy="13.5" r="1.35" fill="currentColor"/>
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4 text-yellow-500 ml-2" viewBox="0 0 16 16" fill="none">
    <path d="M8 5.5V8.5M8 11.5H8.01M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const UploadIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="none">
    <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.3333 5.33333L8 2L4.66667 5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackArrow = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <path 
      d="M16.6667 10H3.33337M3.33337 10L8.33337 15M3.33337 10L8.33337 5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="none">
    <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V10M8 10L11.3333 6.66667M8 10L4.66667 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Add input styles from ControlDetailsModal
const inputStyles = `
  w-full px-3 py-2 text-sm
  text-gray-900 dark:text-white
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  hover:border-gray-300 dark:hover:border-gray-600
  rounded-lg
  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
  transition-colors
`;

const disabledInputStyles = `
  w-full px-3 py-2 text-sm
  text-gray-900 dark:text-white
  bg-gray-50 dark:bg-gray-900
  border border-gray-200 dark:border-gray-700
  rounded-lg
  cursor-not-allowed
`;

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
    case 'Completed':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
    case 'Blocked':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
    default:
      return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'
  }
}

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

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'  // Use UTC to ensure consistency
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

const handleDownload = async (url: string, fileName: string) => {
  try {
    // Fetch the file
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName; // Set the file name
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Failed to download file');
  }
};

const handleDownloadFiles = async (files: DocumentRow[]) => {
  if (files.length === 1) {
    // Single file download - use existing handleDownload
    handleDownload(files[0].url, files[0].name);
    return;
  }

  // Multiple files - create zip
  try {
    const zip = new JSZip();
    
    // Fetch all files and add to zip
    await Promise.all(files.map(async (file) => {
      const response = await fetch(file.url);
      const blob = await response.blob();
      zip.file(file.name, blob);
    }));
    
    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" });
    const zipUrl = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `request-files-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(zipUrl);
  } catch (error) {
    console.error('Error creating zip file:', error);
    alert('Failed to download files');
  }
};

export default function RequestDetailsModal({ isOpen, onClose, request }: Props) {
  const [isShowing, setIsShowing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [editedRequest, setEditedRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Files')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<FormattedDocumentRow[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentReview | null>(null);
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add useEffect to handle clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdownId && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  useEffect(() => {
    if (isOpen && request) {
      setIsShowing(true)
      setTimeout(() => setIsAnimating(true), 10)
      setEditedRequest(request)
      // Load documents when modal opens
      loadRequestDocuments(request.id)
    } else {
      setIsAnimating(false)
      setTimeout(() => {
        setIsShowing(false)
        setSelectedDocument(null) // Reset selected document when modal closes
        setSelectedDocs([]) // Reset selected docs when modal closes
      }, 300)
    }
  }, [isOpen, request])

  const handleSave = async () => {
    if (!editedRequest) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('requests')
        .update({
          name: editedRequest.name,
          description: editedRequest.description,
          status: editedRequest.status,
          due_date: editedRequest.due_date,
          category: editedRequest.category,
          priority: editedRequest.priority,
        })
        .eq('id', editedRequest.id)

      if (error) throw error
      onClose()
    } catch (error) {
      console.error('Error updating request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (field: keyof Request, value: any) => {
    if (!editedRequest) return

    setEditedRequest(prev => prev ? { ...prev, [field]: value } : null)
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('requests')
        .update({ [field]: value })
        .eq('id', editedRequest.id)

      if (error) throw error
    } catch (error) {
      console.error('Error saving update:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocs(documents.map(doc => doc.id))
    } else {
      setSelectedDocs([])
    }
  }

  const handleSelectDoc = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !editedRequest) return

    setIsUploading(true)
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`
      
      // Create a structured path including the request ID
      const filePath = `public/${editedRequest.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Storage error:', uploadError)
        throw new Error('Failed to upload file to storage')
      }

      // 2. Get the public URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 31536000) // 1 year expiry

      if (signedError) throw signedError

      // 3. Create document record in the database with request_id
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          url: signedData.signedUrl,
          request_id: editedRequest.id,
          engagement_id: editedRequest.engagement_id,
          uploaded_by: user.id,
          type: file.type,
          size: file.size,
          mime_type: file.type,
          status: 'In Review',
          storage_path: filePath
        })

      if (dbError) {
        console.error('Database error:', dbError)
        // Clean up the uploaded file if DB insert fails
        await supabase.storage
          .from('documents')
          .remove([filePath])
        throw new Error('Failed to create document record')
      }

      // 4. Refresh documents list
      await loadRequestDocuments(editedRequest.id)

    } catch (error: any) {
      console.error('Error uploading document:', error)
      alert(error.message || 'Failed to upload document')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const loadRequestDocuments = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('request_id', requestId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error

      // Format the dates for each document but keep original status
      const formattedDocs = (data || []).map(doc => ({
        ...doc,
        formattedDate: formatDate(doc.uploaded_at)
      }))

      setDocuments(formattedDocs)
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const handleDelete = async (file: DocumentRow) => {
    try {
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // Delete from storage if storage_path exists
      if (file.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('request_files')
          .remove([file.storage_path]);

        if (storageError) throw storageError;
      }

      // Refresh the files list using the existing function
      if (editedRequest) {
        loadRequestDocuments(editedRequest.id);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  if (!isShowing || !editedRequest) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-gray-900/50 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`
            w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
            transform transition-all duration-300 ease-out flex flex-col
            ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 relative">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                Request
                {isSaving && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editedRequest.name}
                </h2>
                <span className={`
                  inline-flex items-center px-2 py-1 rounded text-sm font-medium
                  ${getStatusStyles(editedRequest.status)}
                `}>
                  {editedRequest.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Update the content wrapper to use remaining height */}
          <div className="flex flex-1 min-h-0 divide-x divide-gray-200 dark:divide-gray-700">
            {/* Left Column - Make it scrollable */}
            <div className="w-[30%] overflow-y-auto">
              <div className="p-6">
                <div className="space-y-6">
                  {/* Basic Information section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedRequest.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={inputStyles}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editedRequest.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className={`${inputStyles} resize-none min-h-[60px]`}
                      />
                    </div>
                  </div>

                  {/* Request Information section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Request Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={editedRequest.category || ''}
                          onChange={(e) => handleChange('category', e.target.value)}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Status
                        </label>
                        <div className="relative">
                          <select
                            value={editedRequest.status}
                            onChange={(e) => handleChange('status', e.target.value as 'In Progress' | 'Completed' | 'Blocked')}
                            className={`${inputStyles} pr-8 appearance-none cursor-pointer`}
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDownIcon />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={editedRequest.due_date?.split('T')[0] || ''}
                          onChange={(e) => handleChange('due_date', e.target.value)}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Priority
                        </label>
                        <div className="relative">
                          <select
                            value={editedRequest.priority || ''}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            className={`${inputStyles} pr-8 appearance-none cursor-pointer`}
                          >
                            <option value="">Select priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDownIcon />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Information section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Assignment Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Created By
                        </label>
                        <input
                          type="text"
                          value={editedRequest.created_by}
                          disabled
                          className={disabledInputStyles}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Assigned To
                        </label>
                        <input
                          type="text"
                          value={editedRequest.assigned_to || ''}
                          onChange={(e) => handleChange('assigned_to', e.target.value)}
                          className={inputStyles}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column with Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedDocument ? (
                // Document Review Mode
                <div className="flex flex-col h-full">
                  {/* Document Review Header */}
                  <div className="px-6 py-[9px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-8">
                      <button
                        onClick={() => setSelectedDocument(null)}
                        className="group p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors flex-shrink-0"
                      >
                        <BackArrow />
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                          {selectedDocument.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleDownload(selectedDocument.url!, selectedDocument.name)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <DownloadIcon />
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Document Review Content */}
                  <div className="flex-1 relative">
                    {selectedDocument.url ? (
                      <>
                        {/* PDF Viewer Container */}
                        <div className="absolute inset-0 overflow-y-auto">
                          <div className="h-full bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col">
                            <div className="p-1 border-b border-gray-200 dark:border-gray-700">
                              <Toolbar />
                            </div>
                            <div className="flex-1">
                              <Viewer 
                                fileUrl={selectedDocument.url}
                                plugins={[toolbarPluginInstance]} 
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 min-h-[200px]">
                        {selectedDocument.content}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Original Tab Content
                <>
                  {/* Your existing tab content */}
                  <div className="px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <nav className="flex space-x-4">
                      {['Files', 'Activity'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`
                            py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium
                            ${tab === activeTab
                              ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }
                          `}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                    
                    {activeTab === 'Files' && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                        />
                        <div className="flex items-center gap-2">
                          {selectedDocs.length > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  if (!confirm(`Are you sure you want to delete ${selectedDocs.length} files?`)) return;
                                  selectedDocs.forEach(fileId => {
                                    const file = documents.find(f => f.id === fileId);
                                    if (file) handleDelete(file);
                                  });
                                  setSelectedDocs([]);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors"
                              >
                                Delete {selectedDocs.length} files
                              </button>
                              <button
                                onClick={() => {
                                  const filesToDownload = selectedDocs
                                    .map(fileId => documents.find(f => f.id === fileId))
                                    .filter((file): file is DocumentRow => !!file);
                                  handleDownloadFiles(filesToDownload);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                              >
                                Download {selectedDocs.length} files
                              </button>
                              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                            </>
                          )}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <UploadIcon />
                                Upload
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'Files' && (
                      <div className="space-y-4">
                        {/* Documents Table */}
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="w-[48px] pl-4 pr-3 py-3">
                                  <div className="flex items-center justify-center h-full">
                                    <input
                                      type="checkbox"
                                      className={checkboxStyle}
                                      checked={selectedDocs.length === documents.length && documents.length > 0}
                                      onChange={handleSelectAll}
                                    />
                                  </div>
                                </th>
                                <th className="w-[45%] min-w-[200px] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Name
                                </th>
                                <th className="w-[140px] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Updated
                                </th>
                                <th className="w-[120px] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Status
                                </th>
                                <th className="w-[48px]" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {documents.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center">
                                      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none">
                                        <path d="M4.5 6.5C4.5 5.11929 5.61929 4 7 4H17C18.3807 4 19.5 5.11929 19.5 6.5V17.5C19.5 18.8807 18.3807 20 17 20H7C5.61929 20 4.5 18.8807 4.5 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M7.5 9.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <path d="M7.5 12.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <path d="M7.5 15.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                      </svg>
                                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                        No documents found
                                      </h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Get started by uploading your first document
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                documents.map((doc, index) => (
                                  <tr 
                                    key={doc.id}
                                    onClick={() => {
                                      setSelectedDocument({
                                        id: doc.id,
                                        name: doc.name,
                                        status: doc.status,
                                        updated: doc.uploaded_at,
                                        url: doc.url
                                      });
                                    }}
                                    className={`
                                      hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer
                                      ${index === documents.length - 1 ? 'last-row' : ''}
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
                                    <td className="w-[45%] min-w-[200px] px-3 py-3 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <DocumentIcon fileName={doc.name} />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[calc(100%-24px)]">
                                          {doc.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="w-[140px] px-3 py-3 whitespace-nowrap">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {doc.formattedDate || formatDate(doc.uploaded_at)}
                                      </span>
                                    </td>
                                    <td className="w-[120px] px-3 py-3 whitespace-nowrap">
                                      <span className={`
                                        inline-flex items-center px-2 py-0.5 text-[13px] font-medium rounded
                                        ${doc.status === 'In Review' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' : ''}
                                        ${doc.status === 'Accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' : ''}
                                        ${doc.status === 'Returned' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' : ''}
                                      `}>
                                        {doc.status === 'Returned' && <ReturnIcon />}
                                        {doc.status === 'Accepted' && <CheckIcon />}
                                        {doc.status}
                                      </span>
                                    </td>
                                    <td className="w-[48px] p-2">
                                      <div className="relative">
                                        <button 
                                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdownId(openDropdownId === doc.id ? null : doc.id);
                                          }}
                                        >
                                          <EllipsisIcon />
                                        </button>

                                        {openDropdownId === doc.id && (
                                          <div 
                                            ref={dropdownRef}
                                            className="dropdown-menu absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                                          >
                                            <button 
                                              className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                              onClick={() => {
                                                setSelectedDocument({
                                                  id: doc.id,
                                                  name: doc.name,
                                                  status: doc.status,
                                                  updated: doc.uploaded_at,
                                                  url: doc.url
                                                });
                                                setOpenDropdownId(null);
                                              }}
                                            >
                                              View
                                            </button>
                                            <button 
                                              className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                              onClick={() => {
                                                /* handle rename */
                                                setOpenDropdownId(null);
                                              }}
                                            >
                                              Rename
                                            </button>
                                            <button 
                                              className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                              onClick={() => {
                                                /* handle archive */
                                                setOpenDropdownId(null);
                                              }}
                                            >
                                              Archive
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 