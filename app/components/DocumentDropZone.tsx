'use client'
import { useDropzone } from 'react-dropzone'
import { ReactNode, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

type DocumentDropZoneProps = {
  onDrop: (files: File[]) => void | Promise<void>
  showOverlay?: boolean
  children: ReactNode
}

export default function DocumentDropZone({ onDrop, showOverlay = true, children }: DocumentDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(async (files: File[]) => {
    try {
      await onDrop(files)
    } catch (error) {
      console.error('Error handling drop:', error)
      toast.error('Failed to handle files')
    }
    setIsDragging(false)
  }, [onDrop])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => {
      setIsDragging(false)
      toast.error('Invalid file type or size')
    },
  })

  return (
    <div {...getRootProps()} className="relative h-full">
      <input {...getInputProps()} />
      {isDragging && showOverlay && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F6] flex items-center justify-center">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                className="text-[#1A1A1A]"
              >
                <path 
                  fill="currentColor" 
                  d="M11 14.9861C11 15.5384 11.4477 15.9861 12 15.9861C12.5523 15.9861 13 15.5384 13 14.9861V7.82831L15.2428 10.0711C15.6333 10.4616 16.2665 10.4616 16.657 10.0711C17.0475 9.68063 17.0475 9.04746 16.657 8.65694L12.7071 4.70705C12.3166 4.31653 11.6834 4.31653 11.2929 4.70705L7.34315 8.65694C6.95263 9.04746 6.95263 9.68063 7.34315 10.0711C7.73368 10.4616 8.36684 10.4616 8.75737 10.0711L11 7.82831V14.9861Z"/>
                <path 
                  fill="currentColor" 
                  d="M3 14.9861C3 14.4338 3.44772 13.9861 4 13.9861C4.55228 13.9861 5 14.4338 5 14.9861V15.9861C5 17.6429 6.34315 18.9861 8 18.9861H16C17.6569 18.9861 19 17.6429 19 15.9861V14.9861C19 14.4338 19.4477 13.9861 20 13.9861C20.5523 13.9861 21 14.4338 21 14.9861V15.9861C21 18.7475 18.7614 20.9861 16 20.9861H8C5.23858 20.9861 3 18.7475 3 15.9861V14.9861Z"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] mb-1">
                Drop your files here
              </h3>
              <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#646462]">
                Drop files here to upload them to your documents
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  )
} 