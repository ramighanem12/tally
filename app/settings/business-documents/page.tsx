'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function BusinessDocumentsPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [isAdvisorBannerClosing, setIsAdvisorBannerClosing] = useState(false)
  // Add some dummy document data
  const [requestedDocuments] = useState([
    {
      id: 'REQ-001',
      name: 'W-9 Form',
      date: 'Mar 5, 2024',
      dueDate: 'Mar 12, 2024'
    },
    {
      id: 'REQ-002',
      name: 'Proof of Address',
      date: 'Mar 4, 2024',
      dueDate: 'Mar 11, 2024'
    }
  ])

  const [completedDocuments] = useState([
    {
      id: 'DOC-001',
      name: 'Articles of Incorporation',
      date: 'Mar 1, 2024',
      status: 'Verified'
    },
    {
      id: 'DOC-002',
      name: 'Business License',
      date: 'Feb 28, 2024',
      status: 'Verified'
    },
    {
      id: 'DOC-003',
      name: 'Certificate of Insurance',
      date: 'Feb 25, 2024',
      status: 'Verified'
    }
  ])

  // Shared file upload handler
  const handleFileUpload = useCallback((files: File[]) => {
    console.log('Uploading files:', files)
    // Handle file upload here
  }, [])

  // Main dropzone for the upload area
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload
  })

  // Dropzone for document requests
  const { open: openFileDialog } = useDropzone({
    onDrop: handleFileUpload,
    noClick: true, // Prevents the wrapper from becoming clickable
    noKeyboard: true // Prevents keyboard interaction
  })

  // Handle completed document click
  const handleCompletedDocClick = () => {
    // Create a link element
    const link = document.createElement('a')
    link.href = '/sample.pdf'
    link.download = 'sample.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reusable table component
  const DocumentTable = ({ documents, isRequests = false }: { documents: any[], isRequests?: boolean }) => (
    <div className="w-full">
      <div className={`grid ${isRequests ? 'grid-cols-4' : 'grid-cols-4'} gap-4 py-2 border-b border-[#E4E5E1]`}>
        <div className={`${isRequests ? 'col-span-2' : 'col-span-2'} text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]`}>
          Document Name
        </div>
        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
          {isRequests ? 'Date Requested' : 'Date Completed'}
        </div>
        {isRequests ? (
          <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
            Due Date
          </div>
        ) : (
          <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
            Status
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="py-4 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
          No documents yet.
        </div>
      ) : (
        <div className="divide-y divide-[#E4E5E1]">
          {documents.map((document) => (
            <div 
              key={document.id} 
              className="grid grid-cols-4 gap-4 h-[42px] items-center relative group cursor-pointer"
              onClick={() => isRequests ? openFileDialog() : handleCompletedDocClick()}
            >
              {/* Update hover background to have permanent rounded corners */}
              <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
              
              {/* Chevron that appears on hover */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z"
                    fill="#646462"
                  />
                </svg>
              </div>

              <div className="col-span-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                <span className="block transition-transform group-hover:translate-x-2">
                  {document.name}
                </span>
              </div>
              <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                {document.date}
              </div>
              {isRequests ? (
                <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                  {document.dueDate}
                </div>
              ) : (
                <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                  {document.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const handleDismissBanner = () => {
    setIsAdvisorBannerClosing(true)
    setTimeout(() => {
      setShowBanner(false)
    }, 300)
  }

  return (
    <div className="space-y-4 px-6 pr-[24px] py-4">
      {/* Banner with dismiss button */}
      {showBanner && (
        <div 
          className={`transform transition-all duration-300 ease-out
            ${isAdvisorBannerClosing ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}
        >
          <div className="bg-[#F0F0F0] rounded-xl p-6 relative">
            <button 
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#E4E5E1] transition-colors"
              onClick={handleDismissBanner}
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

            <div className="w-[55%] flex flex-col justify-center">
              <h2 className="text-[20px] leading-[32px] font-semibold font-['Inter'] text-[#1A1A1A]">
                Complete your document requests
              </h2>
              <p className="mt-2 text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A]">
                Upload your business documents to expedite the onboarding process. This helps us verify your business and get you set up faster.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requests card */}
      <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
              Document requests
              <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#FFE4D2] rounded-full text-[11px] font-bold font-['Inter'] text-[#1A1A1A]">
                {requestedDocuments.length}
              </span>
            </h2>
          </div>
          <DocumentTable documents={requestedDocuments} isRequests={true} />
        </div>
      </div>

      {/* Completed documents section */}
      <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
              Completed documents
              <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#CFF0CA] rounded-full text-[11px] font-bold font-['Inter'] text-[#1A1A1A]">
                {completedDocuments.length}
              </span>
            </h2>
          </div>
          <DocumentTable documents={completedDocuments} isRequests={false} />
        </div>
      </div>
    </div>
  )
} 