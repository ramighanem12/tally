import React from 'react'

interface Deliverable {
  title: string;
  content: string;
  summary: string;
  recommendations: string[];
  attachments: string[];
}

interface DeliverablesCardProps {
  deliverable?: Deliverable;
  onDownload?: () => void;
  isReady?: boolean;
}

export default function DeliverablesCard({ deliverable, onDownload, isReady = false }: DeliverablesCardProps) {
  return (
    <div className="bg-white border border-[#E4E5E1] rounded-lg">
      <div className="px-4 py-3 border-b border-[#E4E5E1]">
        <h3 className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
          Deliverables
        </h3>
      </div>
      
      <div className="p-4">
        {!deliverable ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 mx-auto mb-3 text-[#9A9A99]">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <p className="text-[14px] leading-[20px] text-[#646462] font-oracle">
              Deliverables will appear here when the workflow completes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[#F7F7F6] rounded-lg">
              <div className="w-8 h-8 flex-shrink-0 bg-[#41629E] rounded-lg flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] truncate">
                    {deliverable.title}
                  </h4>
                  {isReady && (
                    <span className="text-[12px] leading-[16px] font-oracle text-[#059669] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  )}
                </div>
                <p className="text-[12px] leading-[16px] font-oracle text-[#646462] mb-2">
                  {deliverable.summary.slice(0, 100)}...
                </p>
                {isReady && onDownload && (
                  <button
                    onClick={onDownload}
                    className="text-[12px] leading-[16px] font-oracle text-[#41629E] hover:text-[#385389] transition-colors"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            {deliverable.recommendations && deliverable.recommendations.length > 0 && (
              <div className="text-[12px] leading-[16px] font-oracle text-[#646462]">
                <span className="font-medium">Key recommendations:</span>
                <ul className="mt-1 space-y-1">
                  {deliverable.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-[#9A9A99] mt-0.5">•</span>
                      <span className="flex-1">{rec.slice(0, 60)}...</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 