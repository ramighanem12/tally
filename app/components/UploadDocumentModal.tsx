'use client'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface UploadDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: () => void
  initialFiles?: File[]
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

export default function UploadDocumentModal({ isOpen, onClose, onUploadComplete, initialFiles = [] }: UploadDocumentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    },
    multiple: true
  })

  const handleUpload = async () => {
    if (!selectedFiles.length || !user) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        // Create unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `uploads/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        // Upload file to Supabase storage
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        // Insert document record into documents table
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            name: file.name,
            description: note,
            url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            tags: [], // Add tags functionality later
            urgent: isUrgent
          })

        if (insertError) throw insertError

        return publicUrl
      })

      await Promise.all(uploadPromises)
      toast.success('Documents uploaded successfully')
      onUploadComplete?.()
      onClose()
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast.error('Failed to upload documents')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[440px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            Upload document
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

        <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] mb-6">
          Upload any documents related to your business. We'll help you organize and store them securely.
        </p>

        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors cursor-pointer
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
          <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
            {isDragActive ? 'Drop your files here' : 'Drag and drop your files here'}
          </p>
          <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#646462] mt-1">
            or click to browse
          </p>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto mb-4">
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-[#F7F7F7] rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24"
                      className="text-[#66CC99]"
                    >
                      <path 
                        fill="currentColor"
                        d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 16 9 C 16.25575 9 16.511531 9.0974687 16.707031 9.2929688 C 17.098031 9.6839688 17.098031 10.316031 16.707031 10.707031 L 11.707031 15.707031 C 11.512031 15.902031 11.256 16 11 16 C 10.744 16 10.487969 15.902031 10.292969 15.707031 L 7.2929688 12.707031 C 6.9019687 12.316031 6.9019688 11.683969 7.2929688 11.292969 C 7.6839688 10.901969 8.3160313 10.901969 8.7070312 11.292969 L 11 13.585938 L 15.292969 9.2929688 C 15.488469 9.0974688 15.74425 9 16 9 z"
                      />
                    </svg>
                    <span className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A] truncate max-w-[250px]">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 rounded-lg hover:bg-[#E4E5E1] transition-colors"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24"
                      className="text-[#646462]"
                    >
                      <path 
                        fill="currentColor"
                        d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simple Urgent Toggle with Tooltip */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <span className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
              Mark urgent
            </span>
            <div 
              className="relative"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24"
                className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
              >
                <path 
                  fill="currentColor"
                  d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                />
              </svg>
              
              {isTooltipVisible && (
                <div 
                  className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-3 min-w-[240px]"
                >
                  <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] whitespace-normal">
                    Send to our tax concierge team for review
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsUrgent(!isUrgent)}
            type="button"
            className={`relative inline-flex h-[22px] w-[40px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isUrgent ? 'bg-[#1A1A1A]' : 'bg-[#E4E5E1]'
            }`}
            role="switch"
            aria-checked={isUrgent}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isUrgent ? 'translate-x-[18px]' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1.5">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any additional context..."
            className="w-full px-3 py-2 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none resize-none h-[60px]"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-[#E4E5E1] -mx-6">
          <div className="px-6">
            <div className="flex justify-end gap-1.5">
              <button 
                onClick={onClose}
                className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className={`px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors ${
                  selectedFiles.length > 0 && !isUploading
                    ? 'bg-[#1A1A1A] hover:bg-[#333333] text-white' 
                    : 'bg-[#F0F1EF] text-[#646462] cursor-not-allowed'
                }`}
              >
                {isUploading ? (
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
                    <span>Uploading...</span>
                  </div>
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