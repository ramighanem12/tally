'use client'
import { useState, useEffect, Dispatch, SetStateAction } from 'react'

interface StatusFilterProps {
  statusFilter: string[];
  setStatusFilter: Dispatch<SetStateAction<string[]>>;
  uniqueStatuses: string[];
}

// Helper function to format status for display
const formatStatus = (status: string) => {
  switch(status) {
    case 'filed': return 'Completed';
    case 'on_track': return 'On track';
    case 'action_needed': return 'Action needed';
    default: return status;
  }
};

export default function StatusFilter({
  statusFilter,
  setStatusFilter,
  uniqueStatuses
}: StatusFilterProps) {
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-filter')) {
        setIsStatusFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="status-filter relative flex items-center gap-1">
      <span>Status</span>
      <button 
        onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
        className={`w-5 h-5 flex items-center justify-center rounded transition-all ${
          statusFilter.length > 0 
            ? 'bg-[#E1EFFF] text-[#1A1A1A] hover:bg-[#CCE2FF]' 
            : 'bg-[#F0F0F0] hover:bg-[#E4E5E1]'
        }`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          className="text-[#4A4A49]"
        >
          <path 
            fill="currentColor"
            d="M3,3v3.561l6,6v6.091l6,4V12.561l6-6V3H3z"
          />
        </svg>
      </button>
      
      {isStatusFilterOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E4E4] w-[200px] p-2 z-50">
          <div className="space-y-[2px]">
            <button
              className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                statusFilter.length === 0 ? 'bg-[#F7F7F7]' : ''
              }`}
              onClick={() => {
                setStatusFilter([]);
                setIsStatusFilterOpen(false);
              }}
            >
              All
              {statusFilter.length === 0 && (
                <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                </svg>
              )}
            </button>
            {uniqueStatuses.map(status => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter(prev => 
                    prev.includes(status)
                      ? prev.filter(f => f !== status)
                      : [...prev, status]
                  );
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                  statusFilter.includes(status) ? 'bg-[#F7F7F7]' : ''
                }`}
              >
                {formatStatus(status)}
                {statusFilter.includes(status) && (
                  <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 