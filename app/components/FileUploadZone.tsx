'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ImportFromVaultModal from './ImportFromVaultModal'

interface FileUploadZoneProps {
  onFileChange: (files: File[]) => void
  onImportFromVault?: (docIds: string[]) => void
  acceptedFileTypes?: string[]
  multiple?: boolean
  required?: boolean
  documentTypes?: string[]
}

export default function FileUploadZone({ 
  onFileChange, 
  onImportFromVault,
  acceptedFileTypes, 
  multiple = false,
  required = false,
  documentTypes
}: FileUploadZoneProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileChange(acceptedFiles)
  }, [onFileChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: acceptedFileTypes?.reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {}),
    multiple,
  })

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple
    input.accept = acceptedFileTypes?.join(',') || ''
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      onDrop(files)
    }
    input.click()
  }

  const handleVaultImport = (selectedDocIds: string[]) => {
    if (onImportFromVault) {
      onImportFromVault(selectedDocIds)
    }
    setIsImportModalOpen(false)
  }

  return (
    <div className="space-y-4 w-full">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer w-full
        transition-colors ${isDragActive ? 'border-[#1A1A1A] bg-[#F7F7F6]' : 'border-[#E4E5E1] hover:border-[#BBBDB7] hover:bg-[#FAFAFA]'}`}
      >
        <input {...getInputProps()} required={required} />
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <svg 
              className="h-[19.5px] w-[19.5px] text-[#1A1A1A]"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" />
            </svg>
            <p className="font-medium text-[16px] leading-[24px] text-[#1A1A1A]">
              Drag and drop documents, or click to select
            </p>
          </div>

          <div className="flex justify-center gap-2">
            <button
              type="button"
              className="bg-[#1A1A1A] text-white text-[14px] h-[32px] px-4
                rounded-md font-medium font-oracle inline-flex items-center
                hover:bg-[#404040] transition-colors"
              onClick={handleUploadClick}
            >
              Upload file(s)
            </button>
            <button
              type="button"
              className="bg-white text-[#1A1A1A] text-[14px] h-[32px] px-4
                rounded-md font-medium font-oracle inline-flex items-center
                border border-[#E4E5E1] shadow-sm
                hover:bg-[#F7F7F6] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setIsImportModalOpen(true)
              }}
            >
              Import from Vault
            </button>
          </div>
        </div>
      </div>

      <ImportFromVaultModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleVaultImport}
      />
    </div>
  )
} 