'use client'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { uploadDocuments } from '@/app/utils/uploadDocuments'

interface Project {
  id: string;
  name: string;
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
  initialFiles?: File[];
  projectId?: string;
}

interface Document {
  id: string;
  name: string;
  description?: string;
  url: string;
  file_type: string;
  file_size: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  urgent: boolean;
}

export default function UploadDocumentModal({ isOpen, onClose, onUploadComplete, initialFiles = [], projectId: initialProjectId }: UploadDocumentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId || null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialFiles.length > 0) {
      setSelectedFiles(initialFiles);
    }
  }, [initialFiles]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoadingProjects(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isOpen]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    },
    multiple: true
  })

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    
    setIsUploading(true);
    try {
      const projectIdToUse = selectedProjectId || initialProjectId;
      const success = await uploadDocuments(selectedFiles, projectIdToUse);
      if (success) {
        onUploadComplete?.();
        onClose();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Update the FileIcon component to accept className
  const FileIcon = ({ className }: { className?: string }) => (
    <svg 
      className={`h-5 w-5 text-[#646462] ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M 13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
    </svg>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[440px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Add document
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

        <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] mb-6">
          Upload any documents related to your business. We'll help you organize and store them securely.
        </p>

        <div className="space-y-4 mb-6">
          {/* Upload Section */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${isDragActive ? 'border-[#1A1A1A] bg-[#F7F7F7]' : 'border-[#E4E5E1] hover:border-[#BBBDB7]'}`}
          >
            <input {...getInputProps()} />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              className="mx-auto mb-2 text-[#646462]"
            >
              <path 
                fill="currentColor"
                d="M 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 11 22 A 1.0001 1.0001 0 1 0 11 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 11 A 1.0001 1.0001 0 1 0 20 11 L 20 8 A 1.0001 1.0001 0 0 0 19.707031 7.2929688 L 14.707031 2.2929688 A 1.0001 1.0001 0 0 0 14 2 L 6.5 2 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z M 19 14 C 16.239 14 14 16.239 14 19 C 14 21.761 16.239 24 19 24 C 21.761 24 24 21.761 24 19 C 24 16.239 21.761 14 19 14 z M 19 16 C 19.414 16 19.75 16.336 19.75 16.75 L 19.75 18.25 L 21.25 18.25 C 21.664 18.25 22 18.586 22 19 C 22 19.414 21.664 19.75 21.25 19.75 L 19.75 19.75 L 19.75 21.25 C 19.75 21.664 19.414 22 19 22 C 18.586 22 18.25 21.664 18.25 21.25 L 18.25 19.75 L 16.75 19.75 C 16.336 19.75 16 19.414 16 19 C 16 18.586 16.336 18.25 16.75 18.25 L 18.25 18.25 L 18.25 16.75 C 18.25 16.336 18.586 16 19 16 z"
              />
            </svg>
            <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
              {isDragActive ? 'Drop your files here' : 'Drag and drop your files here'}
            </p>
            <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#646462] mt-1">
              or click to browse
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="border border-[#E4E5E1] rounded-lg overflow-hidden">
              <div className="max-h-[200px] overflow-y-auto divide-y divide-[#E4E5E1]">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 p-3 hover:bg-[#F7F7F6] min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileIcon className="flex-shrink-0" />
                      <span className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A] truncate flex-1">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md flex-shrink-0"
                    >
                      <svg 
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          fill="currentColor" 
                          d="M 12 2 C 6.4919555 2 2 6.4919596 2 12 C 2 17.50804 6.4919555 22 12 22 C 17.508045 22 22 17.50804 22 12 C 22 6.4919596 17.508045 2 12 2 z M 12 4.5 C 16.156945 4.5 19.5 7.8430575 19.5 12 C 19.5 16.156943 16.156945 19.5 12 19.5 C 7.8430549 19.5 4.5 16.156943 4.5 12 C 4.5 7.8430575 7.8430549 4.5 12 4.5 z M 8 10.75 A 1.250125 1.250125 0 1 0 8 13.25 L 16 13.25 A 1.250125 1.250125 0 1 0 16 10.75 L 8 10.75 z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add project dropdown */}
          <div>
            <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
              Add to project (optional)
            </label>
            <div className="relative">
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                className="w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] 
                  bg-white appearance-none
                  text-[14px] leading-[20px] font-oracle text-[#1A1A1A] 
                  focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
                disabled={isLoadingProjects || !!initialProjectId}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path 
                    d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Separator and buttons */}
        <div className="mt-4 pt-4 border-t border-[#E4E5E1] -mx-6">
          <div className="px-6">
            <div className="flex justify-end gap-1.5">
              <button 
                onClick={onClose}
                className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className={`px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors flex items-center gap-2 ${
                  selectedFiles.length > 0 && !isUploading
                    ? 'bg-[#1A1A1A] hover:bg-[#333333] text-white' 
                    : 'bg-[#F0F1EF] text-[#646462] cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <>
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
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 