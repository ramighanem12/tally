'use client'
import { useState, useEffect } from 'react'
import { WorkflowInput, WorkflowInputType } from '@/data/workflows'

type ActionState = {
  isComplete: boolean
  isActive: boolean
  response?: any
}

interface WorkflowActionCardProps {
  input: WorkflowInput
  onComplete: (inputId: string, response: any) => void
  visible?: boolean
  autoStart?: boolean
}

const fadeInDescription = `
  @keyframes fadeInDescription {
    0% { opacity: 0; transform: translateY(-4px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`

export default function WorkflowActionCard({ 
  input, 
  onComplete, 
  visible = true,
  autoStart = false 
}: WorkflowActionCardProps) {
  const [state, setState] = useState<ActionState>({
    isComplete: false,
    isActive: autoStart,
  })

  const handleFileUpload = (files: FileList) => {
    setState(prev => ({ ...prev, response: files, isComplete: true }))
    onComplete(input.id, files)
  }

  if (!visible) return null

  return (
    <>
      <style jsx>{fadeInDescription}</style>
      <div className="w-[65%] bg-white rounded-lg border animate-pulse-border border-[#41629E]">
        <div className={`px-4 py-3 relative bg-[#F9FAFB] rounded-t-lg`}>
          <div className="flex items-center gap-2">
            {state.isComplete ? (
              <div className="w-4 h-4 rounded-full border border-[#E4E5E1] bg-white flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L4.5 8.5L2 6" stroke="#41629E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
            )}
            <h3 className="text-[15px] leading-[20px] font-medium font-oracle text-[#41629E]">
              Action Required
            </h3>
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out overflow-hidden">
          <div className="border-t border-[#E4E5E1]" />
          <div className="px-4 py-3">
            <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
              <div className="mb-2">
                <p className="text-[15px] leading-[20px] font-oracle text-[#1A1A1A] font-medium">
                  {input.label}
                </p>
                {input.description && (
                  <p className="mt-1 text-[13px] leading-[18px] font-oracle text-[#6B7280] opacity-0 animate-[fadeInDescription_0.3s_ease-out_0.4s_forwards]">
                    {input.description}
                  </p>
                )}
              </div>

              {/* Input type specific UI */}
              {input.type === WorkflowInputType.DOCUMENT_UPLOAD && (
                <div className="mt-3">
                  <label className="block w-full cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      multiple={input.multiple}
                      accept={input.acceptedFileTypes?.join(',')}
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    />
                    <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-[#BBBDB7] border-[#E4E5E1]">
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
                        Drag and drop your files here
                      </p>
                      <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#646462] mt-1">
                        or click to browse
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 