import { type FC } from 'react'
import { type UploadState } from '../hooks/useFileUpload'

interface FileUploadOverlayProps {
  uploadState: UploadState
}

const FileUploadOverlay: FC<FileUploadOverlayProps> = ({ uploadState }) => {
  if (uploadState === 'idle') return null

  return (
    <div className="absolute inset-0 bg-[#41629E] bg-opacity-[0.03] flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="w-5 h-5">
          {uploadState === 'dragging' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0003 13.3333V3.33325M10.0003 3.33325L5.83366 7.49992M10.0003 3.33325L14.167 7.49992M2.50033 13.3333L2.80283 14.8374C2.90504 15.2441 3.13237 15.6051 3.4531 15.8661C3.77382 16.1271 4.17103 16.2729 4.58366 16.2799H15.417C15.8296 16.2729 16.2268 16.1271 16.5476 15.8661C16.8683 15.6051 17.0956 15.2441 17.1978 14.8374L17.5003 13.3333" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6668 5L7.50016 14.1667L3.3335 10" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
          {uploadState === 'dragging' ? 'Drop files to upload' : 'Uploading...'}
        </span>
      </div>
    </div>
  )
}

export default FileUploadOverlay 