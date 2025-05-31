'use client'
import { useState, useCallback } from 'react'
import { ViewFilesModalProps } from './ViewFilesModal'
import ImportFromVaultModal from './ImportFromVaultModal'

interface DocumentsCardProps {
  files: ViewFilesModalProps['files']
  onRemoveFile: (fileId: string) => void
  onRemoveProjectFile: (projectId: string, fileName: string) => void
  onUploadFiles?: (files: File[]) => void
  onImportFiles?: (docIds: string[]) => void
}

export default function DocumentsCard({ files, onRemoveFile, onRemoveProjectFile, onUploadFiles, onImportFiles }: DocumentsCardProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(files.filter(f => f.type === 'project').map(p => p.id))
  )

  const handleUploadClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      onUploadFiles?.(files)
    }
    input.click()
  }

  const handleVaultImport = (selectedDocIds: string[]) => {
    onImportFiles?.(selectedDocIds)
    setIsImportModalOpen(false)
  }

  // Add FileIcon component
  const FileIcon = () => (
    <svg 
      className="h-4 w-4 text-[#646462] flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M 13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
    </svg>
  )

  // Add FolderIcon component
  const FolderIcon = () => (
    <svg 
      className="h-4 w-4 text-[#646462] flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" />
    </svg>
  )

  // Add DeleteIcon component to match ViewFilesModal
  const DeleteIcon = () => (
    <svg 
      className="w-4 h-4 text-[#646462]"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
    >
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )

  // Add VaultIcon component
  const VaultIcon = () => (
    <svg 
      className="h-[18px] w-[18px] text-[#1A1A1A]"
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.5 20L18.5 14M18.5 14L21 16.5M18.5 14L16 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <div className="px-4 pt-4">
      <div className="bg-white border border-[#E4E5E1] rounded-[8px] py-4 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="text-[16px] leading-[22px] font-oracle font-medium text-[#1A1A1A] mb-3">
          Documents
        </div>

        {/* Only show upload buttons if handlers are provided */}
        {(onUploadFiles || onImportFiles) && (
          <div className="flex flex-col gap-2 mb-4">
            {onUploadFiles && (
              <button
                type="button"
                className="w-full bg-[#1A1A1A] text-white text-[14px] h-[32px] px-4
                  rounded-md font-medium font-oracle inline-flex items-center justify-center
                  hover:bg-[#404040] transition-colors"
                onClick={handleUploadClick}
              >
                Upload
              </button>
            )}
            {onImportFiles && (
              <button
                type="button"
                className="w-full bg-white text-[#1A1A1A] text-[14px] h-[32px] px-4
                  rounded-md font-medium font-oracle inline-flex items-center justify-center gap-2
                  border border-[#E4E5E1] shadow-sm
                  hover:bg-[#F7F7F6] transition-colors"
                onClick={() => setIsImportModalOpen(true)}
              >
                <VaultIcon />
                Import from Vault
              </button>
            )}
          </div>
        )}

        {/* Files list */}
        {files.length === 0 ? (
          <div className="text-[14px] leading-[20px] text-[#646462]">
            No files
          </div>
        ) : (
          <div className="border border-[#E4E5E1] rounded-lg overflow-hidden">
            <div className="divide-y divide-[#E4E5E1]">
              <div className="max-h-[216px] overflow-y-auto divide-y divide-[#E4E5E1]">
                {files.map((item) => (
                  <div key={item.id}>
                    {item.type === 'project' ? (
                      <div className="divide-y divide-[#E4E5E1]">
                        <div className="flex items-center gap-3 py-2 px-3 hover:bg-[#F7F7F6]">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FolderIcon />
                            <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => onRemoveFile(item.id)}
                              className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md"
                            >
                              <DeleteIcon />
                            </button>
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedProjects)
                                if (newExpanded.has(item.id)) {
                                  newExpanded.delete(item.id)
                                } else {
                                  newExpanded.add(item.id)
                                }
                                setExpandedProjects(newExpanded)
                              }}
                              className="text-[#646462]"
                            >
                              <svg 
                                className={`w-4 h-4 transition-transform ${
                                  expandedProjects.has(item.id) ? 'rotate-180' : ''
                                }`}
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {expandedProjects.has(item.id) && item.files?.map((fileName) => (
                          <div key={fileName} className="flex items-center gap-3 py-2 px-3 pl-8 hover:bg-[#F7F7F6]">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileIcon />
                              <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] truncate">
                                {fileName}
                              </span>
                            </div>
                            <button
                              onClick={() => onRemoveProjectFile(item.id, fileName)}
                              className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md flex-shrink-0"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-2 px-3 hover:bg-[#F7F7F6]">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileIcon />
                          <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] truncate">
                            {item.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveFile(item.id)}
                          className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md flex-shrink-0"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ImportFromVaultModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleVaultImport}
      />
    </div>
  )
} 