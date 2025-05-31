'use client'
import { useEffect, useState } from 'react'

export interface ViewFilesModalProps {
  isOpen: boolean
  onClose: () => void
  files: {
    id: string
    name: string
    type: 'project' | 'file'
    files?: string[] // For projects
  }[]
  onRemoveFile: (fileId: string) => void
  onRemoveProjectFile: (projectId: string, fileName: string) => void
}

export default function ViewFilesModal({ 
  isOpen, 
  onClose, 
  files,
  onRemoveFile,
  onRemoveProjectFile
}: ViewFilesModalProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(files.filter(f => f.type === 'project').map(p => p.id))
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedProjects(new Set(files.filter(f => f.type === 'project').map(p => p.id)));
      setSearchQuery('');
    }
  }, [isOpen, files]);

  // File icon SVG
  const FileIcon = () => (
    <svg 
      className="h-5 w-5 text-[#646462]"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M 13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
    </svg>
  )

  // Folder icon SVG
  const FolderIcon = () => (
    <svg 
      className="h-5 w-5 text-[#646462]"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" />
    </svg>
  )

  // Add a DeleteIcon component
  const DeleteIcon = () => (
    <svg 
      className="w-4 h-4 text-[#646462]"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
    >
      <path fill="currentColor" d="M 12 2 C 6.4919555 2 2 6.4919596 2 12 C 2 17.50804 6.4919555 22 12 22 C 17.508045 22 22 17.50804 22 12 C 22 6.4919596 17.508045 2 12 2 z M 12 4.5 C 16.156945 4.5 19.5 7.8430575 19.5 12 C 19.5 16.156943 16.156945 19.5 12 19.5 C 7.8430549 19.5 4.5 16.156943 4.5 12 C 4.5 7.8430575 7.8430549 4.5 12 4.5 z M 8 10.75 A 1.250125 1.250125 0 1 0 8 13.25 L 16 13.25 A 1.250125 1.250125 0 1 0 16 10.75 L 8 10.75 z" />
    </svg>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[736px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            View files
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

        {/* Combined search and files list */}
        <div className="border border-[#E4E5E1] rounded-lg overflow-hidden">
          {/* Search bar inside card */}
          <div className="relative border-b border-[#E4E5E1]">
            <input
              type="text"
              placeholder="Search files..."
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

          {/* Files list */}
          <div className="h-[368px] overflow-y-auto divide-y divide-[#E4E5E1]">
            {files
              .filter(item => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                if (item.type === 'project') {
                  return item.name.toLowerCase().includes(query) || 
                    item.files?.some(file => file.toLowerCase().includes(query));
                }
                return item.name.toLowerCase().includes(query);
              })
              .map((item) => (
                <div key={item.id}>
                  {item.type === 'project' ? (
                    <>
                      <div className="flex items-center gap-3 p-3 hover:bg-[#F7F7F6]">
                        <div className="flex items-center gap-2 flex-1">
                          <FolderIcon />
                          <span className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A]">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onRemoveFile(item.id)}
                            className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md"
                          >
                            <DeleteIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newExpanded = new Set(expandedProjects);
                              if (newExpanded.has(item.id)) {
                                newExpanded.delete(item.id);
                              } else {
                                newExpanded.add(item.id);
                              }
                              setExpandedProjects(newExpanded);
                            }}
                            className="text-[#646462]"
                          >
                            <svg 
                              className={`w-4 h-4 transition-transform ${
                                expandedProjects.has(item.id) ? 'rotate-180' : ''
                              } flex-shrink-0`}
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M4 6L8 10L12 6" 
                                stroke="currentColor" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {expandedProjects.has(item.id) && item.files?.map((fileName, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 pl-8 hover:bg-[#F7F7F6] border-t border-[#E4E5E1]">
                          <div className="flex items-center gap-2 flex-1">
                            <FileIcon />
                            <span className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A]">
                              {fileName}
                            </span>
                          </div>
                          <button
                            onClick={() => onRemoveProjectFile(item.id, fileName)}
                            className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 p-3 hover:bg-[#F7F7F6]">
                      <div className="flex items-center gap-2 flex-1">
                        <FileIcon />
                        <span className="text-[15px] leading-[22px] font-oracle text-[#1A1A1A]">
                          {item.name}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFile(item.id)}
                        className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md"
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
    </div>
  )
} 