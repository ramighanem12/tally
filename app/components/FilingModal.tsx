'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { downloadSingleFile } from '../utils/fileDownload'
import { toast } from 'react-hot-toast'

type Filing = {
  id: string;
  date: string;
  name: string;
  type: string;
  status: string;
  responsible: string;
  confirmation?: string;
  authority: string;
  period_start?: string;
  period_end?: string;
  due_date?: string;
  url?: string;
  notes?: string;
  details?: {
    [key: string]: string | number;
  };
}

type FilingModalProps = {
  filing: Filing | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatStatus = (status: string) => {
  switch(status.toLowerCase()) {
    case 'filed': return 'Filed';
    case 'on_track': return 'On track';
    case 'action_needed': return 'Action needed';
    default: return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

export default function FilingModal({ filing, isOpen, onClose }: FilingModalProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(filing?.notes || '');
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const autoSave = useCallback(async (value: string) => {
    setSaveStatus('saving');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Here you would typically save to your backend
      console.log('Saving notes:', value);
      setSaveStatus('saved');
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }, 2000);
  }, []);

  if (!isOpen || !filing) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      {/* Right Panel */}
      <div 
        className={`absolute top-[9px] bottom-[9px] right-[9px] w-[698px] bg-white rounded-[14px] shadow-xl flex flex-col
          ${isOpen ? 'animate-slideInRight' : 'animate-slideOutRight'}`}
      >
        <div className="flex-none flex justify-between items-center px-6 py-5 border-b border-[#E4E5E1]">
          <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            Filing details
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

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Details card */}
            <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
              {/* Filing name as subheader with status pill */}
              <div className="mb-4 -mx-4">
                <div className="flex items-center gap-2 px-4 pb-3">
                  <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    {filing.name}
                  </h3>
                  <span className={`inline-block px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] ${
                    filing.status === 'filed' 
                      ? 'bg-[#B6F2E3] text-[#181818]'
                      : filing.status === 'on_track'
                        ? 'bg-[#E1EFFF] text-[#181818]'
                      : filing.status === 'action_needed'
                        ? 'bg-[#F2B8B6] text-[#181818]'
                      : ''
                  }`}>
                    {formatStatus(filing.status)}
                  </span>
                </div>
                <div className="border-b border-[#E4E5E1]" />
              </div>

              {/* Grid of fields */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Filing date
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {formatDate(filing.date)}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Period start date
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {filing.period_start ? formatDate(filing.period_start) : '—'}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Period end date
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {filing.period_end ? formatDate(filing.period_end) : '—'}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Due date
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {filing.due_date ? formatDate(filing.due_date) : '—'}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Type
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {filing.type}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Authority
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {filing.authority}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Confirmation
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {filing.confirmation || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action needed card */}
            {filing.status === 'action_needed' && (
              <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
                {/* Subheader */}
                <div className="mb-4 -mx-4">
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-[4px]">
                      <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                        Resolve issues
                      </h3>
                      <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#F0F1EF] rounded-[4px] text-[11px] font-semibold font-['Inter'] text-[#1A1A1A]">
                        3
                      </span>
                    </div>
                  </div>
                  <div className="border-b border-[#E4E5E1]" />
                </div>

                {/* Action needed content */}
                <div className="divide-y divide-[#E4E5E1] -mt-1">
                  <div 
                    className="group flex items-center h-[40px] relative cursor-pointer"
                    onClick={() => {
                      onClose()
                      router.push('/documents')
                    }}
                  >
                    <div className="absolute inset-x-[-8px] h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F7F7F6]/50 transition-colors" />
                    <div className="relative flex items-center justify-between w-full">
                      <span className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                        Upload payment confirmation
                      </span>
                      <button className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-2.5 h-[26px] rounded-full font-['Inter'] font-semibold text-[13px] leading-[16px] transition-colors opacity-0 group-hover:opacity-100">
                        Resolve
                      </button>
                    </div>
                  </div>

                  <div 
                    className="group flex items-center h-[40px] relative cursor-pointer"
                    onClick={() => {
                      onClose()
                      router.push('/documents')
                    }}
                  >
                    <div className="absolute inset-x-[-8px] h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F7F7F6]/50 transition-colors" />
                    <div className="relative flex items-center justify-between w-full">
                      <span className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                        Upload bank statement
                      </span>
                      <button className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-2.5 h-[26px] rounded-full font-['Inter'] font-semibold text-[13px] leading-[16px] transition-colors opacity-0 group-hover:opacity-100">
                        Resolve
                      </button>
                    </div>
                  </div>

                  <div 
                    className="group flex items-center h-[40px] relative cursor-pointer"
                    onClick={() => {
                      onClose()
                      router.push('/settings/tax-settings')
                    }}
                  >
                    <div className="absolute inset-x-[-8px] h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F7F7F6]/50 transition-colors" />
                    <div className="relative flex items-center justify-between w-full">
                      <span className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                        Configure TR-2 tax settings
                      </span>
                      <button className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-2.5 h-[26px] rounded-full font-['Inter'] font-semibold text-[13px] leading-[16px] transition-colors opacity-0 group-hover:opacity-100">
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Download card */}
            <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
              {/* Subheader */}
              <div className="mb-4 -mx-4">
                <div className="px-4 pb-3">
                  <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    Filing
                  </h3>
                </div>
                <div className="border-b border-[#E4E5E1]" />
              </div>

              {/* Conditional render based on status */}
              {filing.status === 'filed' ? (
                <button 
                  className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors flex items-center gap-2"
                  onClick={async () => {
                    try {
                      if (filing.url) {
                        await downloadSingleFile(filing.url, `${filing.name}.pdf`);
                      } else {
                        toast.error('No document associated with this filing');
                      }
                    } catch (error) {
                      console.error('Error downloading file:', error);
                      toast.error('Failed to download file');
                    }
                  }}
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
                      d="M12 15.575q-.2 0-.375-.063-.175-.062-.325-.212l-3.6-3.6q-.275-.275-.275-.7 0-.425.275-.7.275-.275.712-.287.438-.013.713.262L11 12.15V5q0-.425.288-.713Q11.575 4 12 4t.713.287Q13 4.575 13 5v7.15l1.875-1.875q.275-.275.713-.263.437.013.712.288.275.275.275.7 0 .425-.275.7l-3.6 3.6q-.15.15-.325.212-.175.063-.375.063ZM6 20q-.825 0-1.413-.587Q4 18.825 4 18v-2q0-.425.287-.713Q4.575 15 5 15t.713.287Q6 15.575 6 16v2h12v-2q0-.425.288-.713Q18.575 15 19 15t.712.287Q20 15.575 20 16v2q0 .825-.587 1.413Q18.825 20 18 20Z"
                    />
                  </svg>
                  Download
                </button>
              ) : (
                <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#646462]">
                  Not ready yet
                </div>
              )}
            </div>

            {/* Notes Card */}
            <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
              {/* Subheader */}
              <div className="mb-4 -mx-4">
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                        Notes
                      </h3>
                      <div className="relative group">
                        <span className="inline-block px-2 py-0.5 rounded-[6px] bg-[#EFEFED] text-[#1A1A1A] font-['Inter'] font-[450] text-[12.5px] leading-[18px] flex items-center gap-1">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24"
                            className="fill-[#1A1A1A]"
                          >
                            <path d="M23.895,11.553C23.72,11.204,19.531,3,12,3S0.28,11.204,0.105,11.553c-0.141,0.282-0.141,0.613,0,0.895	C0.28,12.796,4.469,21,12,21s11.72-8.204,11.895-8.553C24.035,12.166,24.035,11.834,23.895,11.553z M12,16c-2.209,0-4-1.791-4-4	c0-2.209,1.791-4,4-4s4,1.791,4,4C16,14.209,14.209,16,12,16z" />
                          </svg>
                          Visible to you and Heritage
                        </span>

                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                          <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                            <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A]">
                              Your notes will be visible to your advisor and tax concierge team.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {saveStatus && (
                      <span className="text-[14px] leading-[16px] font-normal font-['Inter'] text-[#646462] flex items-center gap-1">
                        {saveStatus === 'saving' ? 'Saving...' : (
                          <>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="14" 
                              height="14" 
                              viewBox="0 0 24 24"
                              className="fill-current"
                            >
                              <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                            </svg>
                            Auto-saved
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-b border-[#E4E5E1]" />
              </div>

              <div>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    autoSave(e.target.value);
                  }}
                  className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] placeholder-[#646462] resize-none focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
                  placeholder="Add your notes here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 