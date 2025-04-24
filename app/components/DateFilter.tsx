'use client'
import { useState, useEffect, Dispatch, SetStateAction } from 'react'

interface DateFilterProps {
  dateRangeFilter: {
    from: string;
    to: string;
  };
  setDateRangeFilter: Dispatch<SetStateAction<{
    from: string;
    to: string;
  }>>;
  label?: string;
}

export default function DateFilter({
  dateRangeFilter,
  setDateRangeFilter,
  label = 'Date'
}: DateFilterProps) {
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.date-input') || target.closest('[role="dialog"]')) {
        return;
      }
      if (!target.closest('.date-filter')) {
        setIsDateFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="date-filter relative flex items-center gap-1"
      onClick={(e) => {
        // Stop clicks in the date filter from triggering parent row clicks
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <span>{label}</span>
      <button 
        onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
        className={`w-5 h-5 flex items-center justify-center rounded transition-all ${
          (dateRangeFilter.from || dateRangeFilter.to)
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
      
      {isDateFilterOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E4E4] w-[280px] p-3 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] leading-[18px] font-medium text-[#646462]">From</label>
              <input
                type="date"
                value={dateRangeFilter.from}
                onChange={(e) => {
                  e.stopPropagation();
                  setDateRangeFilter(prev => ({ ...prev, from: e.target.value }));
                }}
                className="date-input h-[32px] px-3 rounded-lg border border-[#E4E4E4] text-[14px] leading-[20px] font-['Inter'] font-normal text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] leading-[18px] font-medium text-[#646462]">To</label>
              <input
                type="date"
                value={dateRangeFilter.to}
                onChange={(e) => {
                  e.stopPropagation();
                  setDateRangeFilter(prev => ({ ...prev, to: e.target.value }));
                }}
                className="date-input h-[32px] px-3 rounded-lg border border-[#E4E4E4] text-[14px] leading-[20px] font-['Inter'] font-normal text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setDateRangeFilter({ from: '', to: '' });
                  setIsDateFilterOpen(false);
                }}
                className="text-[14px] leading-[20px] font-medium text-[#646462] hover:text-[#1A1A1A]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 