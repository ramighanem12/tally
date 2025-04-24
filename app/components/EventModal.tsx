'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { format } from 'date-fns'

export type Event = {
  id: string;
  name: string;
  type: string;
  status: string;
  period: string;
  dueDate: string;
  description?: string;
  steps?: string[];
  resources?: Array<{ title: string; url: string }>;
  notes?: string;
  details?: {
    [key: string]: string | number;
  };
}

type EventModalProps = {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

const getStatusStyles = (status: string) => {
  switch(status.toLowerCase()) {
    case 'filed':
      return 'bg-[#B6F2E3] text-[#181818]';
    case 'on_track':
      return 'bg-[#E1EFFF] text-[#181818]';
    case 'action_needed':
      return 'bg-[#F2B8B6] text-[#181818]';
    default:
      return 'bg-[#EFEFED] text-[#1A1A1A]';
  }
};

const formatStatus = (status: string) => {
  switch(status) {
    case 'filed': return 'Completed';
    case 'on_track': return 'On track';
    case 'action_needed': return 'Action needed';
    default: return status;
  }
};

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const [notes, setNotes] = useState(event?.notes || '');
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  if (!isOpen || !event) return null

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
        {/* Fixed header */}
        <div className="flex-none flex justify-between items-center px-6 py-5 border-b border-[#E4E5E1]">
          <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            Event details
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Details card */}
            <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
              {/* Event name as subheader */}
              <div className="mb-4 -mx-4">
                <div className="flex items-center gap-2 px-4 pb-3">
                  <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    {event.name}
                  </h3>
                  <span className={`inline-block px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] ${getStatusStyles(event.status)}`}>
                    {formatStatus(event.status)}
                  </span>
                </div>
                <div className="border-b border-[#E4E5E1]" />
              </div>

              {/* Grid of fields */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Type
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {event.type}
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Period
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {event.period}
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                    Due date
                  </label>
                  <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                    {formatDate(event.dueDate)}
                  </div>
                </div>
                {/* Render additional details in the grid */}
                {event.details && Object.entries(event.details).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                    <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                      {value.toString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description card */}
            {event.description && (
              <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
                {/* Subheader */}
                <div className="mb-4 -mx-4">
                  <div className="px-4 pb-3">
                    <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                      Description
                    </h3>
                  </div>
                  <div className="border-b border-[#E4E5E1]" />
                </div>

                {/* Description content */}
                <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                  {event.description}
                </div>
              </div>
            )}

            {/* Resources card */}
            {event.resources && (
              <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
                {/* Subheader */}
                <div className="mb-4 -mx-4">
                  <div className="px-4 pb-3">
                    <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                      Resources
                    </h3>
                  </div>
                  <div className="border-b border-[#E4E5E1]" />
                </div>

                {/* Resources list */}
                <div className="space-y-2">
                  {event.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      className="block text-[14px] leading-[20px] font-normal font-['Inter'] text-[#006ADC] hover:underline"
                    >
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Steps card */}
            {event.steps && (
              <div className="bg-white border border-[#E4E5E1] rounded-lg p-4">
                {/* Subheader */}
                <div className="mb-4 -mx-4">
                  <div className="px-4 pb-3">
                    <h3 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
                      Steps to take
                    </h3>
                  </div>
                  <div className="border-b border-[#E4E5E1]" />
                </div>

                {/* Steps list */}
                <ol className="list-decimal pl-4 space-y-1">
                  {event.steps.map((step, index) => (
                    <li 
                      key={index}
                      className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] pl-1"
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

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